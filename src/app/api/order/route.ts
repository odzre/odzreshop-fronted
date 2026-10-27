import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { headers } from "next/headers"; // 🔥 TAMBAH

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const token = session?.user?.token || null;

    const h = await headers(); // 🔥 TAMBAH
    const deviceId = h.get("x-device-id") ?? ""; // 🔥 TAMBAH

    const body = await req.json();

    // --- Validasi awal
    if (
      !body.game ||
      !body.product_id ||
      !body.payment_method_id ||
      !body.whatsapp
    ) {
      return NextResponse.json(
        { message: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    // --- Ambil data produk asli dari backend
    const gameRes = await fetch(
      `${process.env.NEXT_PRIVATE_API_URL}/api/games/${body.game}`,
      { headers: { "X-API-KEY": process.env.API_ACCESS_KEY! } }
    );

    if (!gameRes.ok) {
      return NextResponse.json(
        { message: "Gagal memuat data produk." },
        { status: 500 }
      );
    }

    const gameData = await gameRes.json();
    const products = gameData?.products || [];
    const product = products.find((p: any) => p.id === Number(body.product_id));

    if (!product) {
      return NextResponse.json(
        { message: "Produk tidak ditemukan." },
        { status: 404 }
      );
    }

    // --- Hitung ulang harga (sesuai role user)
    const quantity = Math.max(1, Number(body.quantity ?? 1));
    const role = session?.user?.role;
    const sellingPrice =
      role === "gold"
        ? (product.selling_price_gold ?? product.selling_price)
        : role === "platinum"
          ? (product.selling_price_platinum ?? product.selling_price)
          : role === "basic"
            ? product.selling_price
            : (product.selling_price_guest || product.selling_price); // guest
    const basePrice = product.promo_price ?? sellingPrice;
    const subtotal = basePrice * quantity;
    const voucherDiscount = Math.max(0, Number(body.voucher_discount ?? 0));
    const fee = Math.max(0, Number(body.fee ?? 0));
    const finalPrice = Math.max(0, subtotal - voucherDiscount + fee);

    if (finalPrice < 1000) {
      return NextResponse.json(
        { message: "Harga tidak valid, transaksi diblokir." },
        { status: 400 }
      );
    }

    const orderData = {
      game: body.game,
      product_id: body.product_id,
      payment_method_id: body.payment_method_id,
      whatsapp: body.whatsapp,
      email: body.email || null,
      id: body.id || null,
      server: body.server || null,
      nickname: body.nickname || null,
      voucher_code: body.voucher_code || null,
      order_inputs: body.order_inputs || null,
      quantity,
      fee,
      voucher_discount: voucherDiscount,
      total_price: finalPrice
    };

    const apiUrl = `${process.env.NEXT_PRIVATE_API_URL}/api/orders`;

    const headersReq: HeadersInit = {
      "X-API-KEY": process.env.API_ACCESS_KEY!,
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Device-Id": deviceId, // 🔥 FIX UTAMA
    };

    if (token) {
      headersReq["Authorization"] = `Bearer ${token}`; // 🔥 FIX TOKEN
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: headersReq,
      body: JSON.stringify(orderData)
    });

    if (!response.ok) {
      const errorRes = await response.json().catch(() => ({}));

      return NextResponse.json(
        {
          message:
            errorRes.error_msg ||
            errorRes.message ||
            "Terjadi kesalahan dari server",
        },
        { status: response.status }
      );
    }

    const result = await response.json();

    return NextResponse.json(
      { message: "Pesanan berhasil dibuat!", data: result },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: "Terjadi kesalahan", error: error.message },
      { status: 500 }
    );
  }
}