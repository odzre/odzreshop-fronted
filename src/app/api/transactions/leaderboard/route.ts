import { NextResponse } from "next/server";

export async function GET() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3000";
  const apiKey = process.env.API_ACCESS_KEY || "11223344";

  try {
    // fetch leaderboard
    const leaderboardRes = await fetch(
      `${apiUrl}/api/transactions/leaderboard`,
      {
        headers: {
          "X-API-KEY": apiKey,
          Accept: "application/json"
        }
      }
    );

    if (!leaderboardRes.ok) {
      return NextResponse.json(
        { error: "Failed to fetch leaderboard", status: leaderboardRes.status },
        { status: leaderboardRes.status }
      );
    }

    const leaderboardData = await leaderboardRes.json();

    // fetch settings
    const settingsRes = await fetch(`${apiUrl}/api/settings`, {
      headers: {
        "X-API-KEY": apiKey,
        Accept: "application/json"
      }
    });

    if (!settingsRes.ok) {
      return NextResponse.json(
        { error: "Failed to fetch settings", status: settingsRes.status },
        { status: settingsRes.status }
      );
    }

    const settingsData = await settingsRes.json();
    const generalTitle = settingsData?.data?.["general.title"] || "#";

    // combine both
    return NextResponse.json({
      ...leaderboardData,
      generalTitle
    });
  } catch (error) {
    console.error("Error in leaderboard route:", error);
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}
