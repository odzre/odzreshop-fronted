"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SearchIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { X } from "lucide-react"

const API_URL = "/api/search-games"

interface Game {
    id: number
    slug: string
    title: string
    developers: string
    image: string
    status: number
}

export function Search() {
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState("")
    const [games, setGames] = useState<Game[]>([])
    const [loading, setLoading] = useState(false)

    const ref = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    // 🔥 highlight function
    const highlightText = (text: string, query: string) => {
        if (!query) return text

        const regex = new RegExp(`(${query.trim().replace(/\s+/g, "|")})`, "gi")
        const parts = text.split(regex)

        return parts.map((part, i) =>
            part.toLowerCase() === query.toLowerCase() ||
                query.toLowerCase().split(" ").includes(part.toLowerCase()) ? (
                <span key={i} className="text-primary font-semibold">
                    {part}
                </span>
            ) : (
                part
            )
        )
    }

    // CTRL + K
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "k") {
                e.preventDefault()
                setOpen(true)
            }
        }
        window.addEventListener("keydown", handler)
        return () => window.removeEventListener("keydown", handler)
    }, [])

    // ESC
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false)
        }
        window.addEventListener("keydown", handler)
        return () => window.removeEventListener("keydown", handler)
    }, [])

    // focus input
    useEffect(() => {
        if (open) {
            setTimeout(() => inputRef.current?.focus(), 50)
        }
    }, [open])

    // disable scroll
    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : ""
    }, [open])

    // click outside
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (!ref.current?.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        if (open) document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [open])

    // fetch search
    useEffect(() => {
        if (!query) {
            setGames([])
            return
        }

        const controller = new AbortController()

        const fetchData = async () => {
            try {
                setLoading(true)

                const res = await fetch(`${API_URL}?search=${query}`, {
                    signal: controller.signal,
                })

                const data = await res.json()
                setGames((data.games || []).filter((g: Game) => g.status !== 0))
            } catch (e: any) {
                if (e.name !== "AbortError") console.error(e)
            } finally {
                setLoading(false)
            }
        }

        const debounce = setTimeout(fetchData, 300)

        return () => {
            controller.abort()
            clearTimeout(debounce)
        }
    }, [query])

    return (
        <>
            {/* === DESKTOP === */}
            <div className="hidden md:flex w-full relative">
                <button
                    onClick={() => {
                        setOpen(true)
                        setQuery("")
                    }}
                    className="w-full group flex items-center gap-3 px-4 py-1.5 rounded-full border border-border bg-primary/5 text-muted-foreground hover:bg-primary/10 transition-all"
                >
                    <SearchIcon className="h-4 w-4" />

                    <span className="text-sm font-medium">
                        Cari game atau voucher...
                    </span>

                    <div className="ml-auto hidden lg:flex items-center gap-1">
                        <kbd className="h-5 flex items-center gap-1 rounded border border-border bg-background px-1.5 font-mono text-[10px] text-muted-foreground">
                            CTRL K
                        </kbd>
                    </div>
                </button>
            </div>

            {/* === MOBILE === */}
            <Button
                variant="outline"
                size="icon"
                className="sm:hidden"
                onClick={() => {
                    setOpen(true)
                    setQuery("")
                }}
            >
                <SearchIcon className="w-5 h-5" />
            </Button>

            {/* === MODAL === */}
            {open && createPortal(
                <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 md:p-20">

                    {/* overlay */}
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />

                    {/* modal */}
                    <div
                        ref={ref}
                        className="relative w-full max-w-2xl bg-[#121212] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
                    >

                        {/* input */}
                        <div className="relative border-b border-border">
                            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />

                            <Input
                                ref={inputRef}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Cari game..."
                                className="h-14 pl-12 pr-12 bg-transparent border-none focus-visible:ring-0"
                            />

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setOpen(false)}
                                className="absolute right-3 top-1/2 -translate-y-1/2"
                            >
                                {/* Desktop */}
                                <span className="hidden sm:block">ESC</span>

                                {/* Mobile */}
                                <X className="w-4 h-4 sm:hidden" />
                            </Button>
                        </div>

                        {/* content */}
                        <div className="p-4 max-h-[60vh] overflow-y-auto">

                            {query && (
                                <>
                                    <h3 className="text-xs font-bold text-muted-foreground uppercase mb-4 px-2">
                                        Hasil Pencarian
                                    </h3>

                                    {games.length > 0 ? (
                                        <div className="flex flex-col gap-2">
                                            {games.map((game) => (
                                                <Link
                                                    key={game.id}
                                                    href={`/order/${game.slug}`}
                                                    className="flex items-center gap-3 p-2 rounded hover:bg-white/5"
                                                >
                                                    <Image
                                                        src={game.image}
                                                        alt={game.title}
                                                        width={40}
                                                        height={40}
                                                        className="aspect-square w-16 rounded-2xl object-cover"
                                                    />

                                                    <div className="flex flex-col">
                                                        <span className="text-sm text-white">
                                                            {highlightText(game.title, query)}
                                                        </span>

                                                        <span className="text-xs text-muted-foreground">
                                                            {game.developers}
                                                        </span>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    ) : (
                                        !loading && (
                                            <div className="text-sm text-muted-foreground p-2">
                                                Tidak ditemukan
                                            </div>
                                        )
                                    )}

                                    {loading && (
                                        <div className="text-sm text-muted-foreground p-2">
                                            Loading...
                                        </div>
                                    )}
                                </>
                            )}

                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    )
}