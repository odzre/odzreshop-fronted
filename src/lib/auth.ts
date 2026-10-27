import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { cookies } from "next/headers";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                login: { label: "Username or Email", type: "text" },
                password: { label: "Password", type: "password" },
                recaptcha_token: { label: "reCAPTCHA Token", type: "text" },
            },
            async authorize(credentials, req) {
                if (!credentials?.login || !credentials?.password) {
                    return null;
                }

                try {
                    let clientInfo: any = {};
                    try {
                        const { cookies: getCookies } = await import("next/headers");
                        const cookieStore = await getCookies();
                        const raw = cookieStore.get("client_info")?.value;
                        if (raw) {
                            clientInfo = JSON.parse(decodeURIComponent(raw));
                        }
                    } catch {}

                    const res = await fetch(
                        `${process.env.NEXT_PRIVATE_API_URL}/api/auth/login`,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                Accept: "application/json",
                                "X-API-KEY": process.env.API_ACCESS_KEY!,
                                "X-Device-Id": clientInfo.device_id || "",
                            },
                            body: JSON.stringify({
                                login: credentials.login,
                                password: credentials.password,
                                recaptcha_token: credentials.recaptcha_token || "",
                                ip_info: clientInfo,
                                user_agent: clientInfo.user_agent || "Unknown",
                            }),
                        }
                    );

                    if (!res.ok) return null;
                    const data = await res.json();

                    if (!data?.token || !data?.user) return null;

                    return {
                        id: Number(data.user.id),
                        email: data.user.email,
                        name: data.user.name,
                        token: data.token,
                        role: data.user.role,
                        saldo: data.user.saldo ?? 0,
                        points: data.user.points ?? 0,
                        phone_number: data.user.phone_number ?? null,
                        status: data.user.status ?? "Active",
                    } as any;
                } catch (error) {
                    console.error("Credentials login error:", error);
                    return null;
                }
            },
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!
        })
    ],

    callbacks: {
        // ============================
        // SIGN IN → LOGIN KE BACKEND
        // ============================
        async signIn({ user, account }) {
            // Credentials provider already authenticated in authorize()
            if (account?.provider === "credentials") {
                return true;
            }

            try {
                // 🔥 ambil dari cookie (fix Google login)
                let clientInfo: any = {};

                try {
                    const cookieStore = await cookies();
                    const raw = cookieStore.get("client_info")?.value;

                    if (raw) {
                        clientInfo = JSON.parse(decodeURIComponent(raw));
                    }
                } catch { }

                if (!clientInfo.device_id) {
                    console.error("❌ device_id missing saat login");
                    return false;
                }

                const res = await fetch(
                    `${process.env.NEXT_PRIVATE_API_URL}/api/auth/google`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Accept: "application/json",
                            "X-API-KEY": process.env.API_ACCESS_KEY!,
                            "X-Device-Id": clientInfo.device_id, // 🔥 FIX
                        },
                        body: JSON.stringify({
                            email: user.email,
                            name: user.name,
                            ip_info: clientInfo,
                            user_agent: clientInfo.user_agent || "Unknown"
                        })
                    }
                );

                if (!res.ok) return false;
                const data = await res.json();

                if (!data?.token || !data?.user) return false;

                (user as any).token = data.token;
                (user as any).role = data.user.role;
                (user as any).saldo = data.user.saldo ?? 0;
                (user as any).points = data.user.points ?? 0;
                (user as any).id = data.user.id;
                (user as any).phone_number = data.user.phone_number ?? null;
                (user as any).status = data.user.status ?? "Active";

                return true;
            } catch (error) {
                console.error("💥 [NextAuth] signIn error:", error);
                return false;
            }
        },

        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = (user as any).id;
                token.jwtToken = (user as any).token;
                token.role = (user as any).role;
                token.saldo = (user as any).saldo;
                token.points = (user as any).points;
                token.phone_number = (user as any).phone_number;
                token.status = (user as any).status;
            }

            if (trigger === "update") {
                // 🔥 PRIORITAS 1: merge payload eksplisit dari client update({ role, saldo, ... })
                const payload = session as any;
                const hasPayload =
                    payload &&
                    typeof payload === "object" &&
                    (payload.role !== undefined ||
                        payload.saldo !== undefined ||
                        payload.points !== undefined ||
                        payload.phone_number !== undefined ||
                        payload.status !== undefined);

                if (hasPayload) {
                    if (payload.role !== undefined) token.role = payload.role;
                    if (payload.saldo !== undefined) token.saldo = payload.saldo;
                    if (payload.points !== undefined) token.points = payload.points;
                    if (payload.phone_number !== undefined) token.phone_number = payload.phone_number;
                    if (payload.status !== undefined) token.status = payload.status;

                    return token;
                }

                // 🔥 FALLBACK: fetch data terbaru dari backend (payload tidak ada)
                try {
                    // 🔥 ambil device_id dari cookie
                    let deviceId = "";

                    try {
                        const cookieStore = await cookies();
                        const raw = cookieStore.get("client_info")?.value;

                        if (raw) {
                            const parsed = JSON.parse(decodeURIComponent(raw));
                            deviceId = parsed.device_id;
                        }
                    } catch { }

                    const res = await fetch(
                        `${process.env.NEXT_PRIVATE_API_URL}/api/auth/user`,
                        {
                            headers: {
                                Authorization: `Bearer ${token.jwtToken}`,
                                "X-API-KEY": process.env.API_ACCESS_KEY!,
                                "X-Device-Id": deviceId, // 🔥 FIX
                            }
                        }
                    );

                    if (res.ok) {
                        const data = await res.json();
                        token.saldo = data?.user?.saldo ?? token.saldo;
                        token.points = data?.user?.points ?? token.points;
                        token.phone_number = data?.user?.phone_number ?? token.phone_number;
                        token.role = data?.user?.role ?? token.role;
                    }
                } catch (err) {
                    console.error("⚠️ [NextAuth] Gagal refresh saldo:", err);
                }
            }

            // ============================
            // AUTO LOGOUT (JWT EXPIRED)
            // ============================
            if (token.jwtToken?.includes(".")) {
                try {
                    const [, payload] = token.jwtToken.split(".");
                    const decoded = JSON.parse(
                        Buffer.from(payload, "base64").toString()
                    );

                    if (decoded.exp * 1000 < Date.now()) {
                        token.expired = true;
                    }
                } catch { }
            }

            return token;
        },

        // ============================
        // SESSION CALLBACK
        // ============================
        async session({ session, token }) {
            // Auto-logout jika expired
            if (token.expired) {
                return null as any;
            }

            if (!session.user) session.user = {} as any;

            session.user.id = token.id;
            session.user.token = token.jwtToken;
            session.user.role = token.role;
            session.user.saldo = token.saldo;
            session.user.points = token.points;
            session.user.phone_number = token.phone_number;
            session.user.status = token.status;

            return session;
        },

        // ============================
        // REDIRECT
        // ============================
        async redirect({ url, baseUrl }) {
            if (url.includes("/api/auth/callback/google")) {
                const query = url.split("?")[1] || "";
                return `${baseUrl}/auth/google/callback?${query}`;
            }
            if (url.includes("/auth/google/callback")) {
                return url;
            }
            if (url.startsWith(baseUrl)) return url;

            return `${baseUrl}/dashboard`;
        }
    },

    pages: {
        signIn: "/signin",
        error: "/auth/error"
    },

    session: {
        strategy: "jwt",
        maxAge: 7 * 24 * 60 * 60
    }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };