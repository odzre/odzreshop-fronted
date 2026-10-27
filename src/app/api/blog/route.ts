import { NextResponse } from "next/server";

export async function GET() {
    try {
        const apiUrl = process.env.NEXT_PRIVATE_API_URL;
        const apiKey = process.env.API_ACCESS_KEY ?? "";

        if (!apiUrl) {
            return NextResponse.json(
                { error: "API URL not configured" },
                { status: 500 }
            );
        }

        const res = await fetch(`${apiUrl}/api/blogs`, {
            method: "GET",
            headers: {
                "X-API-KEY": apiKey,
                Accept: "application/json",
            },
            cache: "no-store", // biar selalu fresh
        });

        if (!res.ok) {
            return NextResponse.json(
                { error: "Failed to fetch blogs" },
                { status: res.status }
            );
        }

        const data = await res.json();

        return NextResponse.json(data, {
            status: 200,
        });
    } catch (error) {
        console.error("BLOG API ERROR:", error);

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}