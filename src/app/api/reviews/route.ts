import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);

    const orderId = searchParams.get("order_id");
    const page = searchParams.get("page");
    const limit = searchParams.get("limit");

    let url = `${process.env.NEXT_PRIVATE_API_URL}/api/reviews`;

    // 🔹 priority 1: order_id (popup invoice)
    if (orderId) {
        url += `?order_id=${encodeURIComponent(orderId)}`;
    } else {
        const params = new URLSearchParams();

        if (page) params.append("page", page);
        if (limit) params.append("limit", limit);

        const qs = params.toString();
        if (qs) url += `?${qs}`;
    }

    try {
        const res = await fetch(url, {
            headers: {
                "X-API-KEY": process.env.API_ACCESS_KEY ?? ""
            },
            cache: "no-store"
        });

        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (err) {
        console.error("❌ Error GET /api/reviews:", err);
        return NextResponse.json(
            { status: false, message: "Gagal memuat review." },
            { status: 500 }
        );
    }
}

// 🔹 POST: kirim review baru (TIDAK DIUBAH)
export async function POST(req: Request) {
    try {
        const body = await req.json();

        const res = await fetch(
            `${process.env.NEXT_PRIVATE_API_URL}/api/reviews`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-API-KEY": process.env.API_ACCESS_KEY ?? ""
                },
                body: JSON.stringify(body)
            }
        );

        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (err) {
        console.error("❌ Error POST /api/reviews:", err);
        return NextResponse.json(
            { status: false, message: "Gagal mengirim review." },
            { status: 500 }
        );
    }
}
