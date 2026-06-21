"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Supabase sender access_token i hash-fragmentet ved recovery
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      const params = new URLSearchParams(hash.slice(1));
      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");
      if (access_token && refresh_token) {
        supabase.auth.setSession({ access_token, refresh_token }).then(() => {
          setReady(true);
        });
      }
    }
  }, [supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Koderne matcher ikke.");
      return;
    }
    if (password.length < 6) {
      setError("Koden skal være mindst 6 tegn.");
      return;
    }
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      router.push("/admin");
    }
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-textBody">Indlæser...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8 border border-sand">
        <h1 className="font-heading text-3xl text-cognac mb-2 text-center">Nyt kodeord</h1>
        <p className="text-textBody text-center mb-8">Vælg et nyt kodeord til din konto.</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">{error}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-textPrimary mb-2">Nyt kodeord</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-sand rounded-lg focus:outline-none focus:ring-2 focus:ring-cognac"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-textPrimary mb-2">Bekræft kodeord</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              className="w-full px-4 py-2 border border-sand rounded-lg focus:outline-none focus:ring-2 focus:ring-cognac"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-cognac hover:bg-cognac-hover text-white rounded-lg text-sm font-medium transition-colors"
          >
            {loading ? "Gemmer..." : "Gem nyt kodeord"}
          </button>
        </form>
      </div>
    </div>
  );
}
