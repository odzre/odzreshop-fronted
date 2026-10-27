import { NextRequest, NextResponse } from "next/server"

function mapGameCode(code: string): string {
    const mapping: Record<string, string> = {
        ml: "Mobile Legends",
        ff: "Free Fire",
        gi: "Genshin Impact",
        pubgm: "PUBG Mobile",
        aov: "Arena Of Valor",
        mcgg: "Magic Chess",
        hok: "Honor of Kings",
        cod: "Call of Duty",
        pb: "Point Blank",
        hi: "Honkai Impact 3rd",
        hsr: "Honkai: Star Rail",
        ag: "Aether Gazer",
        lad: "Love and Deepspace",
        la: "LifeAfter",
        valo: "Valorant",
        zzz: "Zenless Zone Zero",
        pgr: "Punishing: Gray Raven",
        sus: "Sausage Man",
        bs: "Blood Strike",
        pln: "PLN" // 🔥 tambah mapping PLN
    }

    return mapping[code.toLowerCase()] || code
}

async function hitRegionApi(id: string, server: string) {
    const url = `https://cekregion-six.vercel.app/api/validasi?id=${encodeURIComponent(
        id
    )}&serverid=${encodeURIComponent(server)}`

    try {
        const res = await fetch(url, {
            method: "GET",
            headers: {
                Accept: "application/json, text/javascript, */*; q=0.01",
                "Cache-Control": "no-cache",
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
            }
        })

        const contentType = res.headers.get("content-type") || ""
        if (!res.ok || !contentType.includes("application/json")) {
            const text = await res.text()
            console.error("hitRegionApi failed:", text)
            return null
        }

        const data = await res.json()
        if (data.status === "success" && data.result?.nickname) {
            return {
                nickname: data.result.nickname,
                country: data.result.country
            }
        }

        console.error("hitRegionApi unexpected data:", data)
        return null
    } catch (err) {
        console.error("Error in hitRegionApi:", err)
        return null
    }
}

async function hitNvdApi({ id, zone, game }: { id: string; zone?: string; game: string }) {
    const mappedGame = mapGameCode(game)

    const params = new URLSearchParams()
    params.append("api_key", "oX7K3iyMOutx45m0zrFnUVAJgGNd2h6fRqpEBwlTsv1Z9aQcDPbYWCkHejL8")
    params.append("game", mappedGame)
    params.append("user_id", id)
    if (zone) params.append("zone_id", zone)

    try {
        const response = await fetch("https://api-cek.nvdstore.com/api/v1/check-game", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Accept: "application/json, text/javascript, */*; q=0.01",
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
            },
            body: params.toString()
        })

        const text = await response.text()
        let data
        try {
            data = JSON.parse(text)
        } catch {
            console.error("Invalid JSON from NVD API:", text)
            return null
        }

        if (data.code === 200 && data.result?.username) {
            return {
                success: true,
                game: data.result.game,
                id: data.result.user_id,
                server: data.result.zone_id,
                name: data.result.username
            }
        }

        console.error("hitNvdApi failed data:", data)
        return null
    } catch (err: any) {
        console.error("Error in hitNvdApi:", err)
        return null
    }
}

//
// 🔥 NEW — Fungsi Validasi PLN
//
async function hitPlnApi(id: string) {
    try {
        const res = await fetch(`https://api.nvdstore.com/api/check-pln/${encodeURIComponent(id)}`, {
            method: "GET",
            headers: {
                Accept: "application/json"
            }
        })

        const text = await res.text()
        let data
        try {
            data = JSON.parse(text)
        } catch {
            console.error("Invalid PLN JSON:", text)
            return null
        }

        if (data.status?.code === 200) {
            return {
                success: true,
                name: data.data.name?.trim(),
                meter: data.data.meter_no,
                segment: data.data.segment_power
            }
        }

        return null
    } catch (err) {
        console.error("Error in hitPlnApi:", err)
        return null
    }
}

//
// =====================================
//       MAIN GET HANDLER
// =====================================
//
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    const zone = searchParams.get("server") || searchParams.get("zone")
    const game = searchParams.get("game")

    if (!id || !game) {
        return NextResponse.json(
            { success: false, message: "Missing required parameters" },
            { status: 400 }
        )
    }

    //
    // ⚡ LOGIKA PLN — langsung return
    //
    if (game.toLowerCase() === "pln") {
        const plnData = await hitPlnApi(id)
        if (plnData) {
            return NextResponse.json(plnData, { status: 200 })
        }

        return NextResponse.json(
            { success: false, message: "Invalid PLN customer ID" },
            { status: 400 }
        )
    }

    //
    // ⚡ LOGIKA GAME (ML/others)
    //
    const [nvdResult, regionResult] = await Promise.all([
        hitNvdApi({ id, zone: zone || undefined, game }),
        game.toLowerCase() === "ml" && zone ? hitRegionApi(id, zone) : Promise.resolve(null)
    ])

    if (nvdResult) {
        return NextResponse.json({ ...nvdResult, region: regionResult || undefined }, { status: 200 })
    }

    if (regionResult) {
        return NextResponse.json({ success: true, region: regionResult }, { status: 200 })
    }

    return NextResponse.json(
        { success: false, message: "Both NVD and region lookups failed or blocked" },
        { status: 404 }
    )
}
