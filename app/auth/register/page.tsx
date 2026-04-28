"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password }),
      });

      const json = await response.json();

      if (!response.ok) {
        toast.error(json.error ?? "Unable to create account");
        return;
      }

      toast.success("Account created. Please sign in.");
      router.push("/auth/login");
    } catch {
      toast.error("Network error while creating account");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-8 shadow-sm">
        <h1 className="font-display mb-2 text-3xl font-bold text-[var(--accent-dark)]">Create account</h1>
        <p className="mb-6 text-sm text-[var(--text-secondary)]">Join the booking system with your real database profile.</p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Your phone number" />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimum 6 characters" />
          <Input
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repeat password"
          />

          <Button type="submit" className="w-full" loading={loading}>
            Sign Up
          </Button>
        </form>

        <button
          type="button"
          className="mt-4 text-sm font-medium text-[var(--accent)] hover:underline"
          onClick={() => router.push("/auth/login")}
        >
          Already have an account?
        </button>
      </div>
    </div>
  );
}
