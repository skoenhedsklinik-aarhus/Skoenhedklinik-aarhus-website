"use client";

import { useState } from "react";
import { login } from "./actions";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await login(formData);
    if (result?.error) {
      setError(result.error);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8 border border-sand">
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl text-cognac mb-2">Admin Login</h1>
          <p className="text-textBody">Log ind for at redigere sidens indhold</p>
        </div>

        <form action={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-textPrimary mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              className="w-full px-4 py-2 border border-sand rounded-lg focus:outline-none focus:ring-2 focus:ring-cognac"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-textPrimary mb-2">
              Adgangskode
            </label>
            <input
              type="password"
              name="password"
              required
              className="w-full px-4 py-2 border border-sand rounded-lg focus:outline-none focus:ring-2 focus:ring-cognac"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-cognac hover:bg-cognac-hover text-white rounded-lg"
            disabled={loading}
          >
            {loading ? "Log ind..." : "Log ind"}
          </Button>
        </form>
      </div>
    </div>
  );
}
