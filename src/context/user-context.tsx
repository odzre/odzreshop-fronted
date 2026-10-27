"use client";

import { createContext, useContext } from "react";
import useSWR from "swr";
import { useSession } from "next-auth/react";

const fetcher = async (
  url: string,
  token: string,
  deviceId: string
) => {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Device-Id": deviceId ?? "", // 🔥 WAJIB
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Gagal ambil data user");
  }

  const data = await res.json();
  return data.user || data;
};

export const UserContext = createContext<any>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const token = session?.user?.token;

  // 🔥 SAFE: hindari error SSR
  const deviceId =
    typeof window !== "undefined"
      ? localStorage.getItem("device_id")
      : "";

  const { data, mutate, error, isLoading } = useSWR(
    token ? ["/api/auth/user", token, deviceId] : null,
    ([url, token, deviceId]: [string, string, string]) =>
      fetcher(url, token, deviceId),
    {
      refreshInterval: 15000,
      revalidateOnFocus: true,
      dedupingInterval: 5000,
    }
  );

  return (
    <UserContext.Provider
      value={{
        user: data,
        refreshUser: mutate,
        loading: isLoading,
        error,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUserGlobal() {
  return useContext(UserContext);
}