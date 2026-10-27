import { NextResponse } from "next/server";

export async function GET(req: Request, context: any) {
  try {
    const slug = context.params?.slug;

    if (!slug) {
      return NextResponse.json(
        { message: "Slug tidak ditemukan" },
        { status: 400 }
      );
    }

    const apiUrl = process.env.NEXT_PRIVATE_API_URL;
    const apiKey = process.env.API_ACCESS_KEY ?? "";

    if (!apiUrl) {
      return NextResponse.json(
        { message: "API URL not configured" },
        { status: 500 }
      );
    }

    const res = await fetch(`${apiUrl}/api/blogs/${slug}`, {
      headers: {
        "X-API-KEY": apiKey,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { message: "Blog tidak ditemukan" },
        { status: res.status }
      );
    }

    const data = await res.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("BLOG DETAIL API ERROR:", error);

    return NextResponse.json(
      { message: "Terjadi kesalahan saat mengambil blog" },
      { status: 500 }
    );
  }
}