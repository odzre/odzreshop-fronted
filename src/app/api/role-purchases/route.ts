import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { headers } from "next/headers";

const API_KEY_HEADER = () => ({
    "X-API-KEY": process.env.API_ACCESS_KEY ?? "",
    Accept: "application/json"
});

/**
 * GET /api/role-purchases/prices — harga role (public)
 */
export async function GET() {
    const apiUrl = process.env.NEXT_PRIVATE_API_URL;

    try {
        const res = await fetch(`${apiUrl}/api/role-purchases/prices`, {
            headers: API_KEY_HEADER(),
            next: { revalidate: 30 }
        });

        const backend = await res.json();
        return NextResponse.json(backend, { status: res.status });
    } catch (error) {
        console.error("RolePurchase prices Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch role prices" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/role-purchases — beli role (saldo / gateway)
 */
export async function POST(req: Request) {
    const apiUrl = process.env.NEXT_PRIVATE_API_URL;

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

    const body = await req.json();
    const { role, payment_mode, method_code } = body;

    if (!role || !payment_mode) {
        return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    try {
        const res = await fetch(`${apiUrl}/api/role-purchases`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${session.user.token}`,
                "X-API-KEY": process.env.API_ACCESS_KEY ?? "",
                "X-Device-Id": deviceId,
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ role, payment_mode, method_code }),
            cache: "no-store"
        });

        const backend = await res.json();
        return NextResponse.json(backend, { status: res.status });
    } catch (error) {
        console.error("RolePurchase POST Error:", error);
        return NextResponse.json(
            { error: "Failed to purchase role" },
            { status: 500 }
        );
    }
}
