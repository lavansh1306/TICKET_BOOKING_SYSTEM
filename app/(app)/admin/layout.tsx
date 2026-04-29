"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useUserStore } from "@/lib/store/userStore";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const isAuthed = useUserStore((state) => state.isAuthed);

  useEffect(() => {
    if (!isAuthed) {
      router.push("/auth/admin");
      return;
    }

    if (user?.role !== "admin") {
      router.push("/events");
    }
  }, [isAuthed, router, user?.role]);

  if (!isAuthed || user?.role !== "admin") {
    return null;
  }

  return <div className="mx-auto max-w-7xl px-6 py-8">{children}</div>;
}
