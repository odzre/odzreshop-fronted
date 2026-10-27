"use client";

import { useEffect, useState } from "react";

export function useImageColor(img: HTMLImageElement | null) {
    const [color, setColor] = useState<string | null>(null);

    useEffect(() => {
        if (!img) return;
        if (typeof window === "undefined") return;

        const extract = async () => {
            try {
                // ✅ paksa type jadi constructor
                const mod = await import("colorthief");
                const ColorThief = (mod.default ||
                    mod) as unknown as {
                        new(): {
                            getColor(img: HTMLImageElement): [number, number, number];
                        };
                    };

                const temp = new Image();
                temp.crossOrigin = "anonymous";
                temp.src = img.currentSrc || img.src;

                await temp.decode();

                const thief = new ColorThief();
                const [r, g, b] = thief.getColor(temp);

                setColor(`rgb(${r}, ${g}, ${b})`);
            } catch (e) {
                console.error("Color extract failed:", e);
            }
        };

        extract();
    }, [img]);

    return color;
}