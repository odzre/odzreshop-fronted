import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { headers } from "next/headers"; // 🔥 TAMBAHAN

export async function POST(req: Request) {
  const apiUrl = process.env.NEXT_PRIVATE_API_URL;
  const apiKey = process.env.API_ACCESS_KEY ?? "";

  const session = await getServerSession(authOptions);
  if (!session || !session.user?.token) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await req.json();

  // 🔥 ambil device_id dari client
  const h = await headers();
  const deviceId = h.get("x-device-id") ?? "";

  if (!deviceId) {
    return NextResponse.json(
      { success: false, message: "Unauthorized (no device id)" },
      { status: 401 }
    );
  }

  try {
    const res = await fetch(`${apiUrl}/api/auth/update-profile`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.user.token}`,
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
        "X-Device-Id": deviceId, // 🔥 WAJIB
        Accept: "application/json"
      },
      body: JSON.stringify(body),
      cache: "no-store"
    });

    const backend = await res.json();
    return NextResponse.json(backend, { status: res.status });
  } catch (error: any) {
    console.error("❌ /api/auth/update-profile error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengupdate profil",
        error: String(error)
      },
      { status: 500 }
    );
  }
}