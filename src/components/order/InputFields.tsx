"use client"

import React, { useEffect, useState, useCallback, useRef } from "react"

interface InputFieldsProps {
    gameConfig: {
        slug: string
        code_validation_nickname?: string
        required_inputs: string[]
        input_fields: {
            name: string
            label: string
            placeholder: string
            type?: string
        }[]
        options?: { value: string; label: string }[]
    }
    inputs: Record<string, string>
    handleInputChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
    idRef?: React.RefObject<HTMLDivElement>
    serverRef?: React.RefObject<HTMLDivElement>
}

const getCountryDisplay = (country: string) => country.toUpperCase()

const InputFields: React.FC<InputFieldsProps> = ({
    gameConfig,
    inputs,
    handleInputChange,
    idRef,
    serverRef
}) => {
    const [nickname, setNickname] = useState<string | null>(null)
    const [country, setCountry] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null)

    // ===========================================================
    // 🔥 ML VALIDATION
    // ===========================================================
    const validateNickname = useCallback(async (id: string, server: string) => {
        setLoading(true)
        setError(null)
        setNickname(null)
        setCountry(null)

        try {
            const res = await fetch("/api/account/pre-validate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id,
                    server,
                    slug: "mobile-legends-moogold",
                }),
            })

            const data = await res.json()

            if (res.ok && data.status === "success") {
                const nick = data.result?.username || null
                const region = data.result?.region || null

                setNickname(nick)
                setCountry(region)

                localStorage.setItem("nickname", nick || "")
                localStorage.setItem("nickname_country", region || "")
            } else {
                setError(
                    data?.message || "Nickname tidak ditemukan."
                )
            }
        } catch {
            setError("Gagal memvalidasi ID.")
        } finally {
            setLoading(false)
        }
    }, [])

    // ===========================================================
    // 🔥 FF VALIDATION
    // ===========================================================
    const validateFF = useCallback(async (id: string) => {
        setLoading(true)
        setError(null)
        setNickname(null)
        setCountry(null)

        try {
            const res = await fetch("/api/account/pre-validate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id,
                    slug: "free-fire-moogold",
                }),
            })


            const data = await res.json()

            if (res.ok && data.status === "success") {
                const nick = data.result?.username || null
                const region = data.result?.region || null

                setNickname(nick)
                setCountry(region)

                localStorage.setItem("nickname", nick || "")
                localStorage.setItem("nickname_country", region || "")
            } else {
                setError(
                    data?.message || "Nickname tidak ditemukan."
                )
            }
        } catch {
            setError("Gagal memvalidasi ID Free Fire.")
        } finally {
            setLoading(false)
        }
    }, [])

    // ===========================================================
    // ⚡ PLN VALIDATION
    // ===========================================================
    const validatePln = useCallback(async (id: string) => {
        setLoading(true)
        setError(null)
        setNickname(null)
        setCountry(null)

        try {
            const res = await fetch("/api/account/pre-validate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id,
                    slug: "pln",
                }),
            })

            const data = await res.json()

            if (res.ok && data.status === "success") {
                const name = data.nickname || null
                const segment = data.region || null

                setNickname(name)
                setCountry(segment)

                localStorage.setItem("nickname", name || "")
                localStorage.setItem("nickname_country", segment || "")
            } else {
                setError(
                    data?.message ||
                    data?.result?.message ||
                    "ID PLN tidak ditemukan."
                )
            }
        } catch {
            setError("Gagal memvalidasi ID PLN.")
        } finally {
            setLoading(false)
        }
    }, [])

    // ===========================================================
    // 🔁 AUTO VALIDATION
    // ===========================================================
    useEffect(() => {
        const id = inputs["id"]
        const server = inputs["server"]
        const code = gameConfig?.code_validation_nickname

        if (!id) return

        if (debounceTimeout.current) clearTimeout(debounceTimeout.current)

        debounceTimeout.current = setTimeout(() => {
            if (code === "mobile-legends-mp" && id && server) {
                validateNickname(id, server)
            }

            if (code === "pln" && id) {
                validatePln(id)
            }

            if (code === "free-fire-moogold" && id) {
                validateFF(id)
            }
        }, 500)
    }, [
        inputs,
        gameConfig?.code_validation_nickname,
        validateNickname,
        validatePln,
        validateFF
    ])

    // ===========================================================
    // 🕓 LOCAL STORAGE
    // ===========================================================
    useEffect(() => {
        const path = window.location.pathname
        const idKey = `${path}_id`
        const serverKey = `${path}_server`

        const loadWithExpiry = (key: string) => {
            const raw = localStorage.getItem(key)
            if (!raw) return null

            try {
                const parsed = JSON.parse(raw)
                if (parsed.expiry && parsed.expiry < Date.now()) {
                    localStorage.removeItem(key)
                    return null
                }
                return parsed.value
            } catch {
                return null
            }
        }

        const storedId = loadWithExpiry(idKey)
        const storedServer = loadWithExpiry(serverKey)

        if (storedId && !inputs["id"]) {
            handleInputChange({
                target: { name: "id", value: storedId }
            } as React.ChangeEvent<HTMLInputElement>)
        }

        if (storedServer && !inputs["server"]) {
            handleInputChange({
                target: { name: "server", value: storedServer }
            } as React.ChangeEvent<HTMLInputElement>)
        }
    }, [handleInputChange, inputs])

    if (!gameConfig || !gameConfig.input_fields) return null

    const commonClassNames =
        "w-full rounded-lg bg-input/80 border-0 px-3 py-2 text-[16px] text-muted-foreground/100 placeholder:text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary scale-[0.9] origin-left"

    return (
        <>
            {gameConfig.input_fields.map((field, index) => {
                const inputName = field.name
                const ref = inputName === "id" ? idRef : inputName === "server" ? serverRef : null

                const label = field.label || inputName.charAt(0).toUpperCase() + inputName.slice(1)
                const placeholder = field.placeholder || `Masukkan ${label}`
                const type = field.type || "text"

                const handleChangeWithStorage = (
                    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
                ) => {
                    const key = `${window.location.pathname}_${e.target.name}`
                    const dataToStore = {
                        value: e.target.value,
                        expiry: Date.now() + 24 * 60 * 60 * 1000
                    }
                    localStorage.setItem(key, JSON.stringify(dataToStore))
                    handleInputChange(e)
                }

                const isSelect = type === "select"

                return (
                    <div key={`${inputName}-${index}`} ref={ref} className="space-y-1">
                        <label className="block text-xs font-semibold text-card-foreground">
                            {label}
                        </label>

                        {isSelect ? (
                            <select
                                name={inputName}
                                value={inputs[inputName] || ""}
                                onChange={handleChangeWithStorage}
                                className={`${commonClassNames} appearance-none`}
                            >
                                <option value="">{placeholder}</option>
                                {gameConfig.options?.map((opt, i) => (
                                    <option key={i} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <input
                                type={type}
                                name={inputName}
                                placeholder={placeholder}
                                value={inputs[inputName] || ""}
                                onChange={handleChangeWithStorage}
                                className={commonClassNames}
                            />
                        )}
                    </div>
                )
            })}

            <div className="col-span-2 mt-2">
                {loading && (
                    <div className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs">
                        🔄 Mengecek akun...
                    </div>
                )}

                {!loading && nickname && !error && (
                    <div className="w-full max-w-sm inline-flex flex-wrap italic gap-1 rounded-full border border-green-600 bg-green-900/20 p-2 text-xxs md:text-xs">
                        <span>Your account is</span>
                        <strong className="italic text-green-500">{nickname}</strong>
                        <span>from</span>
                        <strong className="italic">
                            {country ? getCountryDisplay(country) : "-"}
                        </strong>
                    </div>
                )}

                {!loading && error && !nickname && (
                    <div className="inline-flex italic gap-1 rounded-full border border-red-600 bg-red-900/20 text-red-500 px-4 py-2 text-xxs whitespace-nowrap">
                        {error} ❌
                    </div>
                )}
            </div>
        </>
    )
}

export default InputFields