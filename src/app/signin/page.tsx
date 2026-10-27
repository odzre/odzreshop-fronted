"use client";
export const dynamic = "force-dynamic";

import { Suspense, useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { redirect, useSearchParams } from "next/navigation";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { FcGoogle } from "react-icons/fc";
import { toast } from "sonner";
import Link from "next/link";
import Script from "next/script";

export default function Page() {
    return (
        <Suspense fallback={<LoadingScreen />}>
            <SignInInner />
        </Suspense>
    );
}

function SignInInner() {
    const { data: session, status } = useSession();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (searchParams.get("logout") === "success") {
            toast.success("Berhasil keluar!", {
                description: "You have successfully logged out."
            });
        }
    }, [searchParams]);

    const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [recaptchaConfig, setRecaptchaConfig] = useState<{ active: boolean; site_key: string } | null>(null);
    const [recaptchaToken, setRecaptchaToken] = useState("");

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

    const handleCredentialsLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

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

            const res = await signIn("credentials", {
                redirect: false,
                login,
                password,
                recaptcha_token: recaptchaToken,
                callbackUrl,
                ip_info: JSON.stringify(clientJson.data),
                user_agent: clientJson.data.user_agent,
            });

            if (res?.error) setError("Username/email atau password salah");
            else if (res?.ok) window.location.href = callbackUrl;
        } catch (err) {
            console.error("Login error:", err);
            setError("Terjadi kesalahan saat login");
        } finally {
            setLoading(false);
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

            {/* Form login */}
            <div className="flex min-h-screen w-full flex-col items-center justify-center gap-8 px-4 py-20 md:w-[550px] md:px-20">
                <div className="mx-auto w-full max-w-md space-y-8">
                    <div>
                        <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                            Masuk
                        </h2>
                        <p className="mt-2 text-sm text-foreground">
                            Masuk dengan akun yang telah kamu daftarkan.
                        </p>
                    </div>

                    <form onSubmit={handleCredentialsLogin} className="mt-8 space-y-6">
                        <div className="space-y-3">
                            <div>
                                <label
                                    htmlFor="login"
                                    className="block text-xs font-medium text-foreground pb-2"
                                >
                                    Username atau Email
                                </label>
                                <input
                                    id="login"
                                    type="text"
                                    placeholder="Username atau Email"
                                    value={login}
                                    onChange={(e) => setLogin(e.target.value)}
                                    className="h-9 w-full rounded-lg border-0 bg-input px-3 text-xs text-foreground focus:ring-primary"
                                    required
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="password"
                                    className="block text-xs font-medium text-foreground pb-2"
                                >
                                    Kata sandi
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    placeholder="Kata sandi"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="h-9 w-full rounded-lg border-0 bg-input px-3 text-xs text-foreground focus:ring-primary"
                                    required
                                />
                            </div>
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

                        {error && <p className="text-xs text-red-500">{error}</p>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="relative flex w-full items-center justify-center rounded-lg bg-primary text-primary-foreground h-9 px-4 py-2 font-medium hover:bg-primary/90"
                        >
                            {loading ? <LoadingSpinner size={20} /> : "Masuk"}
                        </button>
                    </form>

                    {/* Sign up link */}
                    <p className="text-center text-sm text-muted-foreground">
                        Belum memiliki akun?{" "}
                        <Link href="/sign-up" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                            Daftar
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
