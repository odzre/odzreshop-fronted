import { DefaultSession, DefaultUser } from "next-auth";

// =====================================
// EXTEND USER & SESSION (FRONTEND DATA)
// =====================================
declare module "next-auth" {
    interface User extends DefaultUser {
        id?: number;
        token?: string;
        role?: string;
        saldo?: number;
        points?: number;
        phone_number?: string;
        status?: string;
    }

    interface Session extends DefaultSession {
        user: {
            id?: number;
            token?: string;
            role?: string;
            saldo?: number;
            points?: number;
            phone_number?: string;
            status?: string;
        } & DefaultSession["user"];

        // Opsional → beberapa kasus butuh akses expired di session
        expired?: boolean;
    }
}

// =====================================
// EXTEND JWT CALLBACK (FUNGSI jwt())
// =====================================
declare module "next-auth/jwt" {
    interface JWT {
        id?: number;
        jwtToken?: string;
        role?: string;
        saldo?: number;
        points?: number;
        phone_number?: string;
        status?: string;

        // 🔥 WAJIB: agar tidak merah saat session() cek token expired
        expired?: boolean;
    }
}
