import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * ✅ GET - Ambil detail deposit
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ invoice: string }> }
) {
  const { invoice } = await context.params;

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
    const res = await fetch(`${apiUrl}/api/deposit/${invoice}`, {
      headers: {
        Authorization: `Bearer ${session.user.token}`,
        "X-API-KEY": apiKey,
        "X-Device-Id": deviceId,
        Accept: "application/json"
      },
      cache: "no-store"
    });

    const backend = await res.json();
    return NextResponse.json(backend, { status: res.status });
  } catch (error) {
    console.error("Deposit detail error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

/**
 * 🔥 POST - Cancel deposit
 */
export async function POST(
  request: Request,
  context: { params: Promise<{ invoice: string }> }
) {
  const { invoice } = await context.params;

  const apiUrl = process.env.NEXT_PRIVATE_API_URL;
  const apiKey = process.env.API_ACCESS_KEY ?? "";

  const session = await getServerSession(authOptions);
  if (!session || !session.user?.token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 🔥 ambil device_id
  const h = await headers();
  const deviceId = h.get("x-device-id") ?? "";

  if (!deviceId) {
    return NextResponse.json(
      { error: "Unauthorized (no device id)" },
      { status: 401 }
    );
  }

  try {
    const res = await fetch(`${apiUrl}/api/deposit/${invoice}/cancel`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.user.token}`,
        "X-API-KEY": apiKey,
        "X-Device-Id": deviceId, // 🔥 TAMBAHAN
        Accept: "application/json"
      }
    });

    const backend = await res.json();
    return NextResponse.json(backend, { status: res.status });
  } catch (error) {
    console.error("Deposit cancel error:", error);

    return NextResponse.json(
      { success: false, message: "Gagal membatalkan deposit" },
      { status: 500 }
    );
  }
}