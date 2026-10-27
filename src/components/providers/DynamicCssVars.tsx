"use client";

import { useEffect } from "react";
import { useSettings } from "@/context/settings-context";

// HEX → HSL (Tailwind compatible)
function hexToHSL(hex: string): string {
    hex = hex.replace("#", "");

    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);

    let h = 0;
    let s = 0;

    const l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;

        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }

        h *= 60;
    }

    return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function setVar(
    element: HTMLElement,
    cssVar: string,
    hex: string | undefined
) {
    if (!hex || !hex.startsWith("#")) return;

    const hsl = hexToHSL(hex);
    element.style.setProperty(cssVar, hsl);
}

export function DynamicCssVars() {
    const settings = useSettings();

    useEffect(() => {
        if (!settings.success) return;

        const data = settings.data;

        const root = document.documentElement;
        const body = document.body;

        function applyTheme() {

            /*
            |------------------------------------------------------------------
            | MAIN COLORS
            |------------------------------------------------------------------
            */

            setVar(root, "--my-color-1", data["general.warna.1"]);
            setVar(root, "--my-color-2", data["general.warna.2"]);
            setVar(root, "--my-color-3", data["general.warna.3"]);

            /*
            |------------------------------------------------------------------
            | DARK THEME (Default & Only Theme)
            |------------------------------------------------------------------
            */

            setVar(root, "--background", data["theme.dark.background"]);
            setVar(root, "--foreground", data["theme.dark.foreground"]);

            setVar(root, "--card", data["theme.dark.card"]);
            setVar(root, "--card-foreground", data["theme.dark.card_foreground"]);

            setVar(root, "--popover", data["theme.dark.popover"]);
            setVar(root, "--popover-foreground", data["theme.dark.popover_foreground"]);

            setVar(root, "--primary", data["theme.dark.primary"]);
            setVar(root, "--primary-foreground", data["theme.dark.primary_foreground"]);

            setVar(root, "--secondary", data["theme.dark.secondary"]);
            setVar(root, "--secondary-foreground", data["theme.dark.secondary_foreground"]);

            setVar(root, "--muted", data["theme.dark.muted"]);
            setVar(root, "--muted-foreground", data["theme.dark.muted_foreground"]);

            setVar(root, "--accent", data["theme.dark.accent"]);
            setVar(root, "--accent-foreground", data["theme.dark.accent_foreground"]);

            setVar(root, "--destructive", data["theme.dark.destructive"]);
            setVar(root, "--destructive-foreground", data["theme.dark.destructive_foreground"]);

            setVar(root, "--border", data["theme.dark.border"]);
            setVar(root, "--input", data["theme.dark.input"]);
            setVar(root, "--ring", data["theme.dark.ring"]);

            if (data["theme.root.radius"]) {
                root.style.setProperty("--radius", data["theme.root.radius"]);
            }

            /*
            |------------------------------------------------------------------
            | GRADIENT BACKGROUND
            |------------------------------------------------------------------
            */

            if (data["theme.gradient.active"]) {

                const dir = data["theme.gradient.dir"] || "to top left";

                const from = data["theme.gradient.from.color"];
                const via = data["theme.gradient.via.color"];
                const to = data["theme.gradient.to.color"];

                const fromStop = data["theme.gradient.from.stop"] ?? 0;
                const viaStop = data["theme.gradient.via.stop"] ?? 50;
                const toStop = data["theme.gradient.to.stop"] ?? 100;

                if (from && via && to) {

                    const gradient = `linear-gradient(
                        ${dir},
                        ${from} ${fromStop}%,
                        ${via} ${viaStop}%,
                        ${to} ${toStop}%
                    )`;

                    root.style.setProperty("--body-gradient", gradient);

                    body.classList.add("gradient");
                    body.classList.remove("bg-background");
                }

            } else {

                body.classList.remove("gradient");
                body.classList.add("bg-background");

            }
        }

        // apply first time
        applyTheme();

        // observe theme toggle
        const observer = new MutationObserver(() => {
            applyTheme();
        });

        observer.observe(root, {
            attributes: true,
            attributeFilter: ["class"]
        });

        return () => observer.disconnect();

    }, [settings]);

    return null;
}