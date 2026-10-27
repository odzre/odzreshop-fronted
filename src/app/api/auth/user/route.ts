import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { headers } from "next/headers"; // 🔥 WAJIB

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        const token = session?.user?.token;

        if (!token) {
            return NextResponse.json(
                { success: false, message: "Unauthorized — token tidak ditemukan" },
                { status: 401 }
            );
        }

        const apiUrl = process.env.NEXT_PRIVATE_API_URL;
        const apiKey = process.env.API_ACCESS_KEY ?? "";

        // 🔥 ambil device_id dari browser
        const h = await headers();
        const deviceId = h.get("x-device-id") ?? "";

        const res = await fetch(`${apiUrl}/api/auth/user`, {
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

        if (!res.ok) {
            return NextResponse.json(
                { success: false, message: data?.message ?? "Gagal ambil data user" },
                { status: res.status }
            );
        }

        return NextResponse.json({
            success: true,
            user: data.user || data
        });

    } catch (error: any) {
        console.error("💥 [GET /api/auth/user] Error:", error);

        return NextResponse.json(
            { success: false, message: "Terjadi kesalahan server" },
            { status: 500 }
        );
    }
}