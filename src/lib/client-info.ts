export const getClientInfo = async () => {
    const res = await fetch("/api/client-info");
    const json = await res.json();

    const deviceId =
        localStorage.getItem("device_id") ||
        crypto.randomUUID();

    const fingerprint = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        screen: `${window.screen.width}x${window.screen.height}`,
    };

    localStorage.setItem("device_id", deviceId);

    const data = {
        ...json.data,
        device_id: deviceId,
        fingerprint,
    };

    document.cookie = `client_info=${encodeURIComponent(
        JSON.stringify(data)
    )}; path=/`;

    return data;
};