import { NextResponse } from "next/server";

export async function GET() {
    const apiUrl = process.env.NEXT_PRIVATE_API_URL;
    const apiKey = process.env.API_ACCESS_KEY ?? "";

    try {
        const res = await fetch(`${apiUrl}/api/auth/recaptcha-config`, {
            headers: {
                "X-API-KEY": apiKey,
                Accept: "application/json",
            },
            next: { revalidate: 300 },
        });

        const data = await res.json();
        return NextResponse.json(data);
    } catch (err: any) {
        console.error("reCAPTCHA config error:", err);
        return NextResponse.json(
            { success: false, active: false, site_key: "" },
            { status: 200 }
        );
    }
}
