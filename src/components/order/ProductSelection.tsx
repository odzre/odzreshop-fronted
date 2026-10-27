"use client"

import { useState, useMemo, useEffect } from "react"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import LogoInstan from "@/components/logo/instan"
import LogoManual from "@/components/logo/manual"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import {
    Drawer,
    DrawerDescription,
    DrawerContent,
    DrawerHeader,
    DrawerTitle
} from "@/components/ui/drawer"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Card } from "@/components/ui/card"
import { useSettings } from "@/context/settings-context"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { useCurrency } from "@/hooks/useCurrency"

interface CategoryObj {
    id: number
    title: string
    logo: string | null
    game: string
    sort?: number
}

interface Product {
    id: string
    title: string
    images?: string
    logo?: string
    description?: string
    category: CategoryObj | null
    selling_price: number
    selling_price_gold: number
    selling_price_platinum: number
    selling_price_reseller: number
    selling_price_guest: number
    promo_price?: number | null
    stock?: number
    stock_usage?: number
    type_transaction?: "manual" | "otomatis"
    status?: number
    provider?: string
    stock_available?: number | null
}

interface ProductSelectionProps {
    isLoading: boolean
    products: Product[]
    selectedProduct: string | null
    setSelectedProduct: (productId: string) => void
    productRef: React.RefObject<HTMLElement>
    paymentRef?: React.RefObject<HTMLElement>
    role?: string
    setSelectedProductDetails?: (product: Product | null) => void
    inputs?: { id?: string; server?: string }
    gameConfig?: { required_inputs?: string[] }
    totalSold?: number
}

const getPriceByRole = (p: Product, role?: string) =>
    role === "gold"
        ? p.selling_price_gold
        : role === "reseller"
            ? p.selling_price_reseller
            : role === "platinum"
                ? p.selling_price_platinum
                : role === "basic"
                    ? p.selling_price
                    : (p.selling_price_guest || p.selling_price) // guest (belum login)

const isValidDescription = (desc?: string | null) =>
    !!desc && desc.trim() !== "-" && desc.trim() !== ""

const ProductSelection: React.FC<ProductSelectionProps> = ({
    isLoading,
    products,
    selectedProduct,
    setSelectedProduct,
    productRef,
    paymentRef,
    role,
    setSelectedProductDetails,
    inputs,
    gameConfig,
    totalSold = 0
}) => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const isMobile = useMediaQuery("(max-width: 768px)")
    const settings = useSettings() as { data?: Record<string, string> } | null
    const variantStyle = settings?.data?.["general.product_variant_style"] ?? "0"
    const showStockAmount = settings?.data?.["general.show_stock_amount"] ?? "1"
    const hideStock = showStockAmount === "0"
    const [selectedDesc, setSelectedDesc] = useState<Product | null>(null)
    const [showDialog, setShowDialog] = useState(false)
    const { t } = useTranslation()
    const { format } = useCurrency()


    const handleSelectProduct = (p: Product) => {
        const requiredInputs = gameConfig?.required_inputs || []
        let hasMissing = false

        if (requiredInputs.includes("id") && !inputs?.id?.trim()) {
            hasMissing = true
            document.getElementById("id")?.scrollIntoView({
                behavior: "smooth",
                block: "center"
            })
        }

        if (requiredInputs.includes("server") && !inputs?.server?.trim()) {
            hasMissing = true
            document.getElementById("server")?.scrollIntoView({
                behavior: "smooth",
                block: "center"
            })
        }

        if (hasMissing) {
            toast.error("Silakan isi data akun terlebih dahulu.")
            return
        }

        setSelectedProduct(p.id)
        setSelectedProductDetails?.(p)
        window.dispatchEvent(new Event("product-selected"))
        setTimeout(() => paymentRef?.current?.scrollIntoView({ behavior: "smooth" }), 100)
    }



    useEffect(() => {
        const productId = searchParams.get("product_id")
        if (productId && products.length > 0) {
            const found = products.find((p) => String(p.id) === String(productId))
            if (found) {
                setSelectedProduct(String(productId))
                setSelectedProductDetails?.(found)
            }
        }
    }, [searchParams, products, setSelectedProduct, setSelectedProductDetails])

    useEffect(() => {
        if (selectedProduct) {
            const product = products.find((p) => String(p.id) === String(selectedProduct)) || null
            setSelectedProductDetails?.(product)
        }
    }, [selectedProduct, products, setSelectedProductDetails])

    useEffect(() => {
        const imgProduct = settings?.data?.["general.image_product"]

        if (imgProduct) {
            document.documentElement.style.setProperty(
                "--image-product",
                `url(${imgProduct})`
            )
        }
    }, [settings])


    const isOutOfStock = (p: Product) =>
        p.stock !== undefined && p.stock !== null ? p.stock - (p.stock_usage ?? 0) <= 0 : false

    // ✅ Cek stok habis untuk produk stock provider (voucher/apps_premium)
    const isStockProviderOutOfStock = (p: Product) =>
        p.provider?.toLowerCase() === "stock" && p.stock_available !== null && p.stock_available !== undefined && p.stock_available <= 0

    const isGangguan = (p: Product) => Number(p.status) === 0

    const promoProducts = useMemo(() => {
        return products.filter((p) => {
            if (isGangguan(p)) return false
            const normal = getPriceByRole(p, role)
            return p.promo_price !== null && p.promo_price !== undefined && p.promo_price < normal
        })
    }, [products, role])

    const grouped = useMemo(() => {
        return products
            .filter((p) => !isGangguan(p))
            .reduce((acc, p) => {
                const key = p.category?.title || "TopUp"
                if (!acc[key]) acc[key] = { items: [], logo: p.category?.logo || null }
                acc[key].items.push(p)
                return acc
            }, {} as Record<string, { items: Product[]; logo: string | null }>)
    }, [products])

    const categories = useMemo(() => {
        return Object.keys(grouped)
            .filter((c) => grouped[c]?.items?.length > 0)
            .sort((a, b) => {
                const sa = grouped[a].items[0]?.category?.sort ?? 0
                const sb = grouped[b].items[0]?.category?.sort ?? 0

                // sort = 0 selalu di paling akhir
                if (sa === 0 && sb !== 0) return 1
                if (sb === 0 && sa !== 0) return -1

                // urutkan ASC
                return sa - sb
            })
    }, [grouped])

    const hasAnyDescription = useMemo(() => {
        return products.some((p) => isValidDescription(p.description))
    }, [products])

    const [activeCategory, setActiveCategory] = useState<string | null>(null)
    const current = activeCategory || categories[0]


    const renderProductCard = (p: Product, isFlashSale = false) => {
        const selected = String(selectedProduct) === String(p.id)
        const price = getPriceByRole(p, role)
        const promo = p.promo_price ?? null
        const promoActive = promo !== null && promo !== undefined
        const out = isOutOfStock(p)
        const stockOut = isStockProviderOutOfStock(p)
        const disabledFlash = isFlashSale && out
        const gangguan = isGangguan(p)
        const notAvailable = (p as any).is_available === false;

        const disabled = disabledFlash || gangguan || notAvailable || stockOut;
        const showPromoUI = promoActive && (!out || isFlashSale)
        const disc = showPromoUI && price > promo! ? Math.round(((price - promo!) / price) * 100) : 0


        const TransactionLogo =
            p.type_transaction === "manual"
                ? LogoManual
                : LogoInstan
        return (
            <div
                key={p.id}
                className={`group relative flex min-h-[85px] w-full gap-4 rounded-xl border border-transparent bg-muted text-muted-foreground bg-product-overlay bg-cover bg-center bg-no-repeat shadow-sm transition-all duration-300 ${disabled ? "pointer-events-none opacity-60"
                    : selected
                        ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                        : "hover:ring-2 hover:ring-primary"
                    }`}
                onClick={() => {
                    if (p.description && isValidDescription(p.description)) {
                        setSelectedDesc(p)
                        setShowDialog(true)
                    }
                }}
            >
                <label
                    className={`flex w-full h-full ${disabled ? "cursor-not-allowed" : "cursor-pointer"
                        }`}
                >
                    <input
                        type="radio"
                        name={`productId-${isFlashSale ? "flash" : "normal"}`}
                        value={p.id}
                        className="sr-only"
                        checked={selected}
                        disabled={disabled}
                        onChange={() => !disabled && handleSelectProduct(p)}
                    />

                    <span className="flex flex-col justify-between w-full h-full divide-y divide-muted-foreground/10">
                        <div className="flex flex-col gap-1 p-4">
                            <span className="block text-xs font-semibold">{p.title}</span>

                            <div className="flex w-full items-center gap-2 md:gap-3">
                                {(p.images || p.logo) && (
                                    <Image
                                        src={(p.images || p.logo) as string}
                                        alt={p.title}
                                        width={32}
                                        height={32}
                                        className="w-6 md:w-8 lg:w-10 object-contain"
                                    />
                                )}
                                {showPromoUI ? (
                                    <div>
                                        <div className="text-xs text-red-500 line-through text-nowrap">
                                            {format(price)}
                                        </div>
                                        <div className="font-semibold text-[14px] md:text-[16px] text-nowrap">
                                            {format(promo ?? 0)}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="font-semibold text-my-color1 text-[14px] md:text-[16px] text-nowrap">
                                        {format(price)}
                                    </div>
                                )}

                                {isValidDescription(p.description) && (
                                    <div className="absolute bottom-10 right-2">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="h-4 w-4 text-muted-foreground"
                                        >
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <path d="M12 16v-4"></path>
                                            <path d="M12 8h.01"></path>
                                        </svg>
                                    </div>
                                )}

                            </div>

                            {/* Progress bar stok */}
                            {showPromoUI && p.stock !== null && p.stock !== undefined && (
                                <div className="mt-1 w-full">
                                    {out ? (
                                        /* Out of Stock → SELALU TAMPIL */
                                        <div className="w-full">
                                            <div className="relative w-full overflow-hidden rounded-full bg-secondary mb-1 h-1.5">
                                                <div
                                                    className="h-full w-full flex-1 bg-red-600 transition-all"
                                                    style={{ transform: "translateX(-100%)" }}
                                                />
                                            </div>
                                            <div className="flex justify-end">
                                                <span className="text-[8px] font-semibold md:text-[10px] text-red-500">
                                                    {p.stock} / {p.stock} purchased – Out of Stock
                                                </span>
                                            </div>
                                        </div>
                                    ) : !hideStock ? (
                                        /* Stok masih ada + setting show → tampilkan progress bar */
                                        <div className="w-full">
                                            <div className="relative w-full overflow-hidden rounded-full bg-secondary mb-1 h-1.5">
                                                <div
                                                    className={`h-full flex-1 transition-all ${((p.stock - (p.stock_usage ?? 0)) / p.stock) * 100 < 20
                                                        ? "bg-red-600"
                                                        : ((p.stock - (p.stock_usage ?? 0)) / p.stock) * 100 < 50
                                                            ? "bg-yellow-400"
                                                            : "bg-primary"
                                                        }`}
                                                    style={{
                                                        width: `${Math.min(
                                                            100,
                                                            ((p.stock - (p.stock_usage ?? 0)) / p.stock) * 100
                                                        )}%`
                                                    }}
                                                />
                                            </div>
                                            <div className="flex justify-end">
                                                <span className="text-[8px] font-semibold md:text-[10px]">
                                                    {p.stock_usage ?? 0} / {p.stock} purchased
                                                </span>
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                            )}
                        </div>

                        <div className="flex w-full items-end justify-end gap-2 rounded-b-xl bg-gradient-to-b from-primary to-primary/40 px-3 py-2">
                            {disc > 0 && (
                                <div className="rounded bg-gradient-to-b from-primary to-primary/60 px-1.5 text-xxs font-semibold text-primary-foreground px-2 py-0.5 shadow">
                                    Disc {disc}%
                                </div>
                            )}

                            {gangguan && (
                                <div className="h-full max-w-fit items-center rounded bg-black p-1 text-xxs font-semibold text-red-500">
                                    Gangguan
                                </div>
                            )}

                            {stockOut && (
                                <div className="h-full max-w-fit items-center rounded bg-red-600 px-2 py-1 text-xxs font-bold text-white uppercase tracking-wide">
                                    Out of Stock
                                </div>
                            )}

                            {!stockOut && !hideStock && p.provider?.toLowerCase() === "stock" && p.stock_available !== null && p.stock_available !== undefined && p.stock_available > 0 && (
                                <div className="h-full max-w-fit items-center rounded bg-emerald-600 px-2 py-1 text-xxs font-semibold text-white">
                                    Stok: {p.stock_available}
                                </div>
                            )}

                            {notAvailable && (
                                <div className="h-full max-w-fit items-center rounded bg-black p-1 text-xxs font-semibold text-red-500">
                                    Batas pembelian tercapai.
                                </div>
                            )}
                            <div className="rounded bg-white p-1">
                                <TransactionLogo className="h-3 w-12" />

                            </div>
                        </div>
                    </span>
                </label>
            </div>
        )
    }

    return (
        <>
            <section
                ref={productRef}
                id="1"
                className="relative scroll-mt-20 rounded-xl bg-card/50 shadow-sm md:scroll-mt-[7.5rem]"
            >
                <div className="flex items-center rounded-t-xl bg-card">
                    <div className="flex h-10 w-10 items-center justify-center rounded-tl-xl bg-primary text-white font-semibold">
                        2
                    </div>
                    <h2 className="ml-3 text-sm font-semibold text-card-foreground">
                        {t("order.Pilih Nominal")}
                    </h2>
                </div>

                {/* TOTAL TERJUAL (ikon popular) */}
                {!isLoading && totalSold > 0 && (
                    <div className="flex items-center gap-2 mx-4 mt-3 w-fit rounded-full border border-primary/30 bg-primary/10 px-3 py-1">
                        {settings?.data?.["general.popular_icon"] && (
                            <Image
                                src={settings.data["general.popular_icon"]}
                                alt="Total Terjual"
                                width={16}
                                height={16}
                                className="h-4 w-4 object-contain"
                                unoptimized
                            />
                        )}
                        <span className="text-xs font-semibold uppercase tracking-wide text-card-foreground">
                            {t("order.Total Terjual")}:
                        </span>
                        <span className="text-xs font-bold text-primary">
                            {totalSold.toLocaleString("id-ID")}
                        </span>
                    </div>
                )}

                <div className="p-4 space-y-4">
                    {variantStyle === "0" ? (
                        <>
                            {/* ================= MODE TABS ================= */}
                            {!isLoading && categories.length > 1 && (
                                <div className="flex overflow-x-auto gap-3 pb-3 -mx-1 hide-scrollbar">
                                    {categories.map((cat) => {
                                        const active = current === cat
                                        const logo = cat !== "TopUp" ? grouped[cat]?.logo : null
                                        return (
                                            <Card
                                                key={cat}
                                                withHoverEffect={false}
                                                className={`flex-none w-[120px] h-[90px] p-2 flex flex-col items-center justify-center text-center transition cursor-pointer ${active
                                                    ? "border-primary/50 bg-primary"
                                                    : "border-transparent bg-primary/50 hover:bg-primary/70"
                                                    }`}
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => setActiveCategory(cat)}
                                                    className="flex flex-col items-center justify-center gap-2 w-full h-full"
                                                >
                                                    <Image
                                                        src={logo || "/logo-topup.webp"}
                                                        alt={cat}
                                                        width={32}
                                                        height={32}
                                                        className="h-8 w-8 object-contain"
                                                    />
                                                    <span
                                                        className={`text-xs font-medium leading-tight ${active ? "text-my-color" : "text-gray dark:text-white"
                                                            }`}
                                                    >
                                                        {cat}
                                                    </span>
                                                </button>
                                            </Card>
                                        )
                                    })}
                                </div>
                            )}

                            {/* FLASH SALE - selalu tampil di atas, tidak hilang jika ganti tab */}
                            {promoProducts.length > 0 && (
                                <div className="border-4 border-primary bg-card rounded-xl p-3 -mx-2 mb-4">
                                    <div className="flex items-center gap-2 mb-2">

                                        <svg
                                            viewBox="0 0 256 256"
                                            fill="currentColor"
                                            className="w-4 h-4 text-primary"
                                        >
                                            <path d="M213.85,125.46l-112,120a8,8,0,0,1-13.69-7l14.66-73.33L45.19,143.49a8,8,0,0,1-3-13l112-120a8,8,0,0,1,13.69,7L153.18,90.9l57.63,21.61a8,8,0,0,1,3,12.95Z" />
                                        </svg>

                                        <span className="relative inline-block">

                                            <span className="sr-only">Flash Sale</span>

                                            <span
                                                aria-hidden="true"
                                                className="font-bold text-sm animate-aurora bg-[length:200%_auto] bg-clip-text text-transparent"
                                                style={{
                                                    backgroundImage:
                                                        "linear-gradient(135deg,#fff1be,#ee87cb,#fff1be)",
                                                    animationDuration: "8s"
                                                }}
                                            >
                                                FLASH SALE
                                            </span>

                                        </span>

                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {promoProducts.map((p) => renderProductCard(p, true))}
                                    </div>
                                </div>
                            )}

                            {/* Produk grid sesuai tab — pakai CSS display agar tidak re-mount */}
                            <div role="radiogroup" aria-label="Pilih varian produk">
                                {isLoading ? (
                                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3">
                                        {Array.from({ length: 8 }).map((_, i) => (
                                            <div key={i} className="min-h-[85px] animate-pulse rounded-xl bg-muted" />
                                        ))}
                                    </div>
                                ) : categories.length > 0 ? (
                                    <>
                                        {categories.map((cat) => (
                                            <div
                                                key={cat}
                                                className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3"
                                                style={{ display: current === cat ? "grid" : "none" }}
                                            >
                                                {grouped[cat]?.items.map((p) => renderProductCard(p, false))}
                                            </div>
                                        ))}
                                    </>
                                ) : (
                                    <p className="text-muted-foreground text-center py-4">
                                        {t("order.Tidak ada produk tersedia.")}
                                    </p>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            {/* ================= MODE LIST ================= */}
                            {promoProducts.length > 0 && (
                                <div className="border-4 border-primary rounded-xl p-3 -mx-2 mb-4">
                                    <div className="flex items-center gap-2 mb-2">

                                        <svg
                                            viewBox="0 0 256 256"
                                            fill="currentColor"
                                            className="w-4 h-4 text-primary"
                                        >
                                            <path d="M213.85,125.46l-112,120a8,8,0,0,1-13.69-7l14.66-73.33L45.19,143.49a8,8,0,0,1-3-13l112-120a8,8,0,0,1,13.69,7L153.18,90.9l57.63,21.61a8,8,0,0,1,3,12.95Z" />
                                        </svg>

                                        <span className="relative inline-block">

                                            <span className="sr-only">Flash Sale</span>

                                            <span
                                                aria-hidden="true"
                                                className="font-bold text-sm animate-aurora bg-[length:200%_auto] bg-clip-text text-transparent"
                                                style={{
                                                    backgroundImage:
                                                        "linear-gradient(135deg,#fff1be,#ee87cb,#fff1be)",
                                                    animationDuration: "8s"
                                                }}
                                            >
                                                FLASH SALE
                                            </span>

                                        </span>

                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {promoProducts.map((p) => renderProductCard(p, true))}
                                    </div>
                                </div>
                            )}

                            {categories.map((category) => {
                                const data = grouped[category]
                                return (
                                    <div key={category} className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Image
                                                src={data.logo || "/logo-topup.webp"}
                                                alt={category}
                                                width={24}
                                                height={24}
                                                className="w-6 h-6 object-contain"
                                            />
                                            <h3 className="font-bold text-sm">{category}</h3>
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {data.items.map((p) => renderProductCard(p, false))}
                                        </div>
                                    </div>
                                )
                            })}
                        </>
                    )}
                </div>

            </section>

            {selectedDesc &&
                isValidDescription(selectedDesc.description) &&
                (isMobile ? (
                    <Drawer open={showDialog} onOpenChange={setShowDialog}>
                        <DrawerContent>
                            <DrawerHeader>
                                <DrawerTitle className="text-center text-base uppercase">
                                    {selectedDesc.title}
                                </DrawerTitle>
                                <DrawerDescription className="text-center text-muted-foreground">
                                    {t("order.Lihat informasi lengkap mengenai produk ini.")}
                                </DrawerDescription>
                            </DrawerHeader>
                            <div className="flex flex-col gap-4 p-4">
                                {(selectedDesc.images || selectedDesc.logo) && (
                                    <div className="flex justify-center">
                                        <Image
                                            src={(selectedDesc.images || selectedDesc.logo) as string}
                                            alt={selectedDesc.title}
                                            width={100}
                                            height={100}
                                            className="h-24 w-24 object-contain"
                                        />
                                    </div>
                                )}
                                <div className="prose prose-sm flex w-full flex-col rounded-xl items-center justify-center border border-my-color3 border-dashed px-4 py-3 text-xs text-foreground prose-p:my-0">
                                    <div
                                        dangerouslySetInnerHTML={{
                                            __html: selectedDesc.description || ""
                                        }}
                                    />
                                </div>
                            </div>
                        </DrawerContent>
                    </Drawer>
                ) : (
                    <Dialog open={showDialog} onOpenChange={setShowDialog}>
                        <DialogContent className="max-w-2xl">
                            <DialogTitle className="text-center text-lg uppercase">
                                {selectedDesc.title}
                            </DialogTitle>
                            <DialogDescription className="text-center text-muted-foreground">
                                {t("order.Lihat informasi lengkap mengenai produk ini.")}
                            </DialogDescription>
                            <div className="flex flex-col gap-4 p-2">
                                {(selectedDesc.images || selectedDesc.logo) && (
                                    <div className="flex justify-center">
                                        <Image
                                            src={(selectedDesc.images || selectedDesc.logo) as string}
                                            alt={selectedDesc.title}
                                            width={100}
                                            height={100}
                                            className="h-16 w-16 object-contain"
                                        />
                                    </div>
                                )}
                                <div className="w-full flex justify-center">
                                    <div className="prose prose-sm flex w-full flex-col rounded-xl border border-primary border-dashed px-4 py-3 text-xs text-foreground prose-p:my-0">
                                        <div
                                            dangerouslySetInnerHTML={{
                                                __html: selectedDesc.description || ""
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                ))}
        </>
    )
}

export default ProductSelection
