"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Globe, User, Clock } from "lucide-react";
import PhoneInput from "@/components/ui/phone-input";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription
} from "@/components/ui/drawer";

export default function SettingsProfile() {
    const { data: session } = useSession();
    const isMobile = useMediaQuery("(max-width: 768px)");

    const [phone, setPhone] = useState("");        // raw (812xxx)
    const [phoneFull, setPhoneFull] = useState(""); // full (62812xxx)
    const [otp, setOtp] = useState(["", "", "", ""]);
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [openOtp, setOpenOtp] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const otpRefs = useRef<Array<HTMLInputElement | null>>([]);
    const [sessions, setSessions] = useState<any[]>([]);
    const [loadingSessions, setLoadingSessions] = useState(true);

    // ✅ Ambil data awal dari session
    useEffect(() => {
        if (!session?.user?.phone_number) {
            setShowAlert(true);
            return;
        }

        let full = session.user.phone_number || "";

        // 🔥 FILTER: hanya angka
        full = full.replace(/\D/g, "");

        // kalau hasilnya kosong → anggap invalid
        if (!full) {
            setPhone("");
            setPhoneFull("");
            setShowAlert(true);
            return;
        }

        setPhoneFull(full);
        // Simpan raw number apa adanya (tanpa country code prefix)
        setPhone(full);

        setShowAlert(false);
    }, [session]);

    // 🔒 Logout otomatis setelah update sukses
    function forceLogout() {
        setTimeout(() => {
            window.location.href = "/api/auth/signout?callbackUrl=/signin";
        }, 1200);
    }
    useEffect(() => {
        async function fetchSessions() {
            try {
                let deviceId = localStorage.getItem("device_id");

                if (!deviceId) {
                    await new Promise((r) => setTimeout(r, 300));
                    deviceId = localStorage.getItem("device_id");
                }

                if (!deviceId) {
                    console.error("❌ device_id tidak ditemukan");
                    setLoadingSessions(false);
                    return;
                }

                const res = await fetch("/api/account-access", {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "X-Device-Id": deviceId,
                    },
                });
                const data = await res.json();

                if (!data?.data) return;

                setSessions(data.data);
            } catch (err) {
                console.error("Gagal ambil session:", err);
            } finally {
                setLoadingSessions(false);
            }
        }

        fetchSessions();
    }, []);

    // ✅ Simpan langsung tanpa OTP (nomor tidak berubah)
    async function handleSaveDirect() {
        try {
            setLoading(true);
            const payload: any = { phone_number: phoneFull };
            if (password.trim() !== "") payload.password = password;

            let deviceId = localStorage.getItem("device_id");

            if (!deviceId) {
                await new Promise((r) => setTimeout(r, 300));
                deviceId = localStorage.getItem("device_id");
            }

            if (!deviceId) {
                toast.error("Device tidak valid");
                return;
            }

            const res = await fetch("/api/auth/update-profile", {
                method: "POST",
                credentials: "include",
                headers: {
                    Authorization: `Bearer ${session?.user?.token}`,
                    "Content-Type": "application/json",
                    "X-Device-Id": deviceId,
                },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (!data.success) {
                toast.error(data.message || "Gagal memperbarui profil");
                return;
            }

            toast.success("Profil berhasil diperbarui ✅");
            setPassword("");
            forceLogout();
        } catch {
            toast.error("Terjadi kesalahan saat menyimpan");
        } finally {
            setLoading(false);
        }
    }

    // ✅ Kirim OTP hanya jika nomor berubah
    async function handleSendOtp(e: React.FormEvent) {
        e.preventDefault();

        if (session?.user?.phone_number === phoneFull) {
            await handleSaveDirect();
            return;
        }

        if (phoneFull.length < 9) {
            toast.error("Nomor HP tidak valid. Pastikan nomor sudah benar.");
            return;
        }

        try {
            setLoading(true);
            let deviceId = localStorage.getItem("device_id");

            if (!deviceId) {
                await new Promise((r) => setTimeout(r, 300));
                deviceId = localStorage.getItem("device_id");
            }

            if (!deviceId) {
                toast.error("Device tidak valid");
                return;
            }

            const res = await fetch("/api/auth/send-otp", {
                method: "POST",
                credentials: "include",
                headers: {
                    Authorization: `Bearer ${session?.user?.token}`,
                    "Content-Type": "application/json",
                    "X-Device-Id": deviceId,
                },
                body: JSON.stringify({ phone_number: phoneFull })
            });

            const data = await res.json();
            if (data.success) {
                toast.success("OTP dikirim ke WhatsApp kamu");
                setOpenOtp(true);
                setOtp(["", "", "", ""]);
            } else {
                toast.error(data.message || "Gagal mengirim OTP");
            }
        } catch {
            toast.error("Terjadi kesalahan jaringan");
        } finally {
            setLoading(false);
        }
    }

    // ✅ Input OTP per kotak
    const handleOtpChange = (index: number, value: string) => {
        if (!/^[0-9]*$/.test(value)) return; // hanya angka
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);

        if (value && index < otpRefs.current.length - 1) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    // ✅ Submit OTP
    async function handleVerifyOtp() {
        const code = otp.join("");
        if (code.length !== 4) {
            toast.error("Kode OTP harus 4 digit");
            return;
        }

        try {
            setLoading(true);
            const payload: any = { phone_number: phoneFull, otp: code };
            if (password.trim() !== "") payload.password = password;

            let deviceId = localStorage.getItem("device_id");

            if (!deviceId) {
                await new Promise((r) => setTimeout(r, 300));
                deviceId = localStorage.getItem("device_id");
            }

            if (!deviceId) {
                toast.error("Device tidak valid");
                return;
            }

            const res = await fetch("/api/auth/update-profile", {
                method: "POST",
                credentials: "include",
                headers: {
                    Authorization: `Bearer ${session?.user?.token}`,
                    "Content-Type": "application/json",
                    "X-Device-Id": deviceId,
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (!data.success) {
                toast.error(data.message || "Gagal memperbarui profil");
                return;
            }

            toast.success("Profil berhasil diperbarui");
            setOpenOtp(false);
            setPassword("");
            forceLogout();
        } catch {
            toast.error("Terjadi kesalahan saat menyimpan");
        } finally {
            setLoading(false);
        }
    }

    // 🔹 UI Modal OTP (responsive Drawer/Dialog)
    const OtpModal = (
        <>
            <div className="space-y-5 mt-2 py-4 px-2">
                <p className="text-sm text-center text-muted-foreground">
                    Masukkan 4 digit kode OTP yang dikirim ke WhatsApp kamu.
                </p>

                {/* Input OTP per kotak */}
                <div className="flex justify-center gap-3">
                    {otp.map((digit, i) => (
                        <input
                            key={i}
                            ref={(el: HTMLInputElement | null) => {
                                otpRefs.current[i] = el;
                            }}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(i, e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Backspace" && !otp[i] && i > 0)
                                    otpRefs.current[i - 1]?.focus();
                            }}
                            className="w-12 h-12 text-center border rounded-md border-input bg-input text-lg font-semibold tracking-widest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-my-color3"
                        />
                    ))}
                </div>

                <Button
                    onClick={handleVerifyOtp}
                    disabled={loading}
                    className="w-full bg-my-color3 text-white hover:opacity-90"
                >
                    {loading ? "Memverifikasi..." : "Verifikasi & Simpan"}
                </Button>
            </div>
        </>
    );

    return (

        <section className="space-y-6">
            <header>
                <h3 className="text-base font-medium">Profil</h3>
                <p className="text-sm text-muted-foreground">
                    Informasi ini bersifat rahasia, jadi berhati-hatilah dengan apa yang
                    kamu bagikan.
                </p>
            </header>

            {showAlert && (
                <div className="p-3 text-sm bg-red-100 border border-red-400 text-red-700 rounded-md">
                    ⚠️ Mohon lengkapi WhatsApp terlebih dahulu.
                </div>
            )}

            <form onSubmit={handleSendOtp} className="grid grid-cols-2 gap-4">
                {/* Nama */}
                <div>
                    <label className="block text-xs font-medium pb-2">Nama kamu</label>
                    <input
                        value={session?.user?.name || ""}
                        disabled
                        className="h-9 w-full rounded-md border border-border bg-input px-3 text-xs text-foreground disabled:opacity-70"
                    />
                </div>

                {/* Email */}
                <div>
                    <label className="block text-xs font-medium pb-2">Alamat Email</label>
                    <input
                        value={session?.user?.email || ""}
                        disabled
                        className="h-9 w-full rounded-md border border-border bg-input px-3 text-xs text-foreground disabled:opacity-70"
                    />
                </div>

                {/* Nomor HP */}
                <div>
                    <label className="block text-xs font-medium pb-2">
                        No. Handphone
                    </label>
                    <PhoneInput
                        value={phone}
                        onChange={(raw, full) => {
                            setPhone(raw);
                            setPhoneFull(full);
                        }}
                    />
                </div>

                {/* Password */}
                <div>
                    <label className="block text-xs font-medium pb-2">
                        Password (opsional)
                    </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="flex h-9 w-full rounded-md border border-input bg-input px-3 py-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-my-color3"
                    />
                </div>

                {/* Tombol Simpan */}
                <div className="flex items-end">
                    <Button
                        type="submit"
                        disabled={loading}
                        className="h-8 rounded-lg px-4 bg-my-color3 text-white hover:opacity-90 text-sm font-medium"
                    >
                        {loading ? "Memproses..." : "Simpan Profil"}
                    </Button>
                </div>
            </form>


            {/* Drawer/Dialog OTP */}
            {isMobile ? (
                <Drawer open={openOtp} onOpenChange={setOpenOtp}>
                    <DrawerContent>
                        <DrawerHeader>
                            <DrawerTitle className="text-center">
                                Verifikasi Nomor WhatsApp
                            </DrawerTitle>
                            <DrawerDescription className="text-center">
                                Kode OTP sudah dikirim ke WhatsApp kamu.
                            </DrawerDescription>
                        </DrawerHeader>
                        {OtpModal}
                    </DrawerContent>
                </Drawer>
            ) : (
                <Dialog open={openOtp} onOpenChange={setOpenOtp}>
                    <DialogContent className="sm:max-w-[400px]">
                        <DialogHeader>
                            <DialogTitle className="text-center">
                                Verifikasi Nomor WhatsApp
                            </DialogTitle>
                            <DialogDescription className="text-center">
                                Kode OTP sudah dikirim ke WhatsApp kamu.
                            </DialogDescription>
                        </DialogHeader>
                        {OtpModal}
                    </DialogContent>
                </Dialog>
            )}


        </section>

    );
}
