import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * GET /api/role-purchases/[invoice] — status invoice (polling)
 */
export async function GET(
    _req: Request,
    { params }: { params: Promise<{ invoice: string }> }
) {
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

    const { invoice } = await params;

    try {
        const res = await fetch(
            `${process.env.NEXT_PRIVATE_API_URL}/api/role-purchases/${invoice}`,
            {
                headers: {
                    Authorization: `Bearer ${session.user.token}`,
                    "X-API-KEY": process.env.API_ACCESS_KEY ?? "",
                    "X-Device-Id": deviceId,
                    Accept: "application/json"
                },
                cache: "no-store"
            }
        );

        const backend = await res.json();
        return NextResponse.json(backend, { status: res.status });
    } catch (error) {
        console.error("RolePurchase show Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch role purchase" },
            { status: 500 }
        );
    }
}
