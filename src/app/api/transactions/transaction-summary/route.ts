import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { headers } from "next/headers"; // 🔥 tambah ini

export async function GET() {
    const session = await getServerSession(authOptions);
    const token = session?.user?.token;

    const headersList = await headers();
    const deviceId = headersList.get("x-device-id") ?? "";

    if (!token) {
        return NextResponse.json({ error: "Unauthorized (no token)" }, { status: 401 });
    }

    if (!deviceId) {
        return NextResponse.json({ error: "Unauthorized (no device id)" }, { status: 401 });
    }

    const apiUrl = process.env.NEXT_PRIVATE_API_URL;
    const apiKey = process.env.API_ACCESS_KEY ?? "";

    if (!apiUrl || !apiKey) {
        return NextResponse.json({ error: "Missing API configuration" }, { status: 500 });
    }

    try {
        const res = await fetch(`${apiUrl}/api/transaction-summary`, {
            headers: {
                "X-API-KEY": apiKey,
                "Accept": "application/json",
                "Content-Type": "application/json",
                "X-Device-Id": deviceId, // 🔥 WAJIB
                Authorization: `Bearer ${token}`,
            },
        });

        // 🔥 handle 401 biar jelas
        if (res.status === 401) {
            const text = await res.text();
            return NextResponse.json(
                { error: `Unauthorized from API: ${text}` },
                { status: 401 }
            );
        }

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`API Error ${res.status}: ${text}`);
        }

        const data = await res.json();
        return NextResponse.json(data);

    } catch (error) {
        let errorMessage = "Something went wrong";

        if (error instanceof Error) {
            errorMessage = error.message;
        }

        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}