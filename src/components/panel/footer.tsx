"use client";



import Link from "next/link";

import Image from "next/image";

import { useTranslation } from "react-i18next";

import { useSettings } from "@/context/settings-context";



import { Skeleton } from "@/components/ui/skeleton";



/* ================= DOMAIN ================= */



const siteUrl =

    process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

const siteDomain = new URL(siteUrl).hostname.replace(/^www\./, "");



/* ================= SVG ICONS ================= */



const FacebookIcon = ({ className }: { className?: string }) => (

    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>

        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />

    </svg>

);



const InstagramIcon = ({ className }: { className?: string }) => (

    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>

        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />

    </svg>

);



const WhatsAppIcon = ({ className }: { className?: string }) => (

    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>

        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />

    </svg>

);



const XTwitterIcon = ({ className }: { className?: string }) => (

    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>

        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />

    </svg>

);



const YoutubeIcon = ({ className }: { className?: string }) => (

    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>

        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />

    </svg>

);



const TiktokIcon = ({ className }: { className?: string }) => (

    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>

        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />

    </svg>

);



const PhoneIcon = ({ className }: { className?: string }) => (

    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>

        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />

    </svg>

);



const MailIcon = ({ className }: { className?: string }) => (

    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>

        <rect width="20" height="16" x="2" y="4" rx="2" />

        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />

    </svg>

);



const LocationIcon = ({ className }: { className?: string }) => (

    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>

        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />

        <circle cx="12" cy="10" r="3" />

    </svg>

);



/* ============================================ */



export function Footer() {

    const { i18n, t } = useTranslation();

    const lang = i18n.language || "id";

    const settings = useSettings();



    const logoUrl = settings?.data?.["general.logo"];

    const logoTitle = settings?.data?.["general.title"];

    const footerImage = settings?.data?.["general.footer_banner"];



    const address = settings?.data?.["sosmed.address"];



    const descriptionText =

        (lang === "en"

            ? settings?.data?.["seo_description_en"]

            : settings?.data?.["seo_description_id"]) ?? "";



    const siteDescription =

        settings?.data?.["seo.title"] ||

        settings?.data?.["general.title"] ||

        "Website";



    /* ================================================= */



    return (

        <>

            {/* ===== FOOTER BANNER ===== */}

            <div className="w-full overflow-hidden">

                {footerImage && (

                    <Image

                        src={footerImage}

                        alt="Footer Banner"

                        width={1920}

                        height={500}

                        className="w-full h-auto object-cover"

                        priority

                        quality={100}

                    />

                )}

            </div>



            <footer className="bg-secondary pt-12 pb-6 print:hidden">

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">



                    {/* ================= GRID: Menggunakan grid-cols-2 untuk mobile, lalu lg:grid-cols-4 ================= */}

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-4 sm:gap-10 mb-10">



                        {/* ================= COLUMN 1: BRAND INFO ================= */}

                        {/* Ditambahkan col-span-2 agar mengambil lebar penuh di mobile, lalu lg:col-span-1 di desktop */}

                        <div className="col-span-2 lg:col-span-1 space-y-5">

                            <Link href="/">

                                {logoUrl ? (

                                    <Image

                                        src={logoUrl}

                                        alt={logoTitle || "logo"}

                                        width={200}

                                        height={60}

                                        className="h-10 w-auto object-contain"

                                    />

                                ) : (

                                    <Skeleton className="h-10 w-40" />

                                )}

                            </Link>



                            <p className="text-sm leading-relaxed text-secondary-foreground">

                                {descriptionText}

                            </p>



                            {/* Contact Info */}

                            <div className="space-y-3">

                                {settings?.data?.["sosmed.wa"] && (

                                    <div className="flex items-center gap-3 text-sm text-secondary-foreground">

                                        <PhoneIcon className="w-4 h-4 flex-shrink-0" />

                                        <span>{settings.data["sosmed.wa"]}</span>

                                    </div>

                                )}



                                {settings?.data?.["sosmed.email"] && (

                                    <div className="flex items-center gap-3 text-sm text-secondary-foreground">

                                        <MailIcon className="w-4 h-4 flex-shrink-0" />

                                        <span>{settings.data["sosmed.email"]}</span>

                                    </div>

                                )}



                                {address && (

                                    <div className="flex items-start gap-3 text-sm text-secondary-foreground">

                                        <LocationIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />

                                        <span className="leading-relaxed">{address}</span>

                                    </div>

                                )}

                            </div>

                        </div>



                        {/* ================= COLUMN 2: SITE MAP ================= */}

                        {/* Tetap 1 kolom, jadi akan sejajar dengan INFORMASI di mobile */}

                        <div className="col-span-1">

                            <h3 className="font-bold text-base mb-4 text-foreground">

                                {t("footer.site_map")}

                            </h3>



                            <ul className="space-y-3 text-sm">

                                <li>

                                    <Link className="text-secondary-foreground hover:text-primary transition-colors" href="/">

                                        {t("footer.home")}

                                    </Link>

                                </li>

                                <li>

                                    <Link className="text-secondary-foreground hover:text-primary transition-colors" href="/reviews">

                                        {t("footer.reviews")}

                                    </Link>

                                </li>

                                <li>

                                    <Link className="text-secondary-foreground hover:text-primary transition-colors" href="/invoices">

                                        {t("footer.invoice")}

                                    </Link>

                                </li>

                                <li>

                                    <Link className="text-secondary-foreground hover:text-primary transition-colors" href="/price-list">

                                        {t("footer.pricelist")}

                                    </Link>

                                </li>

                                <li>

                                    <Link className="text-secondary-foreground hover:text-primary transition-colors" href="/artikel">

                                        {t("footer.article")}

                                    </Link>

                                </li>

                                <li>

                                    <Link className="text-secondary-foreground hover:text-primary transition-colors" href="/contact">

                                        {t("footer.contact")}

                                    </Link>

                                </li>

                                <li>

                                    <Link className="text-secondary-foreground hover:text-primary transition-colors" href="/partnership">

                                        {t("footer.partnership", { defaultValue: "Partnership" })}

                                    </Link>

                                </li>

                            </ul>

                        </div>



                        {/* ================= COLUMN 3: INFORMASI ================= */}

                        {/* Tetap 1 kolom, jadi akan sejajar dengan SITE MAP di mobile */}

                        <div className="col-span-1">

                            <h3 className="font-bold text-base mb-4 text-foreground">

                                {t("footer.info")}

                            </h3>



                            <ul className="space-y-3 text-sm">

                                <li>

                                    <Link className="text-secondary-foreground hover:text-primary transition-colors" href="/privacy-policy">

                                        {t("footer.privacy")}

                                    </Link>

                                </li>

                                <li>

                                    <Link className="text-secondary-foreground hover:text-primary transition-colors" href="/terms-and-condition">

                                        Syarat &amp; Ketentuan

                                    </Link>

                                </li>

                                <li>

                                    <Link className="text-secondary-foreground hover:text-primary transition-colors" href={`https://docs.${siteDomain}/`}>

                                        {t("footer.api_docs")}

                                    </Link>

                                </li>

                            </ul>

                        </div>



                        {/* ================= COLUMN 4: FOLLOW US ================= */}

                        {/* Ditambahkan col-span-2 agar bagian sosmed kembali ambil lebar penuh di mobile */}

                        <div className="col-span-2 lg:col-span-1">

                            <h3 className="font-bold text-base mb-4 text-foreground">

                                Follow Us

                            </h3>



                            <div className="flex flex-wrap gap-3">

                                {settings?.data?.["sosmed.fb"] && (

                                    <Link

                                        href={`https://facebook.com/${settings.data["sosmed.fb"]}`}

                                        target="_blank"

                                        rel="noopener noreferrer"

                                        className="w-10 h-10 rounded-full bg-foreground/10 hover:bg-primary hover:text-primary-foreground flex items-center justify-center text-secondary-foreground transition-all duration-300"

                                        aria-label="Facebook"

                                    >

                                        <FacebookIcon className="w-5 h-5" />

                                    </Link>

                                )}



                                {settings?.data?.["sosmed.ig"] && (

                                    <Link

                                        href={`https://instagram.com/${settings.data["sosmed.ig"]}`}

                                        target="_blank"

                                        rel="noopener noreferrer"

                                        className="w-10 h-10 rounded-full bg-foreground/10 hover:bg-primary hover:text-primary-foreground flex items-center justify-center text-secondary-foreground transition-all duration-300"

                                        aria-label="Instagram"

                                    >

                                        <InstagramIcon className="w-5 h-5" />

                                    </Link>

                                )}



                                {settings?.data?.["sosmed.wa"] && (

                                    <Link

                                        href={`https://wa.me/${settings.data["sosmed.wa"]}`}

                                        target="_blank"

                                        rel="noopener noreferrer"

                                        className="w-10 h-10 rounded-full bg-foreground/10 hover:bg-primary hover:text-primary-foreground flex items-center justify-center text-secondary-foreground transition-all duration-300"

                                        aria-label="WhatsApp"

                                    >

                                        <WhatsAppIcon className="w-5 h-5" />

                                    </Link>

                                )}



                                {settings?.data?.["sosmed.x"] && (

                                    <Link

                                        href={`https://x.com/${settings.data["sosmed.x"]}`}

                                        target="_blank"

                                        rel="noopener noreferrer"

                                        className="w-10 h-10 rounded-full bg-foreground/10 hover:bg-primary hover:text-primary-foreground flex items-center justify-center text-secondary-foreground transition-all duration-300"

                                        aria-label="X / Twitter"

                                    >

                                        <XTwitterIcon className="w-5 h-5" />

                                    </Link>

                                )}



                                {settings?.data?.["sosmed.yt"] && (

                                    <Link

                                        href={`https://youtube.com/${settings.data["sosmed.yt"]}`}

                                        target="_blank"

                                        rel="noopener noreferrer"

                                        className="w-10 h-10 rounded-full bg-foreground/10 hover:bg-primary hover:text-primary-foreground flex items-center justify-center text-secondary-foreground transition-all duration-300"

                                        aria-label="YouTube"

                                    >

                                        <YoutubeIcon className="w-5 h-5" />

                                    </Link>

                                )}



                                {settings?.data?.["sosmed.tiktok"] && (

                                    <Link

                                        href={`https://tiktok.com/@${settings.data["sosmed.tiktok"]}`}

                                        target="_blank"

                                        rel="noopener noreferrer"

                                        className="w-10 h-10 rounded-full bg-foreground/10 hover:bg-primary hover:text-primary-foreground flex items-center justify-center text-secondary-foreground transition-all duration-300"

                                        aria-label="TikTok"

                                    >

                                        <TiktokIcon className="w-5 h-5" />

                                    </Link>

                                )}

                            </div>

                        </div>

                    </div>



                    {/* ================= BOTTOM BAR ================= */}

                    <div className="border-t border-foreground/10 pt-6 flex flex-col md:flex-row md:items-center justify-between gap-4">

                        <p className="text-sm text-secondary-foreground text-center md:text-left">

                            © {new Date().getFullYear()}{" "}

                            <span className="font-semibold text-foreground">

                                {siteDescription}

                            </span>

                            . All rights reserved.

                        </p>

                    </div>

                </div>

            </footer>

        </>

    );

}