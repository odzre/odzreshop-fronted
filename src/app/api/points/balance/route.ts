import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * GET - Ambil saldo point + konfigurasi
 */
export async function GET() {
  const apiUrl = process.env.NEXT_PRIVATE_API_URL;
  const apiKey = process.env.API_ACCESS_KEY ?? "";

  const session = await getServerSession(authOptions);
  if (!session || !session.user?.token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const h = await headers();
  const deviceId = h.get("x-device-id") ?? "";

  if (!deviceId) {
    return NextResponse.json(
      { error: "Unauthorized (no device id)" },
      { status: 401 }
    );
  }

  try {
    const res = await fetch(`${apiUrl}/api/points/balance`, {
      headers: {
        Authorization: `Bearer ${session.user.token}`,
        "X-API-KEY": apiKey,
        "X-Device-Id": deviceId,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const backend = await res.json();
    return NextResponse.json(backend);
  } catch (error) {
    console.error("Error fetching points balance:", error);
    return NextResponse.json({ success: false, message: "Server error" });
  }
}
