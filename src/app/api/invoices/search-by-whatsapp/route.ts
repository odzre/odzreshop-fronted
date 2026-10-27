import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const whatsapp = searchParams.get("whatsapp");
  const apiUrl = process.env.NEXT_PRIVATE_API_URL;
  const apiKey = process.env.API_ACCESS_KEY;

  if (!whatsapp) {
    return NextResponse.json({ error: "Nomor whatsapp tidak boleh kosong!" }, { status: 400 });
  }

  try {
    const response = await fetch(`${apiUrl}/api/invoices/search-by-whatsapp?whatsapp=${whatsapp}`, {
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