"use client";

import { useEffect, useState } from "react";
import SettingsProfile from "./SettingsProfile";
import SettingsPassword from "./SettingsPassword";
import SettingsDevices from "./SettingsDevices";

export default function Settings() {
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    async function fetchSessions() {
      try {
        const res = await fetch("/api/account-access", {
          headers: {
            "X-Device-Id": localStorage.getItem("device_id") ?? "",
          },
        });
        const data = await res.json();

        setSessions(data?.data || []);
      } catch (err) {
        console.error("Gagal ambil session:", err);
      }
    }

    fetchSessions();
  }, []);

  const removeDevice = (deviceId: string) => {
    setSessions((prev) =>
      prev.filter((item) => item.device_id !== deviceId)
    );
  };



  return (
    <div className="space-y-10">
      <SettingsProfile />

      {/* PASSWORD */}
      <div className="border-t pt-6">
        <SettingsPassword />
      </div>
      {/* DEVICE */}
      <div className="border-t pt-6">
        <SettingsDevices
          sessions={sessions}
          onRemove={removeDevice}
        />
      </div>
    </div>
  );
}