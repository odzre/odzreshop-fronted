"use client";

import { useMemo } from "react";
import { useSettings } from "@/context/settings-context";

function OdometerDigit({ value }: { value: number }) {
    return (
        <div className="relative h-6 overflow-hidden">
            <div
                className="transition-transform duration-500 ease-in-out"
                style={{ transform: `translateY(-${value * 1.5}rem)` }}
            >
                {Array.from({ length: 10 }).map((_, i) => (
                    <div
                        key={i}
                        className="flex h-6 items-center justify-center text-sm lg:text-sm "
                    >
                        {i}
                    </div>
                ))}
            </div>
        </div>
    );
}

export function OdometerNumber({ number }: { number: number }) {
    const { data } = useSettings();
    const currency = data?.region?.currency ?? "IDR";
    const regionCode = data?.region?.active ?? "ID";
    const locale = regionCode === "MY" ? "ms-MY" : "id-ID";
    const formatted = useMemo(() => {
        return number.toLocaleString(locale, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    }, [number, locale]);
    const prefix = useMemo(() => (currency === "MYR" ? "MYR" : "Rp"), [currency]);

    const digits = useMemo(() => formatted.split(""), [formatted]);

    return (
        <div className="flex items-center">
            <span className="font-semibold text-sm lg:text-sm mr-1">{prefix}</span>
            {digits.map((char, idx) =>
                /\d/.test(char) ? (
                    <OdometerDigit key={idx} value={parseInt(char)} />
                ) : (
                    <span key={idx} className="text-lg">
                        {char}
                    </span>
                )
            )}
        </div>
    );
}
