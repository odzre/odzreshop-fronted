import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const productName = searchParams.get("product_name");
    const limit = searchParams.get("limit") ?? "6";

    if (!productName) {
        return NextResponse.json(
            { status: false, message: "product_name wajib diisi" },
            { status: 400 }
        );
    }

    const url =
        `${process.env.NEXT_PRIVATE_API_URL}` +
        `/api/reviews/latest?product_name=${encodeURIComponent(productName)}&limit=${limit}`;

    const res = await fetch(url, {
        headers: {
            "X-API-KEY": process.env.API_ACCESS_KEY ?? ""
        },
        cache: "no-store"
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
}
