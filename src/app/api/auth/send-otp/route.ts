import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { headers } from "next/headers"; // 🔥 TAMBAHAN

/**
 * ✅ Kirim OTP ke WhatsApp user
 * Endpoint: /api/auth/send-otp
 */
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

  try {
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

    const res = await fetch(`${apiUrl}/api/send-otp`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.user.token}`,
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
        "X-Device-Id": deviceId, // 🔥 WAJIB
        Accept: "application/json"
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    console.error("Send OTP error:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}