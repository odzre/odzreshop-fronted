"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Star, ArrowRightLeft, TrendingUp, Gift, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useCurrency } from "@/hooks/useCurrency";

interface PointBalance {
  points: number;
  estimated_value: number;
  enabled: boolean;
  value_per_point: number;
  min_redeem: number;
  min_transaction: number;
}

interface PointLog {
  id: number;
  type: "earn" | "redeem";
  amount: number;
  points_before: number;
  points_after: number;
  description: string;
  order_id: string | null;
  created_at: string;
}

export default function Points() {
  const { format } = useCurrency();
  const [balance, setBalance] = useState<PointBalance | null>(null);
  const [logs, setLogs] = useState<PointLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(true);
  const [redeemAmount, setRedeemAmount] = useState("");
  const [redeeming, setRedeeming] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  // === Fetch balance ===
  async function fetchBalance() {
    try {
      let deviceId = localStorage.getItem("device_id");
      if (!deviceId) {
        await new Promise((r) => setTimeout(r, 300));
        deviceId = localStorage.getItem("device_id");
      }
      if (!deviceId) return;

      const res = await fetch("/api/points/balance", {
        credentials: "include",
        headers: { "X-Device-Id": deviceId },
        cache: "no-store",
      });
      const data = await res.json();
      if (data?.success) {
        setBalance(data.data);
      }
    } catch (err) {
      console.error("Error fetching points balance:", err);
    } finally {
      setLoading(false);
    }
  }

  // === Fetch logs ===
  async function fetchLogs() {
    try {
      setLogsLoading(true);
      let deviceId = localStorage.getItem("device_id");
      if (!deviceId) {
        await new Promise((r) => setTimeout(r, 300));
        deviceId = localStorage.getItem("device_id");
      }
      if (!deviceId) return;

      const res = await fetch(`/api/points?page=${currentPage}`, {
        credentials: "include",
        headers: { "X-Device-Id": deviceId },
        cache: "no-store",
      });
      const data = await res.json();
      if (data?.success) {
        setLogs(data.data?.data ?? []);
        setLastPage(data.data?.last_page ?? 1);
      }
    } catch (err) {
      console.error("Error fetching points logs:", err);
    } finally {
      setLogsLoading(false);
    }
  }

  useEffect(() => {
    fetchBalance();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [currentPage]);

  // === Redeem handler ===
  async function handleRedeem() {
    const amount = parseInt(redeemAmount);
    if (!amount || amount <= 0) {
      toast.error("Masukkan jumlah point yang valid.");
      return;
    }

    if (balance && amount < balance.min_redeem) {
      toast.error(`Minimal penukaran adalah ${balance.min_redeem} point.`);
      return;
    }

    if (balance && amount > balance.points) {
      toast.error("Point tidak mencukupi.");
      return;
    }

    setRedeeming(true);
    try {
      let deviceId = localStorage.getItem("device_id");
      if (!deviceId) {
        await new Promise((r) => setTimeout(r, 300));
        deviceId = localStorage.getItem("device_id");
      }

      const res = await fetch("/api/points", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-Device-Id": deviceId ?? "",
        },
        body: JSON.stringify({ amount }),
      });

      const data = await res.json();
      if (data?.success) {
        toast.success(data.message);
        setRedeemAmount("");
        fetchBalance();
        fetchLogs();
      } else {
        toast.error(data.message || "Gagal menukar point.");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan, coba lagi.");
    } finally {
      setRedeeming(false);
    }
  }

  // === Format date ===
  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // === Format Currency (via useCurrency hook) ===
  function formatRp(num: number) {
    return format(num);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner />
      </div>
    );
  }

  // === Fitur tidak aktif ===
  if (balance && !balance.enabled) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center gap-4 py-20 rounded-2xl border border-dashed border-muted">
          <AlertCircle size={48} className="text-muted-foreground" />
          <h3 className="text-lg font-semibold text-muted-foreground">
            Fitur Point Reward belum aktif
          </h3>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            Fitur penukaran point reward saat ini belum diaktifkan oleh admin. Silakan hubungi admin untuk informasi lebih lanjut.
          </p>
        </div>
      </div>
    );
  }

  const estimatedRedeem = redeemAmount
    ? parseInt(redeemAmount) * (balance?.value_per_point ?? 1)
    : 0;

  return (
    <div className="space-y-6">
      {/* === Header Card === */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20 border border-primary/20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        <div className="relative p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/20">
              <Star size={24} className="text-primary fill-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Point Anda</p>
              <h2 className="text-3xl font-bold tracking-tight">
                {balance?.points?.toLocaleString("id-ID") ?? 0}
                <span className="text-base font-normal text-muted-foreground ml-2">point</span>
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="rounded-xl bg-card/50 backdrop-blur-sm p-3 border border-border/50">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Estimasi Nilai</p>
              <p className="text-sm font-semibold text-emerald-400 mt-0.5">
                {formatRp(balance?.estimated_value ?? 0)}
              </p>
            </div>
            <div className="rounded-xl bg-card/50 backdrop-blur-sm p-3 border border-border/50">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Nilai / Point</p>
              <p className="text-sm font-semibold mt-0.5">
                {formatRp(balance?.value_per_point ?? 1)}
              </p>
            </div>
            <div className="rounded-xl bg-card/50 backdrop-blur-sm p-3 border border-border/50 col-span-2 sm:col-span-1">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Min. Tukar</p>
              <p className="text-sm font-semibold mt-0.5">
                {balance?.min_redeem?.toLocaleString("id-ID") ?? 100} point
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* === Redeem Form === */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Gift size={20} className="text-primary" />
          <h3 className="font-semibold">Tukar Point ke Saldo</h3>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">
              Jumlah Point
            </label>
            <input
              type="number"
              min="1"
              value={redeemAmount}
              onChange={(e) => setRedeemAmount(e.target.value)}
              placeholder={`Minimal ${balance?.min_redeem ?? 100} point`}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>

          {redeemAmount && parseInt(redeemAmount) > 0 && (
            <div className="flex items-center gap-2 text-sm bg-emerald-500/10 text-emerald-400 rounded-lg px-3 py-2">
              <ArrowRightLeft size={14} />
              <span>
                {parseInt(redeemAmount).toLocaleString("id-ID")} point = <strong>{formatRp(estimatedRedeem)}</strong> saldo
              </span>
            </div>
          )}

          <Button
            onClick={handleRedeem}
            disabled={redeeming || !redeemAmount}
            className="w-full rounded-xl"
          >
            {redeeming ? (
              <>
                <LoadingSpinner /> Memproses...
              </>
            ) : (
              <>
                <Gift size={16} className="mr-2" />
                Tukar Sekarang
              </>
            )}
          </Button>
        </div>
      </div>

      {/* === Info Cara Mendapatkan Point === */}
      <div className="rounded-2xl border border-border bg-card/50 p-5">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={18} className="text-primary" />
          <h4 className="font-medium text-sm">Cara Mendapatkan Point</h4>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Setiap transaksi berhasil senilai <strong className="text-foreground">{formatRp(balance?.min_transaction ?? 1000)}</strong> akan
          memberikan <strong className="text-foreground">1 point</strong>. Point otomatis masuk setelah transaksi berstatus <Badge variant="outline" className="text-[10px] px-1.5 py-0 ml-0.5">Sukses</Badge>.
        </p>
      </div>

      {/* === Riwayat Point === */}
      <div className="rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-2 p-5 border-b border-border">
          <Star size={18} className="text-primary" />
          <h3 className="font-semibold">Riwayat Point</h3>
        </div>

        {logsLoading ? (
          <div className="flex justify-center py-10">
            <LoadingSpinner />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground text-sm">
            Belum ada riwayat point.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`p-2 rounded-lg shrink-0 ${
                      log.type === "earn"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-orange-500/10 text-orange-400"
                    }`}
                  >
                    {log.type === "earn" ? (
                      <TrendingUp size={16} />
                    ) : (
                      <ArrowRightLeft size={16} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {log.description}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {formatDate(log.created_at)}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0 ml-3">
                  <p
                    className={`text-sm font-semibold ${
                      log.type === "earn" ? "text-emerald-400" : "text-orange-400"
                    }`}
                  >
                    {log.type === "earn" ? "+" : "-"}
                    {log.amount.toLocaleString("id-ID")}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {log.points_after?.toLocaleString("id-ID")} point
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* === Pagination === */}
        {lastPage > 1 && (
          <div className="flex items-center justify-center gap-2 p-4 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="rounded-lg"
            >
              ← Prev
            </Button>
            <span className="text-xs text-muted-foreground px-2">
              {currentPage} / {lastPage}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(lastPage, p + 1))}
              disabled={currentPage >= lastPage}
              className="rounded-lg"
            >
              Next →
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
