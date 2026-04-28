"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/lib/store/userStore";

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAuthed = useUserStore((s) => s.isAuthed);

  useEffect(() => {
    if (!isAuthed) router.push("/auth/login");
  }, [isAuthed, router]);

  if (!isAuthed) return null;

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <section>{children}</section>
    </div>
  );
}
