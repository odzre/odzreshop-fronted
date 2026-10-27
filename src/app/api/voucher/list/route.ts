import { NextResponse } from "next/server";

export async function GET() {
  const apiUrl = process.env.NEXT_PRIVATE_API_URL;
  const apiKey = process.env.API_ACCESS_KEY ?? "";

  try {
    const res = await fetch(`${apiUrl}/api/voucher/list`, {
      method: "GET",
      headers: {
        "X-API-KEY": apiKey,
        Accept: "application/json"
      }
    });

    if (!res.ok) {
      return NextResponse.json(
        { success: false, message: "Failed to fetch voucher list" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("❌ Voucher List Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
