import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // path auth kamu

export async function POST(req: Request) {
  const apiUrl = process.env.NEXT_PRIVATE_API_URL!;
  const apiKey = process.env.API_ACCESS_KEY ?? "";

  try {
    const body = await req.json();

    // ✅ ambil session langsung
    const session = await getServerSession(authOptions);

    const userPayload = session?.user
      ? {
        id: session.user.id,
        email: session.user.email,
        role: session.user.role,
        name: session.user.name,
      }
      : null;

    const res = await fetch(`${apiUrl}/api/voucher/check`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
      body: JSON.stringify({
        ...body,
        auth_user: userPayload, // ✅ kirim langsung user
      }),
    });

    const data = await res.json();

    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    console.error(e);

    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}