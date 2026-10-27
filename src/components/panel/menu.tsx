"use client";

import { useState } from "react";
import Link from "next/link";
import { Ellipsis, LogOut, LogIn, UserPlus } from "lucide-react";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";

import { cn } from "@/lib/utils";
import { getMenuList } from "@/lib/menu-list";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CollapseMenuButton } from "@/components/panel/collapse-menu-button";
import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
    TooltipProvider
} from "@/components/ui/tooltip";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle
} from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import { FcGoogle } from "react-icons/fc";
import { useTranslation } from "react-i18next"; // ✅ tambah i18n

interface MenuProps {
    isOpen: boolean | undefined;
}

export function Menu({ isOpen }: MenuProps) {
    const { t } = useTranslation(); // ✅ aktifkan i18n

    const { data: session } = useSession();
    const isLoggedIn = !!session;
    const pathname = usePathname();

    const isDesktop = useMediaQuery("(min-width: 768px)");
    // ✅ pass t ke getMenuList (sudah kamu update sebelumnya agar menerima t)
    const menuList = getMenuList(pathname, isLoggedIn, !isDesktop, t);

    const [open, setOpen] = useState(false);

    const txtSignIn = t("auth.sign_in", { defaultValue: "Masuk" });
    const txtSignOut = t("auth.sign_out", { defaultValue: "Keluar" });
    const txtAreYouSureSignOut = t("auth.sign_out_confirm", {
        defaultValue: "Apakah Anda yakin ingin keluar?"
    });
    const txtSignUp = t("auth.sign_up", { defaultValue: "Daftar" });
    const txtClose = t("common.close", { defaultValue: "Tutup" });

    const getClientInfo = async () => {
        const res = await fetch("/api/client-info");
        const json = await res.json();

        const deviceId =
            localStorage.getItem("device_id") ||
            crypto.randomUUID();

        // 🔥 TAMBAHAN (samakan semua flow login)
        const fingerprint = {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            screen: `${window.screen.width}x${window.screen.height}`,
        };

        localStorage.setItem("device_id", deviceId);

        json.data.device_id = deviceId;
        json.data.fingerprint = fingerprint;

        document.cookie = `client_info=${encodeURIComponent(
            JSON.stringify(json.data)
        )}; path=/`;

        return json.data;
    };

    return (
        <ScrollArea className="[&>div>div[style]]:!block">
            <nav className="h-full w-full">
                <ul className="flex flex-col min-h-[calc(100vh-48px-36px-16px-32px)] lg:min-h-[calc(100vh-32px-40px-32px)] items-start space-y-1 px-2">
                    {menuList.map(({ groupLabel, menus }, index) => (
                        <li className={cn("w-full", groupLabel ? "pt-5" : "")} key={index}>
                            {(isOpen && groupLabel) || isOpen === undefined ? (
                                <p className="hidden text-sm font-medium text-muted-foreground px-4 pb-2 max-w-[248px] truncate">
                                    {groupLabel}
                                </p>
                            ) : !isOpen && isOpen !== undefined && groupLabel ? (
                                <TooltipProvider>
                                    <Tooltip delayDuration={100}>
                                        <TooltipTrigger className="w-full">
                                            <div className="w-full flex justify-center items-center">
                                                <Ellipsis className="h-5 w-5" />
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent side="right">
                                            <p>{groupLabel}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            ) : (
                                <p className="pb-2"></p>
                            )}

                            {menus.map(({ href, label, icon: Icon, active, submenus }, idx) =>
                                !submenus || submenus.length === 0 ? (
                                    <div className="w-full" key={idx}>
                                        <TooltipProvider disableHoverableContent>
                                            <Tooltip delayDuration={100}>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant={
                                                            (active === undefined &&
                                                                (pathname === href ||
                                                                    pathname.startsWith(`${href}/`))) ||
                                                                active
                                                                ? "secondary"
                                                                : "ghost"
                                                        }
                                                        className="w-full justify-start h-10 mb-1"
                                                        asChild
                                                    >
                                                        <Link href={href}>
                                                            <span
                                                                className={cn(isOpen === false ? "" : "mr-4")}
                                                            >
                                                                <Icon size={18} />
                                                            </span>
                                                            <p
                                                                className={cn(
                                                                    "max-w-[200px] truncate",
                                                                    isOpen === false
                                                                        ? "-translate-x-96 opacity-0"
                                                                        : "translate-x-0 opacity-100"
                                                                )}
                                                            >
                                                                {label}
                                                            </p>
                                                        </Link>
                                                    </Button>
                                                </TooltipTrigger>
                                                {isOpen === false && (
                                                    <TooltipContent side="right">{label}</TooltipContent>
                                                )}
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                ) : (
                                    <div className="w-full" key={idx}>
                                        <CollapseMenuButton
                                            icon={Icon}
                                            label={label}
                                            active={
                                                active === undefined
                                                    ? pathname.startsWith(href)
                                                    : active
                                            }
                                            submenus={submenus}
                                            isOpen={isOpen}
                                        />
                                    </div>
                                )
                            )}
                        </li>
                    ))}

                    {/* Tombol Login/Logout */}
                    {!isLoggedIn && (
                        <li className="w-full">
                            {/* Garis pembatas */}
                            <div className={cn("my-3", isOpen === false ? "mx-1" : "mx-0")}>
                                <div className="h-[1px] w-full bg-border"></div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <TooltipProvider disableHoverableContent>
                                    <Tooltip delayDuration={100}>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                className="w-full justify-start h-10"
                                                asChild
                                            >
                                                <Link href="/signin">
                                                    <span className={cn(isOpen === false ? "" : "mr-4")}>
                                                        <LogIn size={18} />
                                                    </span>
                                                    <p className={cn(
                                                        "whitespace-nowrap",
                                                        isOpen === false ? "opacity-0 hidden" : "opacity-100"
                                                    )}>
                                                        {txtSignIn}
                                                    </p>
                                                </Link>
                                            </Button>
                                        </TooltipTrigger>
                                        {isOpen === false && (
                                            <TooltipContent side="right">{txtSignIn}</TooltipContent>
                                        )}
                                    </Tooltip>
                                </TooltipProvider>
                                <TooltipProvider disableHoverableContent>
                                    <Tooltip delayDuration={100}>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                className="w-full justify-start h-10"
                                                asChild
                                            >
                                                <Link href="/sign-up">
                                                    <span className={cn(isOpen === false ? "" : "mr-4")}>
                                                        <UserPlus size={18} />
                                                    </span>
                                                    <p className={cn(
                                                        "whitespace-nowrap",
                                                        isOpen === false ? "opacity-0 hidden" : "opacity-100"
                                                    )}>
                                                        {txtSignUp}
                                                    </p>
                                                </Link>
                                            </Button>
                                        </TooltipTrigger>
                                        {isOpen === false && (
                                            <TooltipContent side="right">{txtSignUp}</TooltipContent>
                                        )}
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        </li>
                    )}
                    {isLoggedIn && (
                        <li className="w-full grow flex items-end">
                            <TooltipProvider disableHoverableContent>
                                <Tooltip delayDuration={100}>
                                    <TooltipTrigger asChild>
                                        <Button
                                            onClick={() => setOpen(true)}
                                            variant="destructive"
                                            className="w-full justify-center h-10 mt-5"
                                        >
                                            <span className={cn(isOpen === false ? "" : "mr-4")}>
                                                <LogOut size={18} />
                                            </span>
                                            <p
                                                className={cn(
                                                    "whitespace-nowrap",
                                                    isOpen === false ? "opacity-0 hidden" : "opacity-100"
                                                )}
                                            >
                                                {txtSignOut}
                                            </p>
                                        </Button>
                                    </TooltipTrigger>
                                    {isOpen === false && (
                                        <TooltipContent side="right">
                                            {txtSignOut}
                                        </TooltipContent>
                                    )}
                                </Tooltip>
                            </TooltipProvider>
                        </li>
                    )}
                </ul>
            </nav>

            {/* Modal / Drawer untuk Logout */}
            {isLoggedIn && isDesktop && (
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>{txtSignOut}</DialogTitle>
                            <DialogDescription>
                                {txtAreYouSureSignOut}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col items-center space-y-4">
                            <Button
                                variant="destructive"
                                onClick={() => signOut({ callbackUrl: "/signin?logout=success" })}
                            >
                                {txtSignOut}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
            {isLoggedIn && !isDesktop && (
                <Drawer open={open} onOpenChange={setOpen}>
                    <DrawerContent>
                        <DrawerHeader className="text-left">
                            <DrawerTitle>{txtSignOut}</DrawerTitle>
                            <DrawerDescription>
                                {txtAreYouSureSignOut}
                            </DrawerDescription>
                        </DrawerHeader>
                        <DrawerFooter className="pt-2">
                            <Button
                                variant="destructive"
                                onClick={() => signOut({ callbackUrl: "/signin?logout=success" })}
                            >
                                {txtSignOut}
                            </Button>
                            <DrawerClose asChild>
                                <Button variant="outline">{txtClose}</Button>
                            </DrawerClose>
                        </DrawerFooter>
                    </DrawerContent>
                </Drawer>
            )}
        </ScrollArea>
    );
}
