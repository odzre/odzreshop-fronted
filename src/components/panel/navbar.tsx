"use client"

import { useSession } from "next-auth/react"
import { useSettings } from "@/context/settings-context"
import { useUser } from "@/hooks/use-user"
import { getMenuList } from "@/lib/menu-list"
import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/use-media-query"
import LanguageDrawer from "@/components/panel/LanguageDrawer"
import { useTranslation } from "react-i18next"

import { usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { LogIn } from "lucide-react"

import { SheetMenu } from "@/components/panel/sheet-menu"
import { Search } from "@/components/panel/search"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { UserNav } from "@/components/panel/user-nav"
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent
} from "@/components/ui/dropdown-menu"

import { UnderlineNav } from "@/components/ui/UnderlineNav"
import type { LucideIcon } from "lucide-react"

export function Navbar() {
    const { t } = useTranslation()

    interface Settings {
        data: {
            ["general.logo"]?: string
            ["general.title"]?: string
        }
    }

    const { data: session } = useSession()
    const { refreshUser } = useUser()
    const isLoggedIn = !!session

    const settings = useSettings() as unknown as Settings | null
    const logoUrl = settings?.data?.["general.logo"]
    const logoTitle = settings?.data?.["general.title"]
    const pathname = usePathname()

    const isDesktop = useMediaQuery("(min-width: 768px)")
    const menuList = getMenuList(pathname, isLoggedIn, !isDesktop, t)

    return (
        <header className="sticky top-0 z-20 w-full bg-background/95 shadow backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:shadow-secondary">
            <div className="container flex h-16 items-center justify-between gap-4">
                <div className="flex items-center justify-start">
                    {/* === Kiri: Logo === */}
                    <Link href="/">
                        {logoUrl ? (
                            <Image
                                src={logoUrl}
                                alt={logoTitle || "logo"}
                                width={1000}
                                height={1000}
                                priority
                                className="h-9 w-auto lg:h-10"
                            />
                        ) : (
                            <Skeleton className="w-32 h-10 sm:hidden" />
                        )}
                    </Link>
                </div>


                {/* === Kanan: Search & Auth === */}
                <div className="flex flex-1 items-center justify-end gap-2">
                    <Search />
                    <LanguageDrawer />

                    {!isLoggedIn && (
                        <Button
                            variant="outline"
                            size="lg"
                            asChild
                            className="hidden sm:flex gap-2 p-4 px-3 shadow-none"
                        >
                            <Link href="/signin">
                                <LogIn className="w-5 h-5" />
                                <span>
                                    {t("auth.sign_in", { defaultValue: "Masuk" })}
                                </span>
                            </Link>
                        </Button>
                    )}

                    {session && <UserNav />}

                    <SheetMenu />
                </div>
            </div>


            {/* === Menu Navigasi Desktop === */}
            <nav className="border-y border-muted">
                <div className="container w-full mx-auto px-4">
                    <UnderlineNav activeSelector=".nav-link-active">
                        {({ handleHover }) => (
                            <ul className="flex items-center gap-3 overflow-y-hidden truncate hidden md:flex h-12">
                                {menuList.map(({ menus }) =>
                                    menus.map(({ href, label, icon: Icon, submenus }) =>
                                        Array.isArray(submenus) && submenus.length > 0 ? (
                                            <li key={href} className="relative">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <button
                                                            className={cn(
                                                                "flex items-center gap-2 text-sm px-2 py-3 text-foreground hover:text-primary transition-colors",
                                                                pathname.startsWith(href) && "text-primary nav-link-active"
                                                            )}
                                                            onMouseEnter={handleHover}
                                                        >
                                                            <Icon size={16} />
                                                            <span>{label}</span>
                                                        </button>
                                                    </DropdownMenuTrigger>

                                                    <DropdownMenuContent className="w-64">
                                                        {submenus.map((submenu) => {
                                                            const SubIcon = submenu.icon as LucideIcon | undefined

                                                            return (
                                                                <Link
                                                                    key={submenu.href}
                                                                    href={submenu.href}
                                                                    className={cn(
                                                                        "block px-3 py-2 hover:bg-muted rounded transition-colors",
                                                                        pathname === submenu.href
                                                                            ? "bg-muted font-semibold"
                                                                            : ""
                                                                    )}
                                                                >
                                                                    <div className="flex gap-3 items-start">
                                                                        {SubIcon && (
                                                                            <SubIcon className="w-4 h-4 mt-1 text-foreground/80 flex-shrink-0" />
                                                                        )}
                                                                        <div className="flex flex-col gap-1">
                                                                            <span className="text-sm font-semibold">
                                                                                {submenu.label}
                                                                            </span>
                                                                            {submenu.title && (
                                                                                <span className="text-xs text-foreground/75">
                                                                                    {submenu.title}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </Link>
                                                            )
                                                        })}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </li>
                                        ) : (
                                            <li key={href}>
                                                <Link
                                                    href={href}
                                                    className={cn(
                                                        "flex items-center gap-2 text-sm px-2 py-3 text-foreground hover:text-primary transition-colors",
                                                        (pathname === href ||
                                                            pathname.startsWith(`${href}/`)) &&
                                                        "text-primary nav-link-active"
                                                    )}
                                                    onMouseEnter={handleHover}
                                                >
                                                    <Icon size={16} />
                                                    <span>{label}</span>
                                                </Link>
                                            </li>
                                        )
                                    )
                                )}
                            </ul>
                        )}
                    </UnderlineNav>
                </div>
            </nav>
        </header>
    )
}