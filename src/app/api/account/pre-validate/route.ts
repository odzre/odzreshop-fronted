import { NextRequest, NextResponse } from "next/server";

// 🔥 Optional: simple in-memory rate limit (basic)
const rateLimitMap = new Map<string, { count: number; time: number }>();
const RATE_LIMIT = 20; // max request
const WINDOW_MS = 60 * 1000; // 1 menit

function isRateLimited(ip: string) {
    const now = Date.now();
    const data = rateLimitMap.get(ip);

    if (!data) {
        rateLimitMap.set(ip, { count: 1, time: now });
        return false;
    }

    if (now - data.time > WINDOW_MS) {
        rateLimitMap.set(ip, { count: 1, time: now });
        return false;
    }

    data.count++;
    if (data.count > RATE_LIMIT) return true;

    return false;
}

export async function POST(req: NextRequest) {
    try {
        // 🔒 Rate limit
        const ip =
            req.headers.get("x-forwarded-for") ||
            req.headers.get("x-real-ip") ||
            "unknown";

        if (isRateLimited(ip)) {
            return NextResponse.json(
                { status: "error", message: "Too many requests" },
                { status: 429 }
            );
        }

        // 🔒 Parse body
        const body = await req.json();
        const { id, server, slug } = body;

        // 🔒 Validasi input
        if (!id || !slug) {
            return NextResponse.json(
                { status: "error", message: "Missing parameters" },
                { status: 400 }
            );
        }

        // optional: validasi format id (anti brute force sampah)
        if (!/^\d{5,}$/.test(id)) {
            return NextResponse.json(
                { status: "error", message: "Invalid ID format" },
                { status: 400 }
            );
        }

        const apiUrl = process.env.NEXT_PRIVATE_API_URL;
        const apiKey = process.env.API_ACCESS_KEY;

        if (!apiUrl || !apiKey) {
            return NextResponse.json(
                { status: "error", message: "Server misconfigured" },
                { status: 500 }
            );
        }

        // 🔥 Call Laravel (PRIVATE API)
        const res = await fetch(`${apiUrl}/api/prevalidate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "x-api-key": apiKey, // 🔐 SECRET (tidak expose ke client)
            },
            body: JSON.stringify({
                slug,
                user_id: id,
                server: server || null,
            }),
            cache: "no-store",
        });

        const data = await res.json();

        // 🔒 Handle error dari backend
        if (!res.ok || data.status !== "success") {
            return NextResponse.json(
                {
                    status: "error",
                    message: data?.message || "Validation failed",
                },
                { status: res.status || 500 }
            );
        }

        // ✅ Return hasil
        return NextResponse.json({
            status: "success",
            message: data.message || null,
            result: data.result || {},
        });

    } catch (err) {
        return NextResponse.json(
            { status: "error", message: "Server error" },
            { status: 500 }
        );
    }
}