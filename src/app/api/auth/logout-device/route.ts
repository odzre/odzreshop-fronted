import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const token = session?.user?.token;

        if (!token) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await req.json();

        const apiUrl = process.env.NEXT_PRIVATE_API_URL;
        const apiKey = process.env.API_ACCESS_KEY ?? "";

        // 🔥 ambil device_id dari client
        const h = await headers();
        const deviceId = h.get("x-device-id") ?? "";

        const res = await fetch(`${apiUrl}/api/logout-device`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "X-API-KEY": apiKey,
                "Content-Type": "application/json",
                Accept: "application/json",
                "X-Device-Id": deviceId, // 🔥 WAJIB
            },
            body: JSON.stringify(body),
        });

        const data = await res.json();

        return NextResponse.json(data);

    } catch (error) {
        console.error("💥 [POST /api/logout-device] Error:", error);

        return NextResponse.json(
            { success: false, message: "Server error" },
            { status: 500 }
        );
    }
}