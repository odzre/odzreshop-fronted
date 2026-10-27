import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {

  const url = request.nextUrl.clone();

  try {

    const res = await fetch(`${request.nextUrl.origin}/api/settings`, {
      cache: "no-store"
    });

    const json = await res.json();
    const isMaintenance = json?.data?.["maintenance.isMaintenance"];

    // jika maintenance aktif
    if (isMaintenance) {

      if (!url.pathname.startsWith("/maintenance")) {
        url.pathname = "/maintenance";
        return NextResponse.redirect(url);
      }

    }

    // jika maintenance tidak aktif
    else {

      if (url.pathname.startsWith("/maintenance")) {
        url.pathname = "/";
        return NextResponse.redirect(url);
      }

    }

  } catch (error) {
    console.error("maintenance middleware error", error);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api).*)",
  ],
};