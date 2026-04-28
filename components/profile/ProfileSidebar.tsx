"use client";

import { useEffect, useState } from "react";
import { useUserStore } from "@/lib/store/userStore";
import { useRouter } from "next/navigation";

export default function ProfileSidebar() {
  const user = useUserStore((s) => s.user);
  const router = useRouter();

  if (!user) return null;

  const initials = user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#4F46E5] text-white text-2xl font-bold">{initials}</div>
        <div>
          <div className="font-syne text-lg font-bold">{user.name}</div>
          <div className="text-sm text-[#6B6B6B]">{user.email}</div>
          <div className="text-xs text-[#9B9B9B]">Member since 2024</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="neu-raised p-3 text-center">
          <div className="text-xs text-[#6B6B6B]">Bookings</div>
          <div className="font-syne text-lg font-bold">3</div>
        </div>
        <div className="neu-raised p-3 text-center">
          <div className="text-xs text-[#6B6B6B]">Amount Spent</div>
          <div className="font-syne text-lg font-bold">₹1,200</div>
        </div>
        <div className="neu-raised p-3 text-center">
          <div className="text-xs text-[#6B6B6B]">Events Attended</div>
          <div className="font-syne text-lg font-bold">2</div>
        </div>
      </div>

      <nav className="space-y-1">
        <button className="w-full text-left px-3 py-2" onClick={() => router.push('/profile/bookings')}>Tickets</button>
        <button className="w-full text-left px-3 py-2" onClick={() => router.push('/profile/reviews')}>Reviews</button>
        <button className="w-full text-left px-3 py-2" onClick={() => router.push('/profile/settings')}>Settings</button>
        <button className="w-full text-left px-3 py-2 text-red-600" onClick={() => { useUserStore.getState().clearUser(); router.push('/auth/login'); }}>Sign Out</button>
      </nav>
    </div>
  );
}
