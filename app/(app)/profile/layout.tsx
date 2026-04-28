"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import ProfileSidebar from "@/components/profile/ProfileSidebar";
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
      <div className="grid grid-cols-[240px_1fr] gap-8">
        <aside className="sticky top-[80px]">
          <ProfileSidebar />
        </aside>
        <section>{children}</section>
      </div>
    </div>
  );
}
