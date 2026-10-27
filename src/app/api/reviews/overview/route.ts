import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const productName = searchParams.get("product_name");

    if (!productName) {
        return NextResponse.json(
            { error: true, message: "product_name wajib diisi" },
            { status: 400 }
        );
    }

    try {
        const url =
            `${process.env.NEXT_PRIVATE_API_URL}` +
            `/api/reviews/overview?product_name=${encodeURIComponent(productName)}`;

        const res = await fetch(url, {
            headers: {
                "X-API-KEY": process.env.API_ACCESS_KEY ?? ""
            },
            cache: "no-store" // rating harus fresh
        });

        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (err) {
        console.error("❌ Error GET /api/reviews/overview:", err);
        return NextResponse.json(
            { error: true, message: "Gagal memuat review overview" },
            { status: 500 }
        );
    }
}
