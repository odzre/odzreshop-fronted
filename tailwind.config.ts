import type { Config } from "tailwindcss";

const config = {
    darkMode: ["class"],
    content: [
        "./pages/**/*.{ts,tsx}",
        "./components/**/*.{ts,tsx}",
        "./app/**/*.{ts,tsx}",
        "./src/**/*.{ts,tsx}",
        "./styles/**/*.{css,scss}"
    ],
    safelist: [
        {
            pattern: /^(bg|text|border|from|to|via)-my-color[123](\/(5|10|15|20|30|40|50))?$/,
        },
    ],
    prefix: "",
    theme: {
        container: {
            center: true,
            padding: "1rem"
        },
        extend: {
            backgroundImage: {
                "title-overlay": "var(--image-overlay)",
                "product-overlay": "var(--image-product)",
                "flashsale-overlay": "var(--image-flashsale)",
                "popular-overlay": "var(--image-popular)"
            },
            colors: {
                "my-color1": "hsl(var(--my-color-1))",
                "my-color2": "hsl(var(--my-color-2))",
                "my-color3": "hsl(var(--my-color-3))",

                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))"
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))"
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))"
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))"
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))"
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))"
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))"
                }
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 6px)",
                sm: "calc(var(--radius) - 4px)"
            },
            keyframes: {
                "accordion-down": {
                    from: { height: "0" },
                    to: { height: "var(--radix-accordion-content-height)" }
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: "0" }
                },
                "collapsible-down": {
                    from: { height: "0" },
                    to: { height: "var(--radix-collapsible-content-height)" }
                },
                "collapsible-up": {
                    from: { height: "var(--radix-collapsible-content-height)" },
                    to: { height: "0" }
                }
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
                "collapsible-down": "collapsible-down 0.2s ease-out",
                "collapsible-up": "collapsible-up 0.2s ease-out"
            }
        }
    },
    plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")]
} satisfies Config;

export default config;
