import { NextResponse } from "next/server";

type Params = { orderId: string };

export async function GET(
  req: Request,
  context: { params: Promise<Params> }
) {
  try {
    const { orderId } = await context.params;

    if (!orderId) {
      return NextResponse.json(
        { message: "Order ID tidak ditemukan" },
        { status: 400 }
      );
    }

    const apiUrl = `${process.env.NEXT_PRIVATE_API_URL}/api/orders/${orderId}`;
    const apiKey = process.env.API_ACCESS_KEY;

    const res = await fetch(apiUrl, {
      headers: {
        "X-API-KEY": apiKey!,
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { message: "Pesanan tidak ditemukan" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat mengambil pesanan" },
      { status: 500 }
    );
  }
}