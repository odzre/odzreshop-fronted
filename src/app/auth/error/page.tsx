"use client";

import { Suspense } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") || "Unknown";

  const errorMessages: Record<string, string> = {
    AccessDenied:
      "Akses ditolak — akun Anda belum diaktifkan atau diblokir oleh admin.",
    OAuthSignin: "Gagal terhubung ke Google. Coba lagi nanti.",
    OAuthCallback: "Terjadi kesalahan saat autentikasi.",
    Configuration: "Konfigurasi login bermasalah.",
    Default: "Terjadi kesalahan yang tidak diketahui."
  };

  const message = errorMessages[error] || errorMessages.Default;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white px-4 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center"
      >
        <Image
          src="/images/error-lock.svg"
          alt="Access Denied"
          width={180}
          height={180}
          className="mx-auto mb-6"
        />
        <h1 className="text-4xl font-bold mb-3">403 — Akses Ditolak</h1>
        <p className="text-gray-300 mb-6">{message}</p>
        <Link
          href="/"
          className="bg-blue-600 hover:bg-blue-700 transition px-6 py-2 rounded-lg text-white font-semibold"
        >
          Kembali ke Beranda
        </Link>
      </motion.div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={<div className="text-center mt-10 text-white">Memuat...</div>}
    >
      <ErrorContent />
    </Suspense>
  );
}
