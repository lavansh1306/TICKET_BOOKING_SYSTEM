"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Search, Bell, ChevronDown, Menu, X } from "lucide-react";
import { useUserStore } from "@/lib/store/userStore";
import { venues } from "@/lib/mock";

const CITIES = [...new Set(venues.map((v) => v.location))];

export default function AppNavbar() {
  const router = useRouter();
  const { user, isAuthed, clearUser } = useUserStore();

  const [city, setCity] = useState(CITIES[0]);
  const [cityOpen, setCityOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const cityRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) setCityOpen(false);
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) setAvatarOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initials = user?.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  function signOut() {
    clearUser();
    setAvatarOpen(false);
    router.push("/auth/login");
  }

  return (
    <>
      <header className="sticky top-0 z-50 h-16 w-full border-b border-[#E4E4E7] bg-white">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6">
          {/* Wordmark */}
          <button
            onClick={() => router.push("/events")}
            className="font-sans text-base font-bold tracking-widest text-[#0A0A0A]"
          >
            BOOKING_SYSTEM
          </button>

          {/* City selector — desktop */}
          <div ref={cityRef} className="relative hidden md:block">
            <button
              onClick={() => setCityOpen((o) => !o)}
              className="neu-raised flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-[#0A0A0A]"
            >
              {city}
              <ChevronDown size={14} className={`transition-transform ${cityOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {cityOpen && (
                <motion.ul
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-1/2 top-full mt-2 w-40 -translate-x-1/2 overflow-hidden rounded-xl border border-[#E4E4E7] bg-white shadow-lg"
                >
                  {CITIES.map((c) => (
                    <li key={c}>
                      <button
                        onClick={() => { setCity(c); setCityOpen(false); }}
                        className={`w-full px-4 py-2.5 text-left text-sm hover:bg-[#F5F5F7] ${c === city ? "font-semibold text-[#0A0A0A]" : "text-[#6B6B6B]"}`}
                      >
                        {c}
                      </button>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <button className="neu-raised flex h-9 w-9 items-center justify-center rounded-full">
              <Search size={16} className="text-[#6B6B6B]" />
            </button>

            {/* Bell */}
            <div className="relative">
              <button className="neu-raised flex h-9 w-9 items-center justify-center rounded-full">
                <Bell size={16} className="text-[#6B6B6B]" />
              </button>
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#DC2626] text-[10px] font-bold text-white">
                2
              </span>
            </div>

            {/* Auth — desktop */}
            {!isAuthed ? (
              <div className="hidden items-center gap-3 md:flex">
                <button
                  onClick={() => router.push("/auth/login")}
                  className="text-sm font-medium text-[#0A0A0A] hover:text-[#4F46E5]"
                >
                  Sign In
                </button>
                <button
                  onClick={() => router.push("/auth/register")}
                  className="rounded-lg bg-[#1A1A2E] px-4 py-2 text-sm font-medium text-white hover:bg-[#0A0A0A]"
                >
                  Register
                </button>
              </div>
            ) : (
              <div ref={avatarRef} className="relative hidden md:block">
                <button
                  onClick={() => setAvatarOpen((o) => !o)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1A1A2E] text-xs font-bold text-white"
                >
                  {initials}
                </button>
                <AnimatePresence>
                  {avatarOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-48 overflow-hidden rounded-xl border border-[#E4E4E7] bg-white shadow-lg"
                    >
                      {[
                        { label: "My Profile", href: "/profile" },
                        { label: "My Bookings", href: "/profile/bookings" },
                        { label: "My Reviews", href: "/profile/reviews" },
                        { label: "Settings", href: "/profile/settings" },
                      ].map(({ label, href }) => (
                        <button
                          key={href}
                          onClick={() => { router.push(href); setAvatarOpen(false); }}
                          className="w-full px-4 py-2.5 text-left text-sm text-[#0A0A0A] hover:bg-[#F5F5F7]"
                        >
                          {label}
                        </button>
                      ))}
                      <div className="my-1 border-t border-[#E4E4E7]" />
                      <button
                        onClick={signOut}
                        className="w-full px-4 py-2.5 text-left text-sm font-medium text-[#DC2626] hover:bg-[#F5F5F7]"
                      >
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Hamburger — mobile */}
            <button
              className="flex h-9 w-9 items-center justify-center rounded-full md:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={20} className="text-[#0A0A0A]" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile bottom-sheet drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30, duration: 0.4 }}
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-white px-6 pb-10 pt-4"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="font-sans text-sm font-bold tracking-widest text-[#0A0A0A]">BOOKING_SYSTEM</span>
                <button onClick={() => setMobileOpen(false)}>
                  <X size={20} className="text-[#6B6B6B]" />
                </button>
              </div>

              {/* City selector mobile */}
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#9B9B9B]">City</p>
              <div className="mb-4 flex flex-wrap gap-2">
                {CITIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCity(c)}
                    className={`rounded-full px-3 py-1.5 text-sm ${c === city ? "bg-[#1A1A2E] text-white" : "bg-[#F5F5F7] text-[#6B6B6B]"}`}
                  >
                    {c}
                  </button>
                ))}
              </div>

              <div className="border-t border-[#E4E4E7] pt-4">
                {isAuthed ? (
                  <>
                    {[
                      { label: "My Profile", href: "/profile" },
                      { label: "My Bookings", href: "/profile/bookings" },
                      { label: "My Reviews", href: "/profile/reviews" },
                      { label: "Settings", href: "/profile/settings" },
                    ].map(({ label, href }) => (
                      <button
                        key={href}
                        onClick={() => { router.push(href); setMobileOpen(false); }}
                        className="block w-full py-3 text-left text-sm font-medium text-[#0A0A0A]"
                      >
                        {label}
                      </button>
                    ))}
                    <button
                      onClick={() => { signOut(); setMobileOpen(false); }}
                      className="mt-2 block w-full py-3 text-left text-sm font-medium text-[#DC2626]"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => { router.push("/auth/login"); setMobileOpen(false); }}
                      className="w-full rounded-lg border border-[#E4E4E7] py-3 text-sm font-medium text-[#0A0A0A]"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => { router.push("/auth/register"); setMobileOpen(false); }}
                      className="w-full rounded-lg bg-[#1A1A2E] py-3 text-sm font-medium text-white"
                    >
                      Register
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
