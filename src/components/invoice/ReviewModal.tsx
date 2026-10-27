"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button"; // ✅ impor komponen Button

export default function ReviewModal({ order, onClose }: any) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [selected, setSelected] = useState(""); // simpan pilihan quick comment
  const [loading, setLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // 🗨️ Quick comment + satu opsi custom
  const quickComments = [
    "Pelayanan ramah",
    "Proses cepat banget",
    "Harga terjangkau",
    "Puas banget topup di sini",
    "Penyelesaian masalah cepat",
    "Custom" // tombol khusus untuk membuka textarea
  ];

  // ✅ Tutup modal jika klik di luar
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // 💾 Kirim review
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return toast.error("Silakan pilih salah satu ulasan.");
    if (selected === "Custom" && !comment.trim())
      return toast.error("Silakan isi ulasan kamu.");

    const finalComment = selected === "Custom" ? comment : selected;

    setLoading(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: order.order_id,
          user_id: order.user_id || null,
          whatsapp: order.whatsapp,
          product_name: order.games,
          product: order.product,
          comment: finalComment,
          rating
        })
      });

      const data = await res.json();

      if (data.status) {
        toast.success("Terima kasih! Review kamu sudah tersimpan.");
        localStorage.setItem(`review_${order.order_id}`, "done");
        onClose();
      } else {
        toast.error(data.message || "Gagal menyimpan review.");
      }
    } catch (err) {
      console.error("❌ Error kirim review:", err);
      toast.error("Terjadi kesalahan saat mengirim review.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        className="fixed inset-0 p-4 bg-black/40 backdrop-blur-sm flex items-end justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          ref={modalRef}
          key="modal"
          className="relative w-full sm:max-w-2xl mx-auto bg-secondary rounded-2xl shadow-lg border border-border p-6 space-y-5"
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <h2 className="text-lg font-semibold text-center">
            Tinggalkan ulasan untuk transaksi ini
          </h2>

          {/* ⭐ Rating */}
          <div className="flex justify-center gap-1 mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="outline-none"
              >
                <Star
                  className={`w-10 h-10 ${
                    star <= rating
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-400"
                  }`}
                />
              </button>
            ))}
          </div>

          {/* 💬 Quick comments */}
          <div className="mt-4">
            <p className="text-sm font-medium text-left mb-2 text-foreground/80">
              Tambahkan Ulasan Kamu
            </p>

            <div className="flex flex-wrap gap-2">
              {quickComments.map((c) => (
                <Button
                  key={c}
                  variant={selected === c ? "default" : "secondary"}
                  size="sm"
                  onClick={() => {
                    setSelected(c);
                    if (c !== "Custom") setComment(c);
                  }}
                  className="rounded-full px-3 py-1.5 text-xs font-medium"
                >
                  {c}
                </Button>
              ))}
            </div>
          </div>

          {/* ✍️ Textarea hanya tampil kalau pilih "Custom" */}
          {selected === "Custom" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4"
            >
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tulis ulasan kamu di sini..."
                className="w-full rounded-lg border border-border bg-background text-sm p-3 outline-none focus:ring-2 focus:ring-primary"
                rows={3}
              />
            </motion.div>
          )}

          {/* 🔘 Tombol kirim */}
          <div className="flex flex-shrink-0 items-center justify-end gap-2">
            <Button
              onClick={handleSubmit}
              disabled={loading}
              variant="default"
              size="sm"
              className="px-4"
            >
              {loading ? "Mengirim..." : "Kirim Ulasan"}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
