"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const STORES = [
  { id: "ion-orchard", name: "ION Orchard" },
  { id: "marina-bay-sands", name: "Marina Bay Sands" },
];

export default function StaffLoginPage() {
  const router = useRouter();
  const [storeId, setStoreId] = useState(STORES[0].id);
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("staff_token");
    if (token) router.push("/staff/dashboard");
  }, [router]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/staff/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin, storeId }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Wrong PIN");
        return;
      }
      localStorage.setItem("staff_token", data.token);
      localStorage.setItem("staff_info", JSON.stringify(data.staff));
      toast.success(`Welcome, ${data.staff.name}!`);
      router.push("/staff/dashboard");
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-10 justify-center">
          <div className="w-10 h-10 bg-swatch-red rounded-full" />
          <span className="font-black text-2xl uppercase tracking-widest text-white">Swatch</span>
        </div>

        <h1 className="text-3xl font-black uppercase text-white text-center mb-2">Staff Login</h1>
        <p className="text-center text-sm text-gray-400 mb-8 uppercase tracking-widest">Enter your store PIN</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Store</label>
            <select
              className="w-full bg-swatch-gray-dark text-white border-2 border-gray-600 px-4 py-3 font-bold focus:outline-none focus:border-swatch-red"
              value={storeId}
              onChange={(e) => setStoreId(e.target.value)}
            >
              {STORES.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">PIN</label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={8}
              className="w-full bg-swatch-gray-dark text-white border-2 border-gray-600 px-4 py-3 font-black text-2xl tracking-[0.5em] text-center focus:outline-none focus:border-swatch-red"
              placeholder="••••"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              required
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full mt-2 disabled:opacity-50">
            {loading ? "Logging in..." : "Login →"}
          </button>
        </form>
      </div>
    </main>
  );
}
