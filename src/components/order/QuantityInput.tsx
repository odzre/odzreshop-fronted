"use client";

import { useState, useEffect } from "react";
import { Plus, Minus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
interface QuantityInputProps {
    value?: number;
    onChange?: (value: number) => void;
    min?: number;
    max?: number;
    allowMulti?: boolean; // 🔥 tambahkan prop baru
}

export default function QuantityInput({
    value = 1,
    onChange,
    min = 1,
    max = 100,
    allowMulti = true // default true agar tidak ganggu game lama
}: QuantityInputProps) {
    const [quantity, setQuantity] = useState<number>(value);
    const { t } = useTranslation();

    useEffect(() => {
        setQuantity(value);
    }, [value]);

    const handleChange = (val: number) => {
        if (!allowMulti) return; // 🔒 kalau tidak diizinkan, abaikan perubahan
        const newValue = Math.min(Math.max(val, min), max);
        setQuantity(newValue);
        onChange?.(newValue);
    };

    return (
        <section
            className="relative scroll-mt-20 rounded-xl bg-card/50 shadow-sm md:scroll-mt-[7.5rem]"
            id="quantity"
        >
            <div className="flex items-center overflow-hidden rounded-t-xl bg-card">
                <div className="flex h-10 w-10 items-center justify-center bg-primary font-semibold text-primary-foreground"></div>
                <h2 className="px-4 py-2 text-sm/6 font-semibold text-card-foreground">
                    {t("order.Masukkan Jumlah Pembelian")}
                </h2>
            </div>

            <div className="p-4">
                <div className="flex items-center gap-x-4">
                    <div className="flex-1">
                        <Input
                            type="number"
                            min={min}
                            max={max}
                            value={quantity}
                            readOnly={!allowMulti}
                            onChange={(e) => handleChange(Number(e.target.value))}
                            className={!allowMulti ? "opacity-60 cursor-not-allowed" : ""}
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center gap-2">

                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => handleChange(quantity + 1)}
                            disabled={!allowMulti || quantity >= max}
                        >
                            <Plus className="h-5 w-5" />
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => handleChange(quantity - 1)}
                            disabled={!allowMulti || quantity <= min}
                        >
                            <Minus className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                {!allowMulti && (
                    <p className="text-xs text-muted-foreground mt-2">
                        {t("order.Game ini hanya bisa dibeli satu kali per transaksi.")}
                    </p>
                )}
            </div>
        </section>
    );
}
