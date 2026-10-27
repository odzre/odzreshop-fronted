"use client";

import { useState } from "react";
import { ContentLayout } from "@/components/panel/content-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, Globe, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function RegionMLBBPage() {
    const { t } = useTranslation();

    const [userId, setUserId] = useState("");
    const [serverId, setServerId] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<any>(null);

    const handleCheck = async () => {
        setError(null);
        setResult(null);

        if (!userId.trim()) {
            setError(t("mlbb.error_userid"));
            return;
        }

        if (!serverId.trim()) {
            setError(t("mlbb.error_serverid"));
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(
                `/api/check-nickname?id=${encodeURIComponent(userId)}&server=${encodeURIComponent(serverId)}&game=ml`
            );

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || t("mlbb.error_unknown"));
            } else {
                setResult(data);
            }
        } catch {
            setError(t("mlbb.error_process"));
        }

        setLoading(false);
    };

    return (
        <ContentLayout title={t("mlbb.title_full")}>
            <main className="max-w-xl mx-auto px-4 py-10 space-y-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-center text-my-color mb-2">
                    {t("mlbb.title")}
                </h1>

                <p className="text-center text-sm text-muted-foreground mb-6">
                    {t("mlbb.subtitle")}
                </p>

                <div className="space-y-4">
                    {/* User ID */}
                    <div>
                        <label className="text-sm font-medium block mb-1">
                            {t("mlbb.userid_label")}
                        </label>
                        <Input
                            type="number"
                            placeholder={t("mlbb.userid_placeholder")}
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
                        />
                    </div>

                    {/* Server ID */}
                    <div>
                        <label className="text-sm font-medium block mb-1">
                            {t("mlbb.serverid_label")}
                        </label>
                        <Input
                            type="number"
                            placeholder={t("mlbb.serverid_placeholder")}
                            value={serverId}
                            onChange={(e) => setServerId(e.target.value)}
                        />
                    </div>

                    {/* Button */}
                    <Button onClick={handleCheck} className="w-full" disabled={loading}>
                        {loading ? t("mlbb.btn_loading") : t("mlbb.btn_check")}
                    </Button>

                    {/* Error */}
                    {error && (
                        <div className="text-sm text-red-600 bg-red-100 border border-red-300 p-3 rounded text-center">
                            {error}
                        </div>
                    )}

                    {/* Result */}
                    {result && !error && (
                        <div className="mt-4 p-4 rounded-lg bg-white/10 backdrop-blur border border-white/20 text-white space-y-3 transition-all duration-300">

                            {/* Header */}
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-300" />
                                <h3 className="font-medium text-sm">{t("mlbb.valid_account")}</h3>
                            </div>

                            <div className="space-y-3">
                                {/* Nickname */}
                                {result.name && (
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-white/70" />
                                        <div>
                                            <p className="text-xs text-white/70">{t("mlbb.nickname")}</p>
                                            <p className="text-white text-sm">{result.name}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Country */}
                                {result.region?.country && (
                                    <div className="flex items-center gap-2">
                                        <Globe className="h-4 w-4 text-white/70" />
                                        <div>
                                            <p className="text-xs text-white/70">{t("mlbb.country")}</p>
                                            <p className="text-white text-sm">{result.region.country}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </ContentLayout>
    );
}
