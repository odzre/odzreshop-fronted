import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const imagePath = url.searchParams.get("path");

    if (!imagePath) {
      return NextResponse.json(
        { error: "No image path provided" },
        { status: 400 }
      );
    }

    const backendURL = `${process.env.NEXT_PRIVATE_API_URL}/storage/${imagePath}`;
    const imageRes = await fetch(backendURL);

    if (!imageRes.ok) {
      return NextResponse.json(
        { error: "Image not found" },
        { status: 404 }
      );
    }

    const imageBuffer = await imageRes.arrayBuffer();

    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type":
          imageRes.headers.get("content-type") || "image/png",
        "Access-Control-Allow-Origin": "*", // 🔑 fix CORS
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
