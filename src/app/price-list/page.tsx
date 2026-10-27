"use client"

import { useEffect, useMemo, useState } from "react"
import useSWR from "swr"
import { useTranslation } from "react-i18next"
import { ContentLayout } from "@/components/panel/content-layout"
import PageHeader from "@/components/ui/PageHeader"
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { useSettings } from "@/context/settings-context"
import Link from "next/link"
import Image from "next/image"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!
const siteDomain = new URL(siteUrl).hostname.replace(/^www\./, "")

const fetcher = async (url: string) => {
    const res = await fetch(url)
    if (!res.ok) throw new Error("Failed to fetch")
    return res.json()
}

export default function HomePage() {
    const { t } = useTranslation()

    interface Settings {
        data: {
            ["general.title"]?: string
            ["region.active_region"]?: string
        }
    }

    const settings = useSettings() as unknown as Settings | null
    const storeName = settings?.data?.["general.title"] || "NVDSTORE"
    const region = settings?.data?.["region.active_region"] || "ID"
    const currencySymbol = region === "MY" ? "RM" : "Rp"

    const { data } = useSWR("/api/price-list", fetcher)

    const [selectedGameId, setSelectedGameId] = useState<string>("")
    const [searchGame, setSearchGame] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10

    /* ================= GAME LIST ================= */
    const gameList = useMemo(() => {
        if (!data || !data.success) return []
        return data.data
    }, [data])

    useEffect(() => {
        if (gameList.length && !selectedGameId) {
            setSelectedGameId(gameList[0].id.toString())
        }
    }, [gameList, selectedGameId])

    useEffect(() => {
        setCurrentPage(1)
    }, [selectedGameId])

    const filteredGameList = useMemo(() => {
        if (!searchGame) return gameList
        return gameList.filter((g: any) =>
            g.game_name.toLowerCase().includes(searchGame.toLowerCase())
        )
    }, [gameList, searchGame])

    const selectedGame = useMemo(() => {
        return gameList.find((g: any) => g.id.toString() === selectedGameId)
    }, [selectedGameId, gameList])

    /* ================= PRODUCT ================= */
    const availableProducts = useMemo(() => {
        if (!selectedGame) return []
        return selectedGame.products.filter((p: any) => p.status === 1)
    }, [selectedGame])

    const paginatedProducts = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage
        return availableProducts.slice(start, start + itemsPerPage)
    }, [availableProducts, currentPage])

    const totalPages = Math.ceil(availableProducts.length / itemsPerPage)

    const handlePrev = () => setCurrentPage((p) => Math.max(p - 1, 1))
    const handleNext = () => setCurrentPage((p) => Math.min(p + 1, totalPages))

    return (
        <ContentLayout title={t("product_list_title")}>
            <div className="container mx-auto px-2 lg:px-8 space-y-8">
                <PageHeader
                    title={t("product_price_list")}
                    description={t("product_price_desc")}
                    backgroundImage="/bannergame.webp"
                    height="300px"
                />

                {/* INFO */}
                <div className="border-l-4 border-cyan-400 bg-cyan-100 p-4 rounded-md">
                    <p className="text-xs lg:text-sm text-cyan-900">
                        {t("connection_info")}{" "}
                        <Link
                            href={`https://docs.${siteDomain}/`}
                            className="font-semibold underline"
                            target="_blank"
                        >
                            {t("documentation")}
                        </Link>{" "}
                        {t("integration_info")} <strong>{storeName}</strong>.
                    </p>
                </div>

                {/* FILTER GAME */}
                <div>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">

                        <div>
                            <h3 className="text-lg font-semibold">🎮 Filter Game</h3>
                            <p className="text-xs text-muted-foreground">
                                Pilih game untuk melihat produk.
                            </p>
                        </div>

                        <input
                            value={searchGame}
                            onChange={(e) => setSearchGame(e.target.value)}
                            placeholder="Cari game..."
                            className="w-full md:w-72 px-4 py-2 rounded-xl text-sm border"
                        />
                    </div>

                    <div className="flex gap-4 overflow-x-auto p-4 pb-4">
                        {/* ================= SKELETON ================= */}
                        {!data &&
                            Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="flex-shrink-0 text-center animate-pulse">
                                    {/* SKELETON PERSEGI */}
                                    <div className="w-[72px] sm:w-[80px] h-[72px] sm:h-[80px] rounded-2xl bg-muted" />
                                    <div className="h-3 w-[72px] sm:w-[80px] bg-muted rounded mt-2" />
                                </div>
                            ))}

                        {/* ================= GAME LIST ================= */}
                        {data &&
                            filteredGameList.map((game: any) => {
                                const active = selectedGameId === game.id.toString()

                                return (
                                    <button
                                        key={game.id}
                                        onClick={() => setSelectedGameId(game.id.toString())}
                                        className="flex-shrink-0 text-center"
                                    >
                                        <div
                                            className={`relative w-[72px] sm:w-[80px] aspect-[4/6] rounded-2xl overflow-hidden border transition
                            ${active
                                                    ? "ring-2 ring-my-color3"
                                                    : "hover:ring-2 hover:ring-my-color3 hover:ring-offset-2 hover:ring-offset-background"
                                                }`}
                                        >
                                            <Image
                                                src={game.image || "/images/game-dummy-4x6.webp"}
                                                alt={game.game_name}
                                                fill
                                                sizes="80px"
                                                className="object-cover"
                                            />
                                        </div>

                                        <p
                                            className={`mt-2 text-[10px] font-semibold truncate w-[72px] sm:w-[80px]
                            ${active
                                                    ? "text-blue-500"
                                                    : "text-muted-foreground"
                                                }`}
                                        >
                                            {game.game_name}
                                        </p>
                                    </button>
                                )
                            })}
                    </div>

                </div>

                {/* TABLE */}
                {!data ? (
                    <Skeleton className="h-40 w-full" />
                ) : paginatedProducts.length ? (
                    <>
                        <div className="overflow-x-auto rounded-lg px-2 py-2 border text-nowrap">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Produk</TableHead>
                                        <TableHead className="text-gray-500">Guest</TableHead>
                                        <TableHead>Basic</TableHead>
                                        <TableHead className="text-yellow-600">Gold</TableHead>
                                        <TableHead className="text-indigo-600">Platinum</TableHead>
                                        <TableHead className="text-emerald-600">Reseller</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedProducts.map((p: any) => (
                                        <TableRow key={p.id} className="py-4">
                                            <TableCell className="font-medium py-4">
                                                {p.title}
                                            </TableCell>
                                            <TableCell className="py-4 text-gray-500">
                                                {currencySymbol} {(p.selling_price_guest || p.selling_price)?.toLocaleString("id-ID") ?? "-"}
                                            </TableCell>
                                            <TableCell className="py-4">
                                                {currencySymbol} {p.selling_price.toLocaleString("id-ID")}
                                            </TableCell>
                                            <TableCell className="py-4 text-yellow-600 font-semibold">
                                                {currencySymbol} {p.selling_price_gold?.toLocaleString("id-ID") ?? "-"}
                                            </TableCell>
                                            <TableCell className="py-4 text-indigo-600 font-semibold">
                                                {currencySymbol} {p.selling_price_platinum?.toLocaleString("id-ID") ?? "-"}
                                            </TableCell>
                                            <TableCell className="py-4 text-emerald-600 font-semibold">
                                                {currencySymbol} {p.selling_price_reseller?.toLocaleString("id-ID") ?? "-"}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>

                            </Table>
                        </div>

                        {/* PAGINATION */}
                        <div className="flex justify-between items-center py-4">
                            <button
                                onClick={handlePrev}
                                disabled={currentPage === 1}
                                className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                            >
                                Prev
                            </button>
                            <span className="text-sm">
                                {currentPage} / {totalPages}
                            </span>
                            <button
                                onClick={handleNext}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </>
                ) : (
                    <p className="text-center text-muted-foreground">
                        Tidak ada produk tersedia.
                    </p>
                )}
            </div>
        </ContentLayout>
    )
}
