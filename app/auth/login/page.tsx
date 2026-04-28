"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useUserStore } from "@/lib/store/userStore";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const setUser = useUserStore((s) => s.setUser);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const json = await response.json();

      if (!response.ok) {
        toast.error(json.error ?? "Unable to login");
        return;
      }

      setUser(json.data);
      const returnUrl = params.get("returnUrl") ?? "/events";
      router.push(returnUrl);
    } catch {
      toast.error("Network error while logging in");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-8 shadow-sm">
        <h1 className="font-display mb-2 text-3xl font-bold text-[var(--accent-dark)]">Welcome back</h1>
        <p className="mb-6 text-sm text-[var(--text-secondary)]">Sign in with your database account.</p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
          />

          <Button type="submit" className="w-full" loading={loading}>
            Sign In
          </Button>
        </form>

        <button
          type="button"
          className="mt-4 text-sm font-medium text-[var(--accent)] hover:underline"
          onClick={() => router.push("/auth/register")}
        >
          Create a new account
        </button>
      </div>
    </div>
  );
}
