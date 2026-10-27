export async function getSettings() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/settings`);
  if (!res.ok) throw new Error("Gagal mengambil data settings");
  const { data } = await res.json();
  return data;
}