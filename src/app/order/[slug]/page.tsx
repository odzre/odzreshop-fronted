"use client";

import { useSession } from "next-auth/react";
import {
    notFound,
    useSearchParams,
    useRouter,
    useParams
} from "next/navigation";
import {
    useState,
    useEffect,
    useRef,
    useMemo,
    useCallback
} from "react";
import { ContentLayout } from "@/components/panel/content-layout";
import { useUser } from "@/hooks/use-user";
import useReviewOverview from "@/hooks/use-review-overview";
import useLatestReviews from "@/hooks/use-latest-reviews";

import useSWR from "swr";

import { useSettings } from "@/context/settings-context";
import { toast } from "sonner";

import { PaymentMethod } from "@/types";

import GameHeader from "@/components/order/GameHeader";
import HelpCard from "@/components/order/HelpCard";
import GameDescription from "@/components/order/GameDescription";
import ProductSelection from "@/components/order/ProductSelection";
import InputSelection from "@/components/order/InputSelection";
import PaymentSelection from "@/components/order/PaymentSelection";
import ContactDetails from "@/components/order/ContactDetails";
import GuideDrawer from "@/components/order/GuideDrawer";
import ConfirmDrawer from "@/components/order/ConfirmDrawer";
import OrderSummaryDekstop from "@/components/order/OrderSummaryDekstop";
import OrderSummaryMobile from "@/components/order/OrderSummaryMobile";
import VoucherSelection from "@/components/order/VoucherSelection";
import ReviewSummaryDesktop from "@/components/order/ReviewSummaryDesktop";
import ReviewSummaryMobile from "@/components/order/ReviewSummaryMobile";
import QuantityInput from "@/components/order/QuantityInput";
import { useTranslation } from "react-i18next";
import { useCurrency } from "@/hooks/useCurrency";

const fetcher = async (url: string) => {
    const res = await fetch(url);

    if (!res.ok) {
        throw new Error(`Gagal mengambil data. Status: ${res.status}`);
    }

    return res.json();
};

const calcFee = (price: number, method?: PaymentMethod) => {
    if (!method) return 0;
    const flat = Number(method.fee) || 0;
    const percent = Number(method.fee_percent) || 0;
    return flat + Math.round((percent / 100) * price);
};

export default function OrderPage() {
    interface Settings {
        data: {
            [key: string]: any; // akses fleksibel
        };
    }

    const { t } = useTranslation();
    const { format: formatCurrency } = useCurrency();

    const settings = useSettings() as Settings | null;
    const waNumber = settings?.data?.["sosmed.wa"];
    const backgroundTitle = settings?.data?.["general.background_title"];
    const coinImage = settings?.data?.["general.coin_image"] || "/Coin.png";
    const imageProduct = settings?.data?.["general.image_product"] || "";
    const [whatsappError, setWhatsappError] = useState<string | null>(null);


    // --- Data Fetching ---
    const { slug } = useParams();
    const { data: dataGamesProductsPayment, error } = useSWR(
        slug ? `/api/games/${slug}` : null,
        fetcher
    );



    // Voucher State ✅
    const [voucherCode, setVoucherCode] = useState<string | null>(null);
    const [voucherDiscount, setVoucherDiscount] = useState<number>(0);
    const [finalPrice, setFinalPrice] = useState<number | null>(null);

    // --- Authentication ---
    const { data: session } = useSession();
    const { user, refreshUser } = useUser();

    const saldo = user?.saldo ?? session?.user?.saldo ?? 0;
    const isLoggedIn = !!session?.user?.token;
    const role = session?.user?.role;
    const token = session?.user?.token;
    const loggedInEmail = session?.user?.email;

    // --- Routing ---
    const router = useRouter();
    const searchParams = useSearchParams();
    const productId = searchParams.get("product_id");

    // --- State Management ---
    // UI State
    const [isLoading, setIsLoading] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isGuideOpen, setIsGuideOpen] = useState(false);
    const [openAccordion, setOpenAccordion] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"transaksi" | "deskripsi">(
        "transaksi"
    );

    // Form State
    //const [inputs, setInputs] = useState<{ [key: string]: string }>({ id: "", server: "" });
    const [inputs, setInputs] = useState({ id: "", server: "" });
    const [email, setEmail] = useState("");
    const [whatsapp, setWhatsapp] = useState("");       // raw (812xxx)
    const [whatsappFull, setWhatsappFull] = useState(""); // full (62812xxx)
    const [quantity, setQuantity] = useState(1);

    // Product State
    const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
    const [availableSkus, setAvailableSkus] = useState<Map<string, boolean>>(new Map());
    const [selectedProductDetails, setSelectedProductDetails] = useState<any>(null);

    // Payment State
    const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
    const [selectedPaymentDetails, setSelectedPaymentDetails] =
        useState<any>(null);

    // Validation State
    const [nickname, setNickname] = useState<string | null>(null);
    const [nicknameError, setNicknameError] = useState<string | null>(null);
    const [isCheckingNickname, setIsCheckingNickname] = useState(false);
    const [status, setStatus] = useState("");

    // --- Refs ---
    const productRef = useRef<HTMLDivElement>(null);
    const idRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef(inputs);
    const serverRef = useRef<HTMLDivElement>(null);
    const paymentRef = useRef<HTMLDivElement>(null);
    const emailRef = useRef<HTMLDivElement>(null);
    const whatsappRef = useRef<HTMLDivElement>(null);

    // --- Derived Data ---
    const games = dataGamesProductsPayment?.game ?? null;


    const paymentMethods = useMemo(
        () => dataGamesProductsPayment?.paymentMethod ?? [],
        [dataGamesProductsPayment]
    );
    const gameConfig = dataGamesProductsPayment?.gameConfiguration;
    const validationCode = gameConfig?.code_validation_nickname;

    const products = useMemo(() => {
        const rawProducts = dataGamesProductsPayment?.products ?? [];

        if (validationCode !== "mobile-legends-mp") {
            return rawProducts;
        }

        if (!availableSkus.size) {
            return rawProducts;
        }

        return rawProducts.map((p: any) => {
            if (!p.entitas_id) {
                return { ...p, is_available: true };
            }

            const isAvailable = availableSkus.get(p.entitas_id);

            return {
                ...p,
                is_available: isAvailable === true, // ✅ hanya true yang aktif
            };
        });
    }, [dataGamesProductsPayment, availableSkus, validationCode]);

    const productPrice =
        selectedProductDetails?.promo_price ??
        (role === "gold"
            ? selectedProductDetails?.selling_price_gold
            : role === "reseller"
                ? selectedProductDetails?.selling_price_reseller
                : role === "platinum"
                    ? selectedProductDetails?.selling_price_platinum
                    : role === "basic"
                        ? selectedProductDetails?.selling_price
                        : (selectedProductDetails?.selling_price_guest || selectedProductDetails?.selling_price)) ??
        0;
    const productName = selectedProductDetails?.title ?? "";
    const memoizedInputs = useMemo(() => inputs, [inputs]);
    const isLoadingProduct = !dataGamesProductsPayment;

    const groupedPaymentMethods = useMemo(() => {
        return paymentMethods.reduce(
            (acc: Record<string, PaymentMethod[]>, method: PaymentMethod) => {
                if (!acc[method.group]) acc[method.group] = [];

                const fee = method.fee ?? 0; // fee sudah fix dari backend
                const rawTotal = productPrice + fee;

                acc[method.group].push({
                    ...method,
                    fee,
                    totalPrice: rawTotal
                });

                return acc;
            },
            {} as Record<string, PaymentMethod[]>
        );
    }, [paymentMethods, productPrice]);

    // Helper fungsi hitung fee
    const calcFee = (price: number, method?: PaymentMethod) => {
        if (!method) return 0;
        const flat = Number(method.fee) || 0;
        const percent = Number(method.fee_percent) || 0;
        return flat + Math.floor((percent / 100) * price);
    };



    const selectedPaymentMethod = paymentMethods.find(
        (p: { id: string }) => p.id === selectedPayment
    );

    const subtotal = productPrice * quantity;

    const fee = calcFee(subtotal, selectedPaymentMethod);

    const discountedSubtotal = Math.max(0, subtotal - voucherDiscount);

    const totalPrice = discountedSubtotal + fee;

    const gameTitle = games?.title ?? "";

    const {
        averageRating,
        totalReviews,
        ratings

    } = useReviewOverview(gameTitle);


    // 5 review terbaru (mobile)
    const {
        reviews: latestReviews
    } = useLatestReviews(gameTitle, 5);

    const category = games?.category ?? "";

    const applyVoucher = useCallback(
        async (code: string) => {
            if (!selectedProduct) {
                toast.error("Pilih produk terlebih dahulu sebelum pakai voucher.");
                return;
            }

            try {
                const res = await fetch("/api/voucher/check", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        code,
                        product_id: selectedProduct,
                        game_slug: Array.isArray(slug) ? slug[0] : slug
                    })
                });

                const data = await res.json();
                if (!res.ok || !data.success) {
                    toast.error(
                        data.message || "Voucher tidak valid atau sudah kadaluarsa."
                    );
                    setVoucherCode(null);
                    setVoucherDiscount(0);
                    setFinalPrice(null);
                    return;
                }

                const discount = data.discount || 0;

                const subtotal = productPrice * quantity;

                const fee = calcFee(subtotal, selectedPaymentMethod);

                const discountedSubtotal = Math.max(0, subtotal - discount);

                const totalPrice = discountedSubtotal + fee;

                setVoucherCode(code);
                setVoucherDiscount(discount);
                setFinalPrice(totalPrice);

                toast.success(
                    `Voucher berhasil digunakan! Diskon ${formatCurrency(discount)}`
                );
            } catch (err) {
                toast.error("Terjadi kesalahan saat cek voucher.");
            }
        },
        [selectedProduct, productPrice, selectedPaymentMethod, slug, quantity]
    );

    // --- Effects ---

    useEffect(() => {
        if (selectedProduct) {
            setVoucherCode(null);
            setVoucherDiscount(0);
            setFinalPrice(null);
        }
    }, [selectedProduct]);

    // --- Handlers ---
    const checkNickname = useCallback(async () => {
        try {
            setIsCheckingNickname(true);

            const game = gameConfig?.code_validation_nickname;
            const id = inputs.id || "";
            const server = inputs.server || "";

            const res = await fetch("/api/account/pre-validate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id,
                    server,
                    slug: game,
                }),
            });

            const data = await res.json();
            if (!data || data.status !== "success") {
                throw new Error(data?.message || "Validasi gagal");
            }

            if (data.status === "success" && data.result?.username) {
                setNickname(data.result.username);
                setNicknameError(null);

                if (gameConfig?.code_validation_nickname === "mobile-legends-mp") {
                    const diamonds = data.result?.double_diamond;

                    if (diamonds && diamonds.length > 0) {

                        const skuMap = new Map<string, boolean>(
                            diamonds.map((opt: any): [string, boolean] => [
                                opt.sku,
                                opt.available,
                            ])
                        );

                        setAvailableSkus(skuMap);

                    } else {
                        setAvailableSkus(new Map([
                            ["com.moonton.diamond_mt_id_50", false],
                            ["com.moonton.diamond_mt_id_150", false],
                            ["com.moonton.diamond_mt_id_250", false],
                            ["com.moonton.diamond_mt_id_500", false],
                        ]));
                    }
                } else {
                    setAvailableSkus(new Map());
                }

            } else {
                setNickname(null);
                setNicknameError(
                    data?.message || "Nickname tidak valid."
                );
                setAvailableSkus(new Map()); // 🔥 reset
            }

        } catch (error) {
            setNickname(null);
            setNicknameError("Terjadi kesalahan saat memeriksa nickname.");
            setAvailableSkus(new Map()); // 🔥 reset error
        } finally {
            setIsCheckingNickname(false);
        }
    }, [inputs, gameConfig]);

    // Nickname validation
    useEffect(() => {
        if (!gameConfig) return;
        if (gameConfig.status_validation_nickname !== "yes") return;

        setNickname("");
        setNicknameError(null);

        const currentInputs = inputRef.current as Record<string, string>;

        const requiredInputsFilled = gameConfig.required_inputs.every(
            (input: string) => currentInputs[input]?.trim() !== ""
        );

        if (requiredInputsFilled) checkNickname();
    }, [gameConfig, checkNickname]);

    const openGuideDrawer = () => setIsGuideOpen(true);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setInputs((prevInputs) => {
            const newInputs = { ...prevInputs, [name]: value };
            inputRef.current = newInputs;
            return newInputs;
        });
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (isLoading) return;
        setIsLoading(true);

        try {
            if (!gameConfig) return setIsLoading(false);

            // --- Validasi Input User ID & Server ---
            for (const inputName of gameConfig.required_inputs) {
                if (inputName in inputs && !inputs[inputName as keyof typeof inputs]) {
                    toast.error("Silahkan isi data akun terlebih dahulu.");
                    if (inputName === "id") {
                        idRef.current?.scrollIntoView({
                            behavior: "smooth",
                            block: "center"
                        });
                    }
                    if (inputName === "server") {
                        serverRef.current?.scrollIntoView({
                            behavior: "smooth",
                            block: "center"
                        });
                    }
                    return setIsLoading(false);
                }
            }

            // --- Validasi Produk ---
            if (!selectedProduct) {
                toast.error(
                    "Silahkan pilih nominal yang ingin dibeli terlebih dahulu."
                );
                productRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });
                return setIsLoading(false);
            }

            // --- Validasi Metode Pembayaran ---
            if (!selectedPayment) {
                toast.error("Silahkan pilih metode pembayaran terlebih dahulu.");
                paymentRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });
                return setIsLoading(false);
            }

            // --- Validasi Saldo (khusus jika pilih saldo) ---
            if (selectedPayment === "saldo" && saldo < totalPrice) {
                toast.error("Saldo kamu tidak mencukupi untuk melakukan pembelian.");
                return setIsLoading(false);
            }

            // --- Validasi WhatsApp ---
            // --- Validasi WhatsApp ---
            if (!whatsappFull) {
                toast.error("Nomor WhatsApp tidak boleh kosong.");
                whatsappRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                return setIsLoading(false);
            }

            // Hanya angka
            if (!/^[0-9]+$/.test(whatsappFull)) {
                setWhatsappError("Nomor WhatsApp harus berupa angka.");
                setIsConfirmOpen(true);
                return setIsLoading(false);
            }

            // Panjang minimal 9, maksimal 15 (standar internasional E.164)
            if (whatsappFull.length < 9 || whatsappFull.length > 15) {
                setWhatsappError("Nomor HP tidak valid. Pastikan nomor sudah benar.");
                setIsConfirmOpen(true);
                return setIsLoading(false);
            }

            // Jika valid → reset error
            setWhatsappError(null);


            // --- Validasi Nickname (jika game butuh cek nickname) ---
            if (gameConfig.status_validation_nickname === "yes") {
                await checkNickname();
            }

            // --- Buka Konfirmasi ---
            setIsConfirmOpen(true);
        } catch (error) {
            console.error("Error:", error);
            toast.error("Terjadi kesalahan, silakan coba lagi.");
        } finally {
            setIsLoading(false);
        }
    };

    const submitOrder = async () => {
        if (!gameConfig) return;

        setIsLoading(true);

        const jsonData: Record<string, any> = {
            game: slug,
            product_id: selectedProduct,
            payment_method_id: selectedPayment,
            whatsapp: whatsappFull,
            email: loggedInEmail || email,
            voucher_code: voucherCode,
            order_inputs: inputs,
            quantity
        };

        if (gameConfig.required_inputs.includes("id")) jsonData.id = inputs.id;
        if (gameConfig.required_inputs.includes("server"))
            jsonData.server = inputs.server;
        if (nickname) jsonData.nickname = nickname;
        jsonData.email = loggedInEmail || email;

        try {
            const response = await fetch("/api/order", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token ? `Bearer ${token}` : "",
                    "X-Device-Id": localStorage.getItem("device_id") ?? "",
                },
                body: JSON.stringify(jsonData)
            });

            const result = await response.json();
            setStatus(result.message);

            if (response.ok && result.data?.orderId) {
                toast.success("Pembelian berhasil, silakan lakukan pembayaran.");
                refreshUser();
                setIsConfirmOpen(false);
                router.push(`/invoices/${result.data.orderId}`);
            } else {
                toast.error(result.message || "Pembelian gagal silahkan coba lagi!");
            }
        } catch (error) {
            setStatus("Terjadi kesalahan silahkan coba lagi!");
            toast.error("Terjadi kesalahan silahkan coba lagi!");
        } finally {
            setIsLoading(false);
        }
    };

    if (error) {
        notFound();
    }

    if (dataGamesProductsPayment && !dataGamesProductsPayment.game) {
        notFound();
    }

    return (
        <ContentLayout title="Order">
            <main className="relative pb-28 sm:pb-0 ">
                <div>
                    <GameHeader
                        games={games}
                        backgroundTitle={settings?.data?.["general.background_title"]}
                    />
                </div>

                <div dir="ltr" data-orientation="horizontal" className="mt-2 lg:mt-4">
                    {/* Mobile Tabs */}

                    <form
                        onSubmit={handleSubmit}
                        className="relative container px-0.5 lg:px-4 mt-2 lg:mt-4"
                    >
                        <div className="sm:flex sm:flex-col sm:space-y-6 lg:grid lg:grid-cols-3 gap-8 lg:items-start">
                            <div className="lg:col-span-2 space-y-6 sm:space-y-8">
                                {/* ==== MOBILE TAB CONTROL ==== */}
                                <div className="container flex gap-2 h-10 items-center justify-center rounded-lg bg-muted text-muted-foreground w-full mt-4 md:hidden">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab("transaksi")}
                                        className={`w-full px-3 py-1.5 rounded-lg text-sm ${activeTab === "transaksi"
                                            ? "bg-primary text-primary-foreground"
                                            : ""
                                            }`}
                                    >
                                        {t("order.Transaksi")}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab("deskripsi")}
                                        className={`w-full px-3 py-1.5 rounded-lg text-sm ${activeTab === "deskripsi"
                                            ? "bg-primary text-primary-foreground"
                                            : ""
                                            }`}
                                    >
                                        {t("order.Deskripsi")}
                                    </button>
                                </div>

                                {/* ==== MOBILE + DESKTOP CONTENT (gabung jadi satu) ==== */}
                                <div className="space-y-6 gap-2 mb-6">
                                    {/* === Bagian Transaksi === */}
                                    <div
                                        className={`${activeTab === "transaksi" ? "block" : "hidden"
                                            } md:block`}
                                    >
                                        <div className="space-y-6">
                                            <InputSelection
                                                gameConfig={gameConfig}
                                                inputs={inputs}
                                                handleInputChange={handleInputChange}
                                                idRef={idRef}
                                                serverRef={serverRef}
                                                openGuideDrawer={openGuideDrawer}
                                            />

                                            <ProductSelection
                                                isLoading={isLoadingProduct}
                                                products={products}
                                                role={session?.user?.role}
                                                selectedProduct={selectedProduct}
                                                setSelectedProduct={setSelectedProduct}
                                                setSelectedProductDetails={setSelectedProductDetails}
                                                productRef={productRef}
                                                paymentRef={paymentRef}
                                                inputs={inputs}
                                                gameConfig={gameConfig}
                                                totalSold={(games as any)?.total_sold ?? 0}
                                            />

                                            <QuantityInput
                                                value={quantity}
                                                onChange={setQuantity}
                                                allowMulti={games?.allow_multi_quantity ?? true}
                                            />

                                            <PaymentSelection
                                                paymentRef={paymentRef}
                                                products={products}
                                                selectedProduct={selectedProduct}
                                                groupedPaymentMethods={groupedPaymentMethods}
                                                selectedPayment={selectedPayment}
                                                setSelectedPayment={setSelectedPayment}
                                                setSelectedPaymentDetails={setSelectedPaymentDetails}
                                                productPrice={productPrice}
                                                saldo={saldo}
                                                isLoggedIn={isLoggedIn}
                                                coinImage={coinImage}
                                                quantity={quantity}
                                                whatsappRef={whatsappRef}
                                                inputs={inputs}
                                                gameConfig={gameConfig}
                                            />

                                            <VoucherSelection
                                                productPrice={productPrice}
                                                selectedProduct={selectedProduct}
                                                slug={Array.isArray(slug) ? slug[0] : slug ?? ""}
                                                currentGameId={games?.id ?? null}
                                                id_games={inputs.id || null}
                                                server_games={inputs.server || null}
                                                onApply={applyVoucher}
                                                inputs={inputs}
                                                gameConfig={gameConfig}
                                            />

                                            <ContactDetails
                                                whatsappRef={whatsappRef}
                                                whatsapp={whatsapp}
                                                setWhatsapp={(raw, full) => {
                                                    setWhatsapp(raw);         // untuk UI & validasi
                                                    setWhatsappFull(full);    // untuk backend
                                                }}
                                                email={email}
                                                setEmail={setEmail}
                                                isLoggedIn={isLoggedIn}
                                                loggedInEmail={loggedInEmail}
                                            />
                                        </div>

                                        {/* Mobile-only Summary */}
                                        <div className="lg:hidden">
                                            <OrderSummaryMobile
                                                selectedProductDetails={selectedProductDetails}
                                                productPrice={productPrice}
                                                fee={fee}
                                                totalPrice={totalPrice}
                                                isLoading={isLoading}
                                                gameTitle={gameTitle}
                                                category={category}
                                                voucherDiscount={voucherDiscount}
                                                quantity={quantity}
                                                paymentMethod={selectedPaymentDetails?.name ?? ""}
                                                gameImage={games?.image}
                                            />
                                        </div>
                                    </div>

                                    {/* === Bagian Deskripsi (mobile only, desktop tetap tampil di bawah) === */}
                                    <div
                                        className={`${activeTab === "deskripsi" ? "block" : "hidden"
                                            } md:hidden`}
                                    >
                                        <div className="space-y-6">
                                            <GameDescription description={games?.description} />
                                            <ReviewSummaryMobile
                                                averageRating={averageRating}
                                                totalReviews={totalReviews}
                                                ratings={ratings}
                                                reviews={latestReviews}

                                            />
                                            <HelpCard waNumber={waNumber} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* === Sidebar (desktop only) === */}
                            <div className="hidden mt-4 space-y-6 lg:block sticky top-28">
                                <ReviewSummaryDesktop
                                    averageRating={averageRating}
                                    totalReviews={totalReviews}

                                />
                                <HelpCard waNumber={waNumber} />
                                <OrderSummaryDekstop
                                    selectedProductDetails={selectedProductDetails}
                                    productPrice={productPrice}
                                    fee={fee}
                                    totalPrice={totalPrice}
                                    isLoading={isLoading}
                                    gameTitle={gameTitle}
                                    category={category}
                                    voucherDiscount={voucherDiscount}
                                    quantity={quantity}
                                    paymentMethod={selectedPaymentDetails?.name ?? ""}
                                    games={games}
                                />
                            </div>
                        </div>

                        {/* === Game Description bawah (desktop) === */}
                        <div className="mt-6 sm:block hidden">
                            <GameDescription description={games?.description} />
                        </div>
                    </form>
                </div>
            </main>

            {/* Drawer Panduan */}
            <GuideDrawer
                open={isGuideOpen}
                onOpenChange={setIsGuideOpen}
                guideImage={
                    dataGamesProductsPayment?.gameConfiguration?.guide_image
                        ? `/api/proxy-image?path=${encodeURIComponent(
                            dataGamesProductsPayment.gameConfiguration.guide_image
                        )}`
                        : undefined
                }
                guideText={dataGamesProductsPayment?.gameConfiguration?.guide_text}
            />

            {/* Drawer Konfirmasi */}
            <ConfirmDrawer
                isOpen={isConfirmOpen}
                onOpenChange={setIsConfirmOpen}
                gameConfig={gameConfig}
                whatsappError={whatsappError}
                nicknameError={nicknameError}
                games={games}
                productName={productName}
                productPrice={productPrice}
                totalPrice={totalPrice}
                fee={fee}
                voucherDiscount={voucherDiscount}
                voucherCode={voucherCode}
                quantity={quantity}
                inputs={inputs}
                nickname={nickname}
                loggedInEmail={loggedInEmail}
                email={email}
                whatsapp={whatsapp}
                selectedPaymentDetails={selectedPaymentDetails}
                isLoading={isLoading}
                submitOrder={submitOrder}
            />
        </ContentLayout>
    );
}
