import { NextResponse } from "next/server";

export async function GET() {
    try {
        const apiUrl = `${process.env.NEXT_PRIVATE_API_URL}/api/settings`;
        const res = await fetch(apiUrl, {
            headers: {
                "X-API-KEY": process.env.API_ACCESS_KEY ?? "",
                Accept: "application/json"
            }
        });

        if (!res.ok) throw new Error("Failed to fetch settings");

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch settings" },
            { status: 500 }
        );
    }
}
