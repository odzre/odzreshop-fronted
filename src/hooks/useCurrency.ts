import { useSettings } from "@/context/settings-context";

export function useCurrency() {
    const settings = useSettings();
    const region = settings?.data?.region;

    const currency = region?.currency || "IDR";
    const rate = region?.exchange_rate || 1;

    function format(amount: number) {
        // IDR = mata uang dasar, tidak perlu konversi
        if (currency === "IDR" || rate === 1) {
            return new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0,
            }).format(amount);
        }

        // Konversi dari IDR ke mata uang lain (bagi, bukan kali)
        // rate = berapa IDR per 1 unit mata uang asing
        // Contoh: rate 3500 artinya 1 MYR = 3500 IDR
        const converted = amount / rate;

        // Format: "MYR 15.60" atau "MYR 15"
        const decimals = converted % 1 === 0 ? 0 : 2;

        return `${currency} ${converted.toLocaleString("en-US", {
            minimumFractionDigits: decimals,
            maximumFractionDigits: 2,
        })}`;
    }

    return { currency, rate, format };
}
