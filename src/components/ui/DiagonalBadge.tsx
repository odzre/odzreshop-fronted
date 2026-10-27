"use client";

import { cn } from "@/lib/utils";

interface DiagonalBadgeProps {
    label?: string;
    className?: string;
    backgroundColor?: string;
    textColor?: string;
    textSize?: string; // Tambahan: kontrol ukuran teks
}

export default function DiagonalBadge({
    label = "BEST PRICE",
    className = "",
    backgroundColor = "bg-primary",
    textColor = "text-white",
    textSize = "text-xxs", // Default kecil
}: DiagonalBadgeProps) {
    return (
        <div className="flex aspect-square items-center">
            <div className="w-[4.5rem] absolute overflow-hidden aspect-square -top-[7px] -right-[7px] rounded-sm">
                <div className={`absolute top-0 left-0 ${backgroundColor} opacity-50 h-2 w-2`} />
                <div className={`absolute bottom-0 right-0 ${backgroundColor} opacity-50 h-2 w-2`} />
                <div
                    className={cn(
                        "absolute block w-square-diagonal py-1 text-center font-semibold uppercase bottom-0 right-0 rotate-45 origin-bottom-right shadow-sm",
                        backgroundColor,
                        textColor,
                        textSize,
                        className
                    )}
                >
                    {label}
                </div>
            </div>
        </div>
    );
}
