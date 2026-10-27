import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function GET() {
    try {
        const apiUrl = process.env.NEXT_PRIVATE_API_URL!;
        const apiKey = process.env.API_ACCESS_KEY ?? "";

        // 🔥 Next.js 15 wajib await
        const h = await headers();
        const deviceId = h.get("x-device-id") ?? "";

        const res = await fetch(`${apiUrl}/api/client-info`, {
            headers: {
                "X-API-KEY": apiKey,
                "Accept": "application/json",

                // ✅ USER AGENT ASLI
                "User-Agent": h.get("user-agent") ?? "",
                "X-Device-Id": deviceId,


                // ✅ IP ASLI (prioritas Cloudflare)
                "X-Forwarded-For":
                    h.get("cf-connecting-ip") ||
                    h.get("x-forwarded-for") ||
                    h.get("x-real-ip") ||
                    "",

                "CF-Connecting-IP": h.get("cf-connecting-ip") ?? "",
            },
            cache: "no-store",
        });

        if (!res.ok) {
            return NextResponse.json(
                { error: true, message: "Backend error" },
                { status: res.status }
            );
        }

        const data = await res.json();

        return NextResponse.json(data);

    } catch (error) {
        console.error("💥 client-info error:", error);

        return NextResponse.json(
            { error: true, message: "Server error" },
            { status: 500 }
        );
    }
}