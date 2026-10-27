import { NextResponse } from "next/server";

/**
 * PRIVATE PROXY
 * Frontend → Next API → Laravel API (pakai API KEY)
 *
 * User TIDAK pernah melihat API backend asli.
 */

export async function GET() {
    try {
        const apiUrl = process.env.NEXT_PRIVATE_API_URL;
        const apiKey = process.env.API_ACCESS_KEY;
        const publicApi = process.env.NEXT_PUBLIC_API_URL;

        if (!apiUrl || !apiKey || !publicApi) {
            return NextResponse.json(
                { error: "Server environment not configured" },
                { status: 500 }
            );
        }

        /* ================= FETCH BACKEND ================= */
        const res = await fetch(`${apiUrl}/api/payment-methods`, {
            headers: {
                "X-API-KEY": apiKey,
                Accept: "application/json",
            },

            // ✅ cache di server (10 menit)
            next: { revalidate: 600 },
        });

        if (!res.ok) {
            return NextResponse.json(
                { error: "Failed to fetch payment methods" },
                { status: res.status }
            );
        }

        const json = await res.json();

        /* ================= NORMALIZE DATA ================= */

        /**
         * IMPORTANT:
         * - image dari backend = payment/xxx.webp
         * - next/image BUTUH absolute URL
         */
        const normalized = (json.data ?? []).map((m: any) => ({
            id: m.id,
            name: m.name,
            group: m.group,
            type: m.type,

            // ✅ FIX IMAGE PATH
            images: m.images
                ? m.images.startsWith("http")
                    ? m.images
                    : `${publicApi}/storage/${m.images}`
                : null,
        }));

        /* ================= RETURN SAFE DATA ================= */

        return NextResponse.json(
            {
                success: true,
                data: normalized,
            },
            {
                headers: {
                    // cache browser 10 menit
                    "Cache-Control":
                        "public, s-maxage=600, stale-while-revalidate=60",
                },
            }
        );
    } catch (error) {
        console.error("Payment methods proxy error:", error);

        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}