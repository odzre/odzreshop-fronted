import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    // ✅ kalau kosong → langsung return kosong (tidak hit backend)
    if (!search) {
        return NextResponse.json({ games: [] });
    }

    try {
        const res = await fetch(
            `${process.env.NEXT_PRIVATE_API_URL}/api/search-games?search=${search}`,
            {
                headers: {
                    "X-API-KEY": process.env.API_ACCESS_KEY ?? "",
                    "Accept": "application/json",
                },
                cache: "no-store"
            }
        );

        if (!res.ok) {
            throw new Error("Failed fetch search");
        }

        const data = await res.json();

        return NextResponse.json({
            games: data.games || []
        });

    } catch (error) {
        return NextResponse.json(
            { games: [] },
            { status: 500 }
        );
    }
}