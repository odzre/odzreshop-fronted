import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        const token = session?.user?.token;

        if (!token) {
            return NextResponse.json(
                { error: true, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const apiUrl = process.env.NEXT_PRIVATE_API_URL;
        const apiKey = process.env.API_ACCESS_KEY ?? "";

        // 🔥 ambil header dari client
        const h = await headers();
        const deviceId = h.get("x-device-id") ?? "";

        const res = await fetch(`${apiUrl}/api/account-access`, {
            headers: {
                Authorization: `Bearer ${token}`,
                "X-API-KEY": apiKey,
                "X-Device-Id": deviceId, // 🔥 FIX UTAMA
                Accept: "application/json",
                "Cache-Control": "no-store"
            },
            cache: "no-store"
        });

        const data = await res.json();

        return NextResponse.json(data);

    } catch (error) {
        console.error("💥 [GET /api/account-access] Error:", error);

        return NextResponse.json(
            { error: true, message: "Server error" },
            { status: 500 }
        );
    }
}