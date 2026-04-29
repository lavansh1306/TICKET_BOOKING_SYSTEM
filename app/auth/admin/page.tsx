"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { useUserStore } from "@/lib/store/userStore";

export default function AdminLoginPage() {
  const router = useRouter();
  const setUser = useUserStore((state) => state.setUser);

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const json = await response.json();

      if (!response.ok) {
        setError(json.error ?? "Unable to login as admin");
        return;
      }

      setUser(json.data);
      router.push("/admin");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)] px-6">
      <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--accent)]">Admin</p>
        <h1 className="mt-2 font-syne text-3xl font-bold text-[var(--accent-dark)]">Admin login</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Sign in with an email that exists in your Admin table.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
              Admin email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] px-3 py-2.5 text-sm text-[var(--accent-dark)] outline-none focus:ring-2 focus:ring-[var(--accent)]/25"
              placeholder="admin1@system.com"
              required
            />
          </div>

          {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Login as admin"}
          </button>
        </form>

        <button
          onClick={() => router.push("/auth/login")}
          className="mt-4 text-sm font-semibold text-[var(--accent)] hover:underline"
        >
          User login →
        </button>
      </div>
    </div>
  );
}
