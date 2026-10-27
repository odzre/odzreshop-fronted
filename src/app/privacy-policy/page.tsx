"use client";

import { useSettings } from "@/context/settings-context";
import { ContentLayout } from "@/components/panel/content-layout";
import { Skeleton } from "@/components/ui/skeleton"; // ✅ import skeleton
import React from "react";

export default function PrivacyPolicyPage() {
    interface Settings {
        data: {
            ["general.title"]?: string;
            ["sosmed.wa"]?: string;
            ["sosmed.email"]?: string;
        };
    }

    const settings = useSettings() as unknown as Settings | null;
    const isLoading = !settings;

    const storeName = settings?.data?.["general.title"] || "NVDSTORE";
    const waNumber = settings?.data?.["sosmed.wa"] || "6282277113307";
    const email = settings?.data?.["sosmed.email"] || "smcridho@gmail.com";

    return (
        <ContentLayout title="Kebijakan Privasi">
            <main className="w-full px-4 py-10">
                <h1 className="text-2xl sm:text-3xl font-bold text-my-color mb-6">
                    Kebijakan Privasi
                </h1>

                {isLoading ? (
                    <div className="space-y-3">
                        <Skeleton className="h-5 w-1/2" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-4/5" />
                    </div>
                ) : (
                    <div className="space-y-4 border border-muted p-4 rounded-lg text-sm sm:text-base leading-relaxed text-muted-foreground">
                        <p>
                            - Kebijakan Privasi ini merupakan kesepakatan antara {storeName} dan Pengguna.
                        </p>
                        <h2 className="font-semibold mt-6">DATA PENGGUNA</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Pihak {storeName} dalam mendukung dan mengoptimalkan layanan berhak meminta data pribadi Pengguna yang dibutuhkan.</li>
                            <li>Dengan memberikan informasi pribadi kepada {storeName}, Pengguna melepaskan hak atas kerugian, tuntutan, dan gugatan yang mungkin timbul.</li>
                            <li>Pengguna memberi izin {storeName} untuk menerima, mengelola, menyimpan, dan memproses data pribadi.</li>
                            <li>Data diberikan secara sadar dan cakap oleh Pengguna.</li>
                            <li>Data yang diberikan adalah asli dan milik pribadi Pengguna.</li>
                            <li>Pengguna dapat melakukan pemutakhiran data pribadi.</li>
                            <li>{storeName} berhak meminta pemutakhiran data apabila diperlukan.</li>
                            <li>Pengguna membebaskan {storeName} dari tuntutan akibat kegagalan proses karena data tidak lengkap.</li>
                            <li>{storeName} akan melindungi kerahasiaan data pribadi.</li>
                        </ul>

                        <h2 className="font-semibold mt-6">PENGUMPULAN</h2>
                        <ol className="list-decimal pl-5 space-y-2">
                            <li>Data dikumpulkan saat Pengguna menggunakan layanan dan mengisi identitas.</li>
                            <li>Data disimpan otomatis setelah menyetujui Syarat & Ketentuan atau Kebijakan Privasi.</li>
                        </ol>

                        <h2 className="font-semibold mt-6">PENGGUNAAN</h2>
                        <ol className="list-decimal pl-5 space-y-2">
                            <li>Untuk melancarkan proses layanan dan transaksi.</li>
                            <li>Untuk menyediakan, meningkatkan, dan mengembangkan layanan serta analisa masalah.</li>
                            <li>Untuk merekomendasikan fitur, produk, atau layanan.</li>
                            <li>Untuk mematuhi kewajiban hukum dari otoritas.</li>
                            <li>Untuk mempermudah komunikasi antara Pengguna dan {storeName}.</li>
                            <li>Untuk memudahkan kerja sama dengan Pihak Ketiga (jika diperlukan).</li>
                            <li>Untuk mencegah atau mendeteksi pelanggaran hukum.</li>
                            <li>Untuk kepentingan hukum lainnya yang disampaikan secara eksplisit.</li>
                        </ol>

                        <h2 className="font-semibold mt-6">PENYIMPANAN</h2>
                        <ol className="list-decimal pl-5 space-y-2">
                            <li>Data disimpan untuk layanan {storeName}, tujuan hukum, dan kebijakan privasi.</li>
                            <li>Data disimpan dari awal input hingga Pengguna berhenti menggunakan layanan.</li>
                        </ol>

                        <h2 className="font-semibold mt-6">PENGHAPUSAN</h2>
                        <p>{storeName} akan menghapus data apabila:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Pengguna berhenti menggunakan layanan selama 2 tahun.</li>
                            <li>Pengguna mengajukan penghapusan data dengan dokumen pendukung.</li>
                            <li>{storeName} menolak penghapusan jika bertentangan dengan hukum.</li>
                            <li>{storeName} menghapus data jika tidak lagi diperlukan.</li>
                        </ul>

                        <h2 className="font-semibold mt-6">TANGGUNG JAWAB</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Pengguna bertanggung jawab atas keamanan datanya (PIN, password, dll).</li>
                            <li>Pengguna bertanggung jawab atas penggunaan akun oleh pihak ketiga.</li>
                            <li>Pengguna harus segera melapor jika terjadi penyalahgunaan.</li>
                            <li>{storeName} tidak bertanggung jawab atas kelalaian Pengguna.</li>
                            <li>{storeName} tidak bertanggung jawab atas penggunaan oleh anak di bawah umur tanpa pengawasan.</li>
                            <li>{storeName} dibebaskan dari tanggung jawab jika ada force majeure.</li>
                        </ul>

                        <h2 className="font-semibold mt-6">HUBUNGI KAMI</h2>
                        <p>WhatsApp: {waNumber}</p>
                        <p>Email: {email}</p>
                        <p className="mt-6 text-xs">Diperbarui pada: 24 Oktober 2024</p>
                    </div>
                )}
            </main>
        </ContentLayout>
    );
}
