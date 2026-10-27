/** @type {import('next').NextConfig} */

const apiUrl = process.env.NEXT_PRIVATE_API_URL
  ? new URL(process.env.NEXT_PRIVATE_API_URL).hostname
  : null;

const nextConfig = {
  poweredByHeader: false,

  compress: true,

  compiler: {
    removeConsole: process.env.NODE_ENV === "production"
  },

  images: {
    remotePatterns: [
      { protocol: "http", hostname: "127.0.0.1", pathname: "/**" },
      { protocol: "http", hostname: "localhost", pathname: "/**" },

      { protocol: "https", hostname: "tripay.co.id", pathname: "/**" },
      { protocol: "https", hostname: "assets.tripay.co.id", pathname: "/**" },
      { protocol: "https", hostname: "assets.tokopay.id", pathname: "/**" },
      { protocol: "https", hostname: "images.duitku.com", pathname: "/**" },

      // Odzre Tools — QRIS image dari GoPay Merchant & OrderKuota
      { protocol: "https", hostname: "helper.odzre.my.id", pathname: "/**" },
      { protocol: "http",  hostname: "helper.odzre.my.id", pathname: "/**" },

      // ZannPay — logo metode pembayaran (CDN)
      { protocol: "https", hostname: "cdn.zannstore.com", pathname: "/**" },
      { protocol: "https", hostname: "cekid.zannstore.com", pathname: "/**" },

      ...(apiUrl
        ? [
          { protocol: "https", hostname: apiUrl, pathname: "/**" },
          { protocol: "http", hostname: apiUrl, pathname: "/**" }
        ]
        : [])
    ]
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Powered-By", value: "DOOxNVD" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" }
        ]
      }
    ];
  }
};

export default nextConfig;