import { NextResponse } from "next/server";

export async function GET() {
    const apiUrl = process.env.NEXT_PRIVATE_API_URL;
    const apiKey = process.env.API_ACCESS_KEY ?? "";

    try {
        const res = await fetch(`${apiUrl}/api/social-proof`, {
            headers: {
                "X-API-KEY": apiKey,
                "Accept": "application/json",
            },
            cache: "no-store",
        });

        if (!res.ok) {
            return NextResponse.json(
                { error: "Failed to fetch social proof" },
                { status: res.status }
            );
        }

        const data = await res.json();

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { error: "Server error" },
            { status: 500 }
        );
    }
}