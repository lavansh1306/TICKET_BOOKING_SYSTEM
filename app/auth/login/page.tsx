"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useUserStore } from "@/lib/store/userStore";
import { users } from "@/lib/mock";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const setUser = useUserStore((s) => s.setUser);

  function login(userId: number) {
    const user = users.find((u) => u.user_id === userId)!;
    setUser(user);
    const returnUrl = params.get("returnUrl") ?? "/events";
    router.push(returnUrl);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm rounded-2xl border border-[#E4E4E7] p-8">
        <h1 className="font-display mb-1 text-2xl font-bold text-[#0A0A0A]">Dev Login</h1>
        <p className="mb-6 text-sm text-[#9B9B9B]">Pick any mock user to sign in instantly.</p>

        <div className="space-y-2">
          {users.map((u) => (
            <button
              key={u.user_id}
              onClick={() => login(u.user_id)}
              className="neu-raised flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left hover:bg-[#F5F5F7]"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1A1A2E] text-xs font-bold text-white">
                {u.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0A0A0A]">{u.name}</p>
                <p className="text-xs text-[#9B9B9B]">{u.email}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
