"use client";

import { Globe, User, Clock, Monitor, Smartphone } from "lucide-react";
import { toast } from "sonner";

export default function SettingsDevices({
    sessions = [],
    onRemove,
}: {
    sessions?: any[];
    onRemove?: (deviceId: string) => void;
}) {
    const handleLogoutDevice = async (deviceId: string) => {
        try {
            const res = await fetch("/api/auth/logout-device", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Device-Id": localStorage.getItem("device_id") ?? "",
                },
                body: JSON.stringify({
                    device_id: deviceId,
                }),
            });

            const json = await res.json();

            if (!json.success) {
                toast.error("Gagal mencabut akses pengguna");
                return;
            }

            toast.success("Akses pengguna berhasil dicabut.");

            // update parent
            onRemove?.(deviceId);

        } catch (error) {
            console.error(error);
            toast.error("Terjadi kesalahan saat logout device");
        }
    };

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div className="pt-8">
                <h3 className="text-base font-semibold leading-6 text-foreground">
                    Kelola Akses dan Perangkat
                </h3>
                <p className="text-muted-foreground mt-1 max-w-2xl text-sm">
                    Perangkat yang login ini baru-baru ini aktif di akun ini.
                    Kamu dapat keluar dari perangkat yang tidak dikenal atau ubah
                    kata sandimu untuk keamanan tambahan.
                </p>
            </div>

            {/* LIST */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {sessions.map((item, i) => {
                    const isCurrent =
                        item.is_current_device ?? item.isCurrentDevice;

                    const isMobile =
                        item.device?.toLowerCase().includes("ios") ||
                        item.device?.toLowerCase().includes("android");

                    const ip = item.ip_address ?? item.ipAddress;
                    const created =
                        item.created_at ?? item.createdAt;

                    return (
                        <div
                            key={i}
                            className="w-full space-y-3 rounded-md border bg-card p-3 text-sm text-card-foreground"
                        >
                            {/* HEADER */}
                            <div className="flex items-center justify-between gap-1">
                                <div className="flex items-center gap-2">
                                    {isMobile ? (
                                        <Smartphone className="h-4 w-4" />
                                    ) : (
                                        <Monitor className="h-4 w-4" />
                                    )}

                                    <div className="truncate text-[0.75rem] font-semibold">
                                        {item.os} - {item.browser}
                                    </div>
                                </div>

                                <button
                                    className="inline-flex items-center justify-center whitespace-nowrap transition-all rounded-lg shadow-sm text-sm font-medium border border-border/50 bg-transparent hover:bg-accent/75 h-8 px-4 disabled:opacity-50"
                                    onClick={() => handleLogoutDevice(item.device_id)}
                                    disabled={isCurrent}
                                >
                                    {isCurrent
                                        ? "Current Device"
                                        : "Sign out"}
                                </button>
                            </div>

                            {/* Divider */}
                            <div className="h-[1px] w-full bg-border" />

                            {/* DETAIL */}
                            <div className="space-y-1 text-xs text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Globe className="h-3 w-3" />
                                    {item.country} - {item.city}
                                </div>

                                <div className="flex items-center gap-2">
                                    <User className="h-3 w-3" />
                                    {ip}
                                </div>

                                <div className="flex items-center gap-2">
                                    <Clock className="h-3 w-3" />
                                    {created
                                        ? new Date(created).toLocaleString()
                                        : "-"}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}