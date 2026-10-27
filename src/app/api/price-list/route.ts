import { NextResponse } from "next/server";

export async function GET() {
    const apiUrl = process.env.NEXT_PRIVATE_API_URL;
    const apiKey = process.env.API_ACCESS_KEY ?? "";
    
    const res = await fetch(`${apiUrl}/api/price-list`, {
        headers: {
            "X-API-KEY": apiKey,
            "Accept": "application/json",
        },
    });

    if (!res.ok) {
        return NextResponse.json({ error: "Failed to fetch price product" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
}