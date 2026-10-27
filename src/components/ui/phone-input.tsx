"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { ChevronsUpDown } from "lucide-react";
import { allCountries } from "country-telephone-data";
import ReactCountryFlag from "react-country-flag";

type Country = {
    name: string;
    dial: string;
    code: string;
};

interface PhoneInputProps {
    value: string; // raw (812xxx)
    onChange: (raw: string, full: string) => void; // full (628xxx)
}

const countries: Country[] = allCountries.map((c) => ({
    name: c.name,
    dial: "+" + c.dialCode,
    code: c.iso2,
}));

export default function PhoneInput({ value, onChange }: PhoneInputProps) {
    const defaultCountry =
        countries.find((c) => c.code.toLowerCase() === "id") ||
        countries[0];

    const [selected, setSelected] = useState<Country>(defaultCountry);
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");

    const filtered = countries.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    // ✅ HANDLE INPUT
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;

        const raw = val.slice(selected.dial.length).replace(/\D/g, "");
        const full = `${selected.dial}${raw}`.replace(/^\+/, "");

        onChange(raw, full);
    };

    return (
        <div className="flex relative PhoneInput">
            {/* BUTTON */}
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="inline-flex items-center justify-center whitespace-nowrap transition-all rounded-lg shadow-sm text-sm font-medium border border-border/50 bg-transparent hover:bg-accent/75 hover:text-accent-foreground h-9 flex gap-1 rounded-e-none rounded-s-lg border-r-0 px-3"
            >
                <span className="flex h-4 w-6 overflow-hidden rounded-sm bg-foreground/20">
                    <ReactCountryFlag
                        countryCode={selected.code.toUpperCase()}
                        svg
                        style={{ width: "100%", height: "100%" }}
                    />
                </span>

                <ChevronsUpDown className="size-4 opacity-100 -mr-1" />
            </button>

            {/* INPUT */}
            <Input
                type="tel"
                inputMode="numeric"
                value={selected.dial + value}
                onChange={handleChange}
                onKeyDown={(e) => {
                    const input = e.currentTarget;
                    const cursor = input.selectionStart || 0;

                    if (
                        cursor <= selected.dial.length &&
                        (e.key === "Backspace" || e.key === "Delete")
                    ) {
                        e.preventDefault();
                    }
                }}
                placeholder="628XXXXXXXXXX"
                className="rounded-l-none border-l-0"
            />

            {/* DROPDOWN */}
            {open && (
                <div className="absolute top-full left-0 mt-1 w-[300px] bg-popover border rounded-xl shadow z-50">
                    {/* SEARCH */}
                    <div className="px-3 py-2 border-b">
                        <input
                            placeholder="Search country..."
                            className="w-full text-sm outline-none bg-transparent"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {/* LIST */}
                    <div className="max-h-[300px] overflow-y-auto">
                        {filtered.map((c) => (
                            <div
                                key={c.code}
                                onClick={() => {
                                    setSelected(c);
                                    setOpen(false);
                                }}
                                className="flex items-center gap-2 px-3 py-2 hover:bg-accent cursor-pointer text-sm"
                            >
                                <ReactCountryFlag
                                    countryCode={c.code.toUpperCase()}
                                    svg
                                    style={{ width: "20px", height: "14px" }}
                                />

                                <span className="flex-1">{c.name}</span>
                                <span className="text-muted-foreground">{c.dial}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}