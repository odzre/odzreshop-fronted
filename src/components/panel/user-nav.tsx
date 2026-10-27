"use client";

import { useSession, signOut } from "next-auth/react";
import { jwtDecode } from "jwt-decode";
import { useEffect } from "react";
import Link from "next/link";
import { LogOut, User, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "react-i18next";
import { useUser } from "@/hooks/use-user"; // ✅ ambil saldo realtime
import { useCurrency } from "@/hooks/useCurrency";

export function UserNav() {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const { user, refreshUser } = useUser(); // ✅ hook saldo user
  const { format } = useCurrency();

  // --- AUTO LOGOUT JIKA TOKEN EXPIRED ---
  useEffect(() => {
    if (session?.user?.token) {
      try {
        const { exp } = jwtDecode<{ exp: number }>(session.user.token);
        if (exp * 1000 < Date.now()) {
          signOut(); // atau signOut({ callbackUrl: "/signin" });
        }
      } catch {
        signOut();
      }
    }
  }, [session]);
  // --- END AUTO LOGOUT ---

  const getBadgeClass = (role?: string) => {
    switch (role) {
      case "gold":
        return "bg-yellow-500 text-white";
      case "platinum":
        return "bg-gray-400 text-black";
      case "reseller":
        return "bg-emerald-500 text-white";
      case "basic":
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  return (
    <DropdownMenu>
      <TooltipProvider disableHoverableContent>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="relative h-8 w-8 rounded-full"
              >
                {session?.user ? (
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={session.user.image || ""}
                      alt={session.user.name || "User"}
                    />
                    <AvatarFallback className="bg-transparent">
                      {session.user.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-transparent">
                      U
                    </AvatarFallback>
                  </Avatar>
                )}
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">{t("Profil")}</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal space-y-3">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none flex items-center gap-2">
              {session?.user?.name || "User"}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {session?.user?.email || "user@example.com"}
            </p>
          </div>
          <Badge className={`w-fit ${getBadgeClass(session?.user?.role)}`}>
            {session?.user?.role || "basic"}
          </Badge>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem disabled className="opacity-100">
            <Wallet className="w-4 h-4 mr-3 text-muted-foreground" />
            {t("Saldo")}:
            <span className="ml-auto font-medium">
              {format(Number(user?.saldo ?? session?.user?.saldo ?? 0))}
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem className="hover:cursor-pointer" asChild>
            <Link href="/dashboard" className="flex items-center">
              <User className="w-4 h-4 mr-3 text-muted-foreground" />
              {t("Profil")}
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="hover:cursor-pointer"
          onClick={() => signOut()}
        >
          <LogOut className="w-4 h-4 mr-3 text-muted-foreground" />
          {t("Keluar")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
