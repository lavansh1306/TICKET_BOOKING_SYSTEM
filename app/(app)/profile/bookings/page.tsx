"use client";

import { useEffect, useMemo, useState } from "react";
import { Calendar, MapPin, QrCode, Ticket } from "lucide-react";
import { useRouter } from "next/navigation";

import { useUserStore } from "@/lib/store/userStore";

type EventItem = {
  event_id: number;
  event_name: string;
  event_date: string;
  venue?: { venue_name: string; location: string };
};

type BookingView = {
  bookingId: number;
  eventId: number;
  eventName: string;
  eventDate: string;
  venueName: string;
  location: string;
  seats: string[];
  amount: number;
  status: "Upcoming" | "Completed";
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function ProfileBookingsPage() {
  const router = useRouter();
  const user = useUserStore((s) => s.user);

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"All" | "Upcoming" | "Completed">("All");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const response = await fetch("/api/events", { cache: "no-store" });
        const json = await response.json();
        if (!active) return;
        setEvents((json.data ?? []) as EventItem[]);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  const bookings = useMemo<BookingView[]>(() => {
    const today = new Date();

    // Mock booking history generated deterministically from events.
    return events.slice(0, 5).map((event, index) => {
      const bookingId = 7000 + event.event_id + (user?.user_id ?? 0) * 10;
      const baseSeatCode = String.fromCharCode(65 + (index % 5));
      const seatStart = (index % 4) + 1;
      const seats = [`${baseSeatCode}${seatStart}`, `${baseSeatCode}${seatStart + 1}`];
      const amount = 2 * 799 + 118;
      const status = new Date(event.event_date) >= today ? "Upcoming" : "Completed";

      return {
        bookingId,
        eventId: event.event_id,
        eventName: event.event_name,
        eventDate: event.event_date,
        venueName: event.venue?.venue_name ?? "Venue",
        location: event.venue?.location ?? "Location",
        seats,
        amount,
        status,
      };
    });
  }, [events, user?.user_id]);

  const visibleBookings = useMemo(() => {
    if (filter === "All") return bookings;
    return bookings.filter((booking) => booking.status === filter);
  }, [bookings, filter]);

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-[var(--border)] bg-white p-6">
        <h1 className="font-syne text-3xl font-bold text-[var(--accent-dark)]">My Bookings</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">Track every ticket purchase and jump to event details quickly.</p>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        {(["All", "Upcoming", "Completed"] as const).map((option) => (
          <button
            key={option}
            onClick={() => setFilter(option)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              filter === option
                ? "bg-[var(--accent)] text-white"
                : "border border-[var(--border)] bg-white text-[#3F3F46] hover:border-[#C7D2FE]"
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="rounded-2xl border border-[var(--border)] bg-white p-6 text-sm text-[var(--text-secondary)]">Loading bookings...</div>
      ) : visibleBookings.length === 0 ? (
        <div className="rounded-2xl border border-[var(--border)] bg-white p-8 text-center">
          <p className="text-sm text-[var(--text-secondary)]">No bookings found in this filter.</p>
          <button className="mt-4 text-sm font-semibold text-[var(--accent)] hover:underline" onClick={() => router.push("/events")}>
            Browse events
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {visibleBookings.map((booking) => (
            <article key={booking.bookingId} className="rounded-2xl border border-[var(--border)] bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]">Booking #{booking.bookingId}</p>
                  <h2 className="mt-1 font-syne text-2xl font-bold text-[var(--accent-dark)]">{booking.eventName}</h2>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    booking.status === "Upcoming" ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-700"
                  }`}
                >
                  {booking.status}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 text-sm text-[#3F3F46] md:grid-cols-2 xl:grid-cols-4">
                <InfoItem icon={<Calendar size={14} />} label="Date" value={new Date(booking.eventDate).toLocaleDateString("en-IN")} />
                <InfoItem icon={<MapPin size={14} />} label="Venue" value={`${booking.venueName}, ${booking.location}`} />
                <InfoItem icon={<Ticket size={14} />} label="Seats" value={booking.seats.join(", ")} />
                <InfoItem icon={<QrCode size={14} />} label="Paid" value={formatMoney(booking.amount)} />
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--accent-dark)]"
                  onClick={() => router.push(`/confirmation/${booking.bookingId}`)}
                >
                  View Ticket
                </button>
                <button
                  className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--accent-dark)] hover:bg-[#f2e7da]"
                  onClick={() => router.push(`/events/${booking.eventId}`)}
                >
                  Event Details
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[#FAFAFA] px-3 py-2.5">
      <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-[#71717A]">
        {icon}
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-[var(--accent-dark)]">{value}</p>
    </div>
  );
}
