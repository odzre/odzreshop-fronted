import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * ✅ GET - Ambil daftar metode deposit & riwayat user
 * Endpoint: /api/deposit
 */
export async function GET() {
    const apiUrl = process.env.NEXT_PRIVATE_API_URL;
    const apiKey = process.env.API_ACCESS_KEY ?? "";

    const session = await getServerSession(authOptions);
    if (!session || !session.user?.token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 🔥 ambil device_id dari request
    const h = await headers();
    const deviceId = h.get("x-device-id") ?? "";

    if (!deviceId) {
        return NextResponse.json(
            { error: "Unauthorized (no device id)" },
            { status: 401 }
        );
    }

    try {
        const res = await fetch(`${apiUrl}/api/deposit`, {
            headers: {
                Authorization: `Bearer ${session.user.token}`,
                "X-API-KEY": apiKey,
                "X-Device-Id": deviceId,
                Accept: "application/json"
            },
            cache: "no-store"
        });

        const backend = await res.json();

        const cleaned = {
            success: backend?.success ?? false,
            message: backend?.message ?? null,
            data: {
                methods: backend?.data?.methods ?? [],
                deposits: backend?.data?.deposits
                    ? {
                        data: backend.data.deposits.data ?? [],
                        current_page: backend.data.deposits.current_page ?? 1,
                        last_page: backend.data.deposits.last_page ?? 1,
                        total: backend.data.deposits.total ?? 0
                    }
                    : { data: [], current_page: 1, last_page: 1, total: 0 }
            }
        };

        return NextResponse.json(cleaned, { status: res.status });
    } catch (error) {
        console.error("Deposit GET Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch deposit data" },
            { status: 500 }
        );
    }
}

/**
 * ✅ POST - Buat transaksi deposit baru
 * Endpoint: /api/deposit
 */
export async function POST(req: Request) {
    const apiUrl = process.env.NEXT_PRIVATE_API_URL;
    const apiKey = process.env.API_ACCESS_KEY ?? "";

    const session = await getServerSession(authOptions);
    if (!session || !session.user?.token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 🔥 ambil device_id dari request
    const h = await headers();
    const deviceId = h.get("x-device-id") ?? "";

    if (!deviceId) {
        return NextResponse.json(
            { error: "Unauthorized (no device id)" },
            { status: 401 }
        );
    }

    const body = await req.json();
    const { amount, method_code } = body;

    if (!amount || !method_code) {
        return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    try {
        const res = await fetch(`${apiUrl}/api/deposit`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${session.user.token}`,
                "X-API-KEY": apiKey,
                "X-Device-Id": deviceId, // 🔥 TAMBAHAN
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ amount, method_code })
        });

        const backend = await res.json();
        return NextResponse.json(backend, { status: res.status });
    } catch (error) {
        console.error("Deposit POST Error:", error);
        return NextResponse.json(
            { error: "Failed to create deposit" },
            { status: 500 }
        );
    }
}