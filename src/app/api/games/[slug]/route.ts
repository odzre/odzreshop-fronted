import { NextResponse } from "next/server";

type Params = { slug: string };

export async function GET(req: Request,
  context: { params: Promise<Params> }
) {
    const { slug } = await context.params;

    if (!slug) {
        return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    try {
        const apiUrl = `${process.env.NEXT_PRIVATE_API_URL}/api/games/${slug}`;
        const res = await fetch(apiUrl, {
            headers: {
                "X-API-KEY": process.env.API_ACCESS_KEY ?? "",
                "Accept": "application/json",
            },
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch game data: ${res.statusText}`);
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}