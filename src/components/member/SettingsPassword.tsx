"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

export default function SettingsPassword() {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);

    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!oldPassword || !newPassword || !confirmPassword) {
            toast.error("Semua kolom wajib diisi");
            return;
        }
        if (newPassword.length < 6) {
            toast.error("Kata sandi baru minimal 6 karakter");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("Konfirmasi kata sandi tidak cocok");
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

            const res = await fetch("/api/auth/update-profile", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session?.user?.token}`,
                    "X-Device-Id": deviceId,
                },
                body: JSON.stringify({
                    old_password: oldPassword,
                    new_password: newPassword
                })
            });

            const data = await res.json();
            if (!data.success) {
                toast.error(data.message || "Gagal mengubah kata sandi");
                return;
            }

            toast.success("Kata sandi berhasil diperbarui 🔐");
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch {
            toast.error("Terjadi kesalahan jaringan");
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="space-y-6">
            <header>
                <h3 className="text-base font-medium">Ubah Kata Sandi</h3>
                <p className="text-sm text-muted-foreground">
                    Pastikan kamu mengingat kata sandi baru sebelum mengubahnya.
                </p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Grid untuk inputan */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Kata sandi lama */}
                    <div>
                        <label className="block text-xs font-medium pb-2">
                            Kata Sandi Saat Ini
                        </label>
                        <div className="relative">
                            <input
                                type={showOld ? "text" : "password"}
                                placeholder="Kata Sandi Saat Ini"
                                autoComplete="current-password"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                className="flex h-9 w-full rounded-md border border-input bg-input px-3 py-1 text-xs
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-my-color3 pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowOld(!showOld)}
                                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                            >
                                {showOld ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {/* Kata sandi baru */}
                    <div>
                        <label className="block text-xs font-medium pb-2">
                            Kata Sandi Baru
                        </label>
                        <div className="relative">
                            <input
                                type={showNew ? "text" : "password"}
                                placeholder="Kata Sandi Baru"
                                autoComplete="new-password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="flex h-9 w-full rounded-md border border-input bg-input px-3 py-1 text-xs
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-my-color3 pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNew(!showNew)}
                                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                            >
                                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {/* Konfirmasi sandi baru */}
                    <div>
                        <label className="block text-xs font-medium pb-2">
                            Konfirmasi Kata Sandi Baru
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirm ? "text" : "password"}
                                placeholder="Konfirmasi Kata Sandi Baru"
                                autoComplete="new-password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="flex h-9 w-full rounded-md border border-input bg-input px-3 py-1 text-xs
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-my-color3 pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                            >
                                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tombol tetap di luar grid (bawah semua input) */}
                <div className="flex items-end">
                    <Button
                        type="submit"
                        disabled={loading}
                        className="h-8 rounded-lg px-4 bg-my-color3 text-white hover:opacity-90 text-sm font-medium"
                    >
                        {loading ? "Menyimpan..." : "Ubah Kata Sandi"}
                    </Button>
                </div>
            </form>
        </section>
    );
}
