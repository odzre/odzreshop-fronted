import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);

    const page = searchParams.get("page") ?? "1";
    const limit = searchParams.get("limit") ?? "10";

    const url =
        `${process.env.NEXT_PRIVATE_API_URL}/api/reviews/paginated`
        + `?page=${page}&limit=${limit}`;

    try {
        const res = await fetch(url, {
            headers: {
                "X-API-KEY": process.env.API_ACCESS_KEY ?? ""
            }
        });

        const data = await res.json();
        return NextResponse.json(data);
    } catch (e) {
        return NextResponse.json(
            { error: true, message: "Gagal memuat review" },
            { status: 500 }
        );
    }
}
