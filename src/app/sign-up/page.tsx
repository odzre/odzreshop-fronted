"use client";
export const dynamic = "force-dynamic";

import { Suspense, useState, useEffect, useRef } from "react";
import { useSession, signIn } from "next-auth/react";
import { redirect } from "next/navigation";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { FcGoogle } from "react-icons/fc";
import { toast } from "sonner";
import Link from "next/link";
import Script from "next/script";
import PhoneInput from "@/components/ui/phone-input";

export default function Page() {
    return (
        <Suspense fallback={<LoadingScreen />}>
            <SignUpInner />
        </Suspense>
    );
}

function SignUpInner() {
    const { data: session, status } = useSession();

    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [phoneFull, setPhoneFull] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [generalError, setGeneralError] = useState("");
    const [recaptchaConfig, setRecaptchaConfig] = useState<{ active: boolean; site_key: string } | null>(null);
    const [recaptchaToken, setRecaptchaToken] = useState("");

    // OTP state
    const [showOtp, setShowOtp] = useState(false);
    const [otp, setOtp] = useState(["", "", "", ""]);
    const [otpLoading, setOtpLoading] = useState(false);
    const [otpError, setOtpError] = useState("");
    const [phoneForOtp, setPhoneForOtp] = useState("");
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Fetch reCAPTCHA config
    useEffect(() => {
        fetch("/api/auth/recaptcha-config")
            .then(res => res.json())
            .then(data => setRecaptchaConfig(data))
            .catch(() => setRecaptchaConfig({ active: false, site_key: "" }));
    }, []);

    // reCAPTCHA callback
    useEffect(() => {
        if (typeof window !== "undefined") {
            (window as any).onRecaptchaSuccess = (token: string) => {
                setRecaptchaToken(token);
            };
            (window as any).onRecaptchaExpired = () => {
                setRecaptchaToken("");
            };
        }
    }, []);

    if (status === "authenticated") {
        redirect("/dashboard");
    }

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        setGeneralError("");

        if (!agreeTerms) {
            setGeneralError("Kamu harus menyetujui Syarat dan Ketentuan.");
            setLoading(false);
            return;
        }

        if (password !== passwordConfirm) {
            setErrors({ password: ["Kata sandi tidak cocok."] });
            setLoading(false);
            return;
        }

        const fullPhone = phoneFull || (phone.startsWith("62") ? phone : `62${phone}`);

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    username: username.toLowerCase(),
                    email,
                    phone_number: fullPhone,
                    password,
                    password_confirmation: passwordConfirm,
                    recaptcha_token: recaptchaToken,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                if (data.errors) setErrors(data.errors);
                setGeneralError(data.message || "Registrasi gagal.");
                setLoading(false);
                return;
            }

            if (data.requires_otp) {
                setPhoneForOtp(fullPhone);
                setShowOtp(true);
                toast.success("OTP terkirim ke WhatsApp!");
            }
        } catch (err) {
            console.error("Register error:", err);
            setGeneralError("Terjadi kesalahan. Coba lagi.");
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);

        if (value && index < 3) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleVerifyOtp = async () => {
        setOtpLoading(true);
        setOtpError("");

        const otpCode = otp.join("");
        if (otpCode.length !== 4) {
            setOtpError("Masukkan 4 digit OTP.");
            setOtpLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/auth/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    phone_number: phoneForOtp,
                    otp: otpCode,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setOtpError(data.message || "Verifikasi gagal.");
                setOtpLoading(false);
                return;
            }

            toast.success("Registrasi berhasil!");

            // Auto login after registration
            const loginRes = await signIn("credentials", {
                redirect: false,
                login: username.toLowerCase(),
                password: password,
            });

            if (loginRes?.ok) {
                window.location.href = "/dashboard";
            } else {
                window.location.href = "/signin";
            }
        } catch (err) {
            console.error("OTP verify error:", err);
            setOtpError("Terjadi kesalahan.");
        } finally {
            setOtpLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const clientRes = await fetch("/api/client-info");
            const clientJson = await clientRes.json();
            const deviceId =
                localStorage.getItem("device_id") ||
                crypto.randomUUID();

            const fingerprint = {
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                language: navigator.language,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                screen: `${window.screen.width}x${window.screen.height}`,
            };

            clientJson.data.fingerprint = fingerprint;
            localStorage.setItem("device_id", deviceId);
            clientJson.data.device_id = deviceId;

            document.cookie = `client_info=${encodeURIComponent(
                JSON.stringify(clientJson.data)
            )}; path=/`;

            await signIn("google", {
                callbackUrl: "/auth/google/callback",
                ip_info: JSON.stringify(clientJson.data),
                user_agent: clientJson.data.user_agent,
            });
        } catch (error) {
            console.error("Google login gagal:", error);
        }
    };

    const getFieldError = (field: string) => errors[field]?.[0];

    // OTP Modal
    if (showOtp) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient px-4">
                <div className="w-full max-w-sm space-y-6 rounded-2xl border border-border bg-card p-8">
                    <div className="text-center">
                        <h2 className="text-xl font-bold text-foreground">Verifikasi OTP</h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Masukkan 4 digit kode yang dikirim ke WhatsApp <span className="font-medium text-primary">+{phoneForOtp}</span>
                        </p>
                    </div>

                    <div className="flex justify-center gap-3">
                        {otp.map((digit, i) => (
                            <input
                                key={i}
                                ref={(el) => { otpRefs.current[i] = el; }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleOtpChange(i, e.target.value)}
                                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                className="h-14 w-14 rounded-lg border-2 border-border bg-input text-center text-2xl font-bold text-foreground focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                            />
                        ))}
                    </div>

                    {otpError && <p className="text-center text-xs text-red-500">{otpError}</p>}

                    <button
                        onClick={handleVerifyOtp}
                        disabled={otpLoading}
                        className="flex w-full items-center justify-center rounded-lg bg-primary text-primary-foreground h-9 px-4 font-medium hover:bg-primary/90 disabled:opacity-50"
                    >
                        {otpLoading ? <LoadingSpinner size={20} /> : "Verifikasi"}
                    </button>

                    <p className="text-center text-xs text-muted-foreground">
                        Kode berlaku selama 5 menit
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative flex bg-gradient min-h-screen">
            {/* reCAPTCHA Script */}
            {recaptchaConfig?.active && recaptchaConfig.site_key && (
                <Script src="https://www.google.com/recaptcha/api.js" async defer />
            )}

            {/* Tombol kembali */}
            <div className="absolute left-4 top-4 z-50">
                <Link
                    href="/"
                    className="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path d="M18 6 6 18" />
                        <path d="m6 6 12 12" />
                    </svg>
                </Link>
            </div>

            {/* Form register */}
            <div className="flex min-h-screen w-full flex-col items-center justify-center gap-8 px-4 py-20 md:w-[550px] md:px-20">
                <div className="mx-auto w-full max-w-md space-y-8">
                    <div>
                        <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                            Daftar
                        </h2>
                        <p className="mt-2 text-sm text-foreground">
                            Masukkan informasi pendaftaran yang valid.
                        </p>
                    </div>

                    <form onSubmit={handleRegister} className="mt-8 space-y-6">
                        <div className="space-y-3">
                            {/* Name + Username */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-foreground pb-2">
                                        Nama lengkap
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Nama lengkap"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="h-9 w-full rounded-lg border-0 bg-input px-3 text-xs text-foreground focus:ring-primary"
                                        required
                                    />
                                    {getFieldError('name') && <p className="text-xs text-red-500 mt-1">{getFieldError('name')}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-foreground pb-2">
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                                        className="h-9 w-full rounded-lg border-0 bg-input px-3 text-xs text-foreground focus:ring-primary"
                                        required
                                    />
                                    {getFieldError('username') && <p className="text-xs text-red-500 mt-1">{getFieldError('username')}</p>}
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-xs font-medium text-foreground pb-2">
                                    Alamat email
                                </label>
                                <input
                                    type="email"
                                    placeholder="Alamat email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="h-9 w-full rounded-lg border-0 bg-input px-3 text-xs text-foreground focus:ring-primary"
                                    required
                                />
                                {getFieldError('email') && <p className="text-xs text-red-500 mt-1">{getFieldError('email')}</p>}
                            </div>

                            {/* WhatsApp */}
                            <div>
                                <label className="block text-xs font-medium text-foreground pb-2">
                                    Nomor whatsapp
                                </label>
                                <PhoneInput
                                    value={phone}
                                    onChange={(raw, full) => {
                                        setPhone(raw);
                                        setPhoneFull(full);
                                    }}
                                />
                                {getFieldError('phone_number') && <p className="text-xs text-red-500 mt-1">{getFieldError('phone_number')}</p>}
                            </div>

                            {/* Password + Confirm */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-foreground pb-2">
                                        Kata sandi
                                    </label>
                                    <input
                                        type="password"
                                        placeholder="Kata sandi"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="h-9 w-full rounded-lg border-0 bg-input px-3 text-xs text-foreground focus:ring-primary"
                                        required
                                        minLength={6}
                                    />
                                    {getFieldError('password') && <p className="text-xs text-red-500 mt-1">{getFieldError('password')}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-foreground pb-2">
                                        Konfirmasi kata sandi
                                    </label>
                                    <input
                                        type="password"
                                        placeholder="Konfirmasi kata sandi"
                                        value={passwordConfirm}
                                        onChange={(e) => setPasswordConfirm(e.target.value)}
                                        className="h-9 w-full rounded-lg border-0 bg-input px-3 text-xs text-foreground focus:ring-primary"
                                        required
                                        minLength={6}
                                    />
                                </div>
                            </div>

                            {/* Terms */}
                            <label className="flex items-start gap-2 text-xs text-muted-foreground cursor-pointer pt-1">
                                <input
                                    type="checkbox"
                                    checked={agreeTerms}
                                    onChange={(e) => setAgreeTerms(e.target.checked)}
                                    className="mt-0.5 h-4 w-4 rounded border-border bg-input accent-primary"
                                />
                                <span>
                                    Saya setuju dengan{" "}
                                    <Link href="/privacy-policy" className="font-semibold text-primary hover:text-primary/80">Syarat dan Ketentuan</Link>
                                    {" "}dan{" "}
                                    <Link href="/privacy-policy" className="font-semibold text-primary hover:text-primary/80">Kebijakan Privadi</Link>.
                                </span>
                            </label>
                        </div>

                        {/* reCAPTCHA */}
                        {recaptchaConfig?.active && recaptchaConfig.site_key && (
                            <div className="flex justify-center">
                                <div
                                    className="g-recaptcha"
                                    data-sitekey={recaptchaConfig.site_key}
                                    data-callback="onRecaptchaSuccess"
                                    data-expired-callback="onRecaptchaExpired"
                                    data-theme="dark"
                                />
                            </div>
                        )}

                        {generalError && <p className="text-xs text-red-500">{generalError}</p>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="relative flex w-full items-center justify-center rounded-lg bg-primary text-primary-foreground h-9 px-4 py-2 font-medium hover:bg-primary/90 disabled:opacity-50"
                        >
                            {loading ? <LoadingSpinner size={20} /> : "Daftar"}
                        </button>
                    </form>

                    {/* Sign in link */}
                    <p className="text-center text-sm text-muted-foreground">
                        Sudah memiliki akun?{" "}
                        <Link href="/signin" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                            Masuk
                        </Link>
                    </p>
                </div>

                <div className="mx-auto flex w-full max-w-md items-center gap-2">
                    <div className="h-[1px] flex-1 bg-border"></div>
                    <span className="text-xs">atau lanjutkan dengan</span>
                    <div className="h-[1px] flex-1 bg-border"></div>
                </div>

                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="flex w-full max-w-md items-center justify-center gap-2 rounded-lg border-0 bg-secondary h-9 px-4 text-sm hover:bg-accent/75"
                >
                    <FcGoogle className="h-5 w-5" />
                    Google
                </button>
            </div>

            {/* Background kanan */}
            <div className="hidden flex-1 md:flex">
                <div className="size-full bg-auth-image bg-cover bg-center"></div>
            </div>
        </div>
    );
}
