"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring } from "framer-motion";
import gsap from "gsap";
import { MapPin, Calendar, ArrowRight } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils/formatDate";

type EventItem = {
  event_id: number;
  event_name: string;
  event_date: string;
  venue?: { venue_name: string; location: string };
  category?: { category_name: string };
  organizer?: { name: string };
};

const CATEGORY_GRADIENTS: Record<string, string> = {
  Movie:   "from-[#1a1a2e] via-[#16213e] to-[#0f3460]",
  Music:   "from-[#2d1b69] via-[#11998e] to-[#38ef7d]",
  Theatre: "from-[#4a1942] via-[#c74b50] to-[#d7816a]",
  Comedy:  "from-[#f7971e] via-[#ffd200] to-[#f7971e]",
  Festival:"from-[#134e5e] via-[#71b280] to-[#134e5e]",
  Sports:  "from-[#1d4350] via-[#a43931] to-[#1d4350]",
};

function EventCard({ event, index }: { event: EventItem; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const rotateX = useSpring(rawX, { stiffness: 300, damping: 24 });
  const rotateY = useSpring(rawY, { stiffness: 300, damping: 24 });

  const cat = event.category?.category_name ?? "Event";
  const gradient = CATEGORY_GRADIENTS[cat] ?? "from-[#2e221b] via-[#6d5a4e] to-[#b65b3a]";

  return (
    <motion.div
      ref={cardRef}
      className="event-card group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-white cursor-pointer"
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      whileHover={{ y: -6, boxShadow: "0 32px 64px rgba(46,34,27,0.18)" }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      onMouseMove={(e) => {
        const rect = cardRef.current!.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        rawY.set((e.clientX - cx) * 0.012);
        rawX.set(-(e.clientY - cy) * 0.012);
      }}
      onMouseLeave={() => { rawX.set(0); rawY.set(0); }}
    >
      {/* Gradient banner */}
      <div className={`relative h-40 w-full bg-gradient-to-br ${gradient} overflow-hidden`}>
        {/* Noise texture overlay */}
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")" }}
        />
        {/* Shimmer on hover */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full"
          initial={false}
          whileHover={{ translateX: "200%" }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        />
        {/* Category pill */}
        <div className="absolute bottom-3 left-3">
          <Badge variant="category" className="backdrop-blur-sm bg-white/20 border-white/30 text-white text-[11px]">
            {cat}
          </Badge>
        </div>
        {/* Event number */}
        <span className="absolute right-3 top-3 font-mono text-[11px] text-white/40">
          #{String(index + 1).padStart(2, "0")}
        </span>
      </div>

      {/* Content */}
      <div className="p-5">
        <h2 className="font-display mb-3 text-lg font-bold text-[var(--accent-dark)] group-hover:text-[var(--accent)] transition-colors line-clamp-1">
          {event.event_name}
        </h2>

        <div className="space-y-1.5 text-sm text-[var(--text-secondary)]">
          <p className="flex items-center gap-1.5">
            <MapPin size={12} className="shrink-0 text-[var(--accent)]" />
            <span className="truncate">{event.venue?.venue_name}, {event.venue?.location}</span>
          </p>
          <p className="flex items-center gap-1.5">
            <Calendar size={12} className="shrink-0 text-[var(--accent)]" />
            {formatDate(event.event_date)}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm font-bold text-[var(--accent)]">From ₹150</span>
          <motion.span
            className="flex items-center gap-1 text-xs font-semibold text-[var(--accent-light)]"
            whileHover={{ x: 3 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            Book now <ArrowRight size={12} />
          </motion.span>
        </div>
      </div>

      {/* Bottom accent line */}
      <motion.div
        className="absolute bottom-0 left-0 h-[2px] bg-[var(--accent)]"
        initial={{ width: "0%" }}
        whileHover={{ width: "100%" }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      />
    </motion.div>
  );
}

export default function EventsPageClient({ events }: { events: EventItem[] }) {
  const gridRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [filter, setFilter] = useState("All");

  const categories = ["All", ...Array.from(new Set(events.map((e) => e.category?.category_name ?? "Event")))];
  const filtered = filter === "All" ? events : events.filter((e) => e.category?.category_name === filter);

  useEffect(() => {
    if (!headingRef.current) return;
    gsap.from(headingRef.current, {
      y: 40, opacity: 0, duration: 0.8, ease: "power3.out",
    });
  }, []);

  useEffect(() => {
    const cards = gridRef.current?.querySelectorAll(".event-card");
    if (!cards?.length) return;
    gsap.fromTo(
      cards,
      { y: 50, opacity: 0, scale: 0.96 },
      {
        y: 0, opacity: 1, scale: 1,
        duration: 0.55, ease: "power3.out",
        stagger: { amount: 0.45, from: "start" },
      }
    );
  }, [filtered]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="mb-10">
        <p className="font-mono text-[11px] tracking-[0.22em] text-[var(--accent)] mb-2">DISCOVER</p>
        <h1 ref={headingRef} className="font-display text-4xl font-extrabold text-[var(--accent-dark)] mb-6">
          All Events
        </h1>

        {/* Category filter pills */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <motion.button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                filter === cat
                  ? "bg-[var(--accent)] text-white shadow-[0_4px_14px_rgba(182,91,58,0.4)]"
                  : "neu-raised text-[var(--text-secondary)] hover:text-[var(--accent-dark)]"
              }`}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              layout
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
            >
              {cat}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div ref={gridRef} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((event, i) => (
          <Link key={event.event_id} href={`/events/${event.event_id}`}>
            <EventCard event={event} index={i} />
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="py-20 text-center text-[var(--text-muted)]"
        >
          No events in this category yet.
        </motion.div>
      )}
    </div>
  );
}
