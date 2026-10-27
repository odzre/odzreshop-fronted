import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { headers } from "next/headers"; // 🔥 TAMBAHAN

/**
 * ✅ GET - Ambil data mutasi saldo user (SaldoLog)
 * Endpoint: /api/mutation
 */
export async function GET(req: Request) {
  const apiUrl = process.env.NEXT_PRIVATE_API_URL;
  const apiKey = process.env.API_ACCESS_KEY ?? "";

  const session = await getServerSession(authOptions);
  if (!session || !session.user?.token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 🔥 ambil device_id dari client
  const h = await headers();
  const deviceId = h.get("x-device-id") ?? "";

  if (!deviceId) {
    return NextResponse.json(
      { error: "Unauthorized (no device id)" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const date = searchParams.get("date") || "";

  try {
    const res = await fetch(
      `${apiUrl}/api/mutation?search=${search}&date=${date}`,
      {
        headers: {
          Authorization: `Bearer ${session.user.token}`,
          "X-API-KEY": apiKey,
          "X-Device-Id": deviceId, // 🔥 WAJIB
          Accept: "application/json"
        },
        cache: "no-store"
      }
    );

    const backend = await res.json();
    return NextResponse.json(backend);
  } catch (error) {
    console.error("Error fetching mutation:", error);
    return NextResponse.json({ success: false, message: "Server error" });
  }
}