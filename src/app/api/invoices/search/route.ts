import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("order_id");
  const apiUrl = process.env.NEXT_PRIVATE_API_URL;
  const apiKey = process.env.API_ACCESS_KEY;

  if (!orderId) {
    return NextResponse.json({ error: "Nomor invoice tidak boleh kosong!" }, { status: 400 });
  }

  try {
    const response = await fetch(`${apiUrl}/api/invoices/search?order_id=${encodeURIComponent(orderId)}`, {
      headers: {
        "X-API-KEY": apiKey!,
        "Accept": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Error ${response.status}`);
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Terjadi kesalahan saat mencari invoice." }, { status: 500 });
  }
}