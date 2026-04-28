"use client";

import dynamic from "next/dynamic";
import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AppNavbar from "@/components/layout/AppNavbar";
import Button from "@/components/ui/Button";

const Ticket3DDynamic = dynamic(() => import("@/components/confirmation/Ticket3D"), { ssr: false });

type ConfirmationPayload = {
  booking: {
    booking_id: number;
    booking_date: string;
  };
  event: {
    event_name: string;
    event_date: string;
  };
  venue: {
    venue_name: string;
    location: string;
  };
  payment: {
    amount: number;
    payment_method: string;
    status: string;
  };
  user: {
    name: string;
    email: string;
    phone: string;
  };
  tickets: Array<{
    ticket_id: number;
    qr_code: string;
    seat_number: string;
  }>;
  seatLabels: string[];
  totalSeats: number;
};

export default function ConfirmationPage({ params }: { params: Promise<{ booking_id: string }> }) {
  const { booking_id } = use(params);
  const bookingId = Number(booking_id);
  const router = useRouter();
  const [payload, setPayload] = useState<ConfirmationPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/confirmation/${bookingId}`, { cache: "no-store" });
        const json = await response.json();

        if (!response.ok) {
          throw new Error(json.error ?? "Failed to load ticket data");
        }

        if (!active) return;
        setPayload(json.data as ConfirmationPayload);
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load ticket data");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    if (!Number.isNaN(bookingId)) {
      load();
    } else {
      setLoading(false);
      setError("Invalid booking id");
    }

    return () => {
      active = false;
    };
  }, [bookingId]);

  const ticketMeta = useMemo(() => {
    if (!payload) return null;

    return {
      bookingId: payload.booking.booking_id,
      guestName: payload.user.name,
      eventName: payload.event.event_name,
      venueName: payload.venue.venue_name,
      venueLocation: payload.venue.location,
      eventDate: payload.event.event_date,
      seats: payload.seatLabels,
      amount: payload.payment.amount,
      paymentMethod: payload.payment.payment_method,
      qrSeed: payload.tickets.map((ticket) => ticket.qr_code).join("|"),
    };
  }, [payload]);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <AppNavbar />

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6 shadow-[0_20px_60px_rgba(46,34,27,0.08)] md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-5">
            <div className="rounded-full bg-white p-3 shadow-[0_0_20px_rgba(22,163,74,0.12)]">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17l-5-5" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">Payment successful</p>
              <h1 className="font-syne text-3xl font-bold text-[var(--accent-dark)]">Your ticket is ready</h1>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                A personalized ticket has been generated for {payload?.user.name ?? "your booking"}.
              </p>
            </div>
          </div>

          <div className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
            {loading ? "Loading ticket..." : error ? "Ticket unavailable" : `Booking #${bookingId}`}
          </div>
        </div>

        {error ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
            <p className="font-semibold">We couldn’t load the ticket details.</p>
            <p className="mt-1 text-sm">{error}</p>
            <Button className="mt-4" onClick={() => router.push("/events")}>Browse events</Button>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[32px] border border-[var(--border)] bg-[var(--bg-secondary)] p-5 shadow-[0_24px_70px_rgba(46,34,27,0.1)]">
              <Ticket3DDynamic
                bookingId={ticketMeta?.bookingId ?? bookingId}
                guestName={ticketMeta?.guestName ?? "Guest"}
                eventName={ticketMeta?.eventName ?? "Event"}
                venueName={ticketMeta?.venueName ?? "Venue"}
                venueLocation={ticketMeta?.venueLocation ?? "Location"}
                eventDate={ticketMeta?.eventDate ?? ""}
                seats={ticketMeta?.seats ?? []}
                amount={ticketMeta?.amount ?? 0}
                paymentMethod={ticketMeta?.paymentMethod ?? "Card"}
                qrSeed={ticketMeta?.qrSeed}
              />
            </div>

            <div className="space-y-6">
              <section className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-[0_18px_40px_rgba(46,34,27,0.06)]">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-muted)]">Booking summary</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <SummaryItem label="Booking ID" value={`BKG-${bookingId}`} />
                  <SummaryItem label="Guest" value={payload?.user.name ?? "Guest"} />
                  <SummaryItem label="Event" value={payload?.event.event_name ?? "Event"} />
                  <SummaryItem label="Venue" value={payload?.venue.venue_name ?? "Venue"} />
                  <SummaryItem label="Seats" value={payload?.seatLabels.join(", ") ?? "-"} />
                  <SummaryItem label="Paid via" value={payload?.payment.payment_method ?? "Card"} />
                </div>
              </section>

              <section className="rounded-3xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6 shadow-[0_18px_40px_rgba(46,34,27,0.05)]">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-muted)]">Receipt</p>
                    <h2 className="mt-1 font-syne text-2xl font-bold text-[var(--accent-dark)]">{payload?.event.event_name ?? "Your event"}</h2>
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                      {payload?.venue.venue_name ?? "Venue"} · {payload?.venue.location ?? "Location"}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#F3E9DE] px-4 py-3 text-right">
                    <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">Total paid</p>
                    <p className="font-syne text-2xl font-bold text-[var(--accent-dark)]">₹{payload?.payment.amount.toLocaleString("en-IN") ?? "0"}</p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Button onClick={() => window.print()}>Download Ticket</Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      const ics = `BEGIN:VCALENDAR\nBEGIN:VEVENT\nSUMMARY:${payload?.event.event_name ?? "Event"}\nDTSTART:${(payload?.event.event_date ?? "20260505").replace(/-/g, "")}\nLOCATION:${payload?.venue.venue_name ?? "Venue"}\nDESCRIPTION:Booking ID: BKG-${bookingId}\nEND:VEVENT\nEND:VCALENDAR`;
                      const blob = new Blob([ics], { type: "text/calendar" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `booking-${bookingId}.ics`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                  >
                    Add to Calendar
                  </Button>
                  <button className="ml-auto text-[var(--accent)] transition hover:text-[var(--accent-strong)]" onClick={() => router.push("/events")}>Browse More Events →</button>
                </div>
              </section>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[#FAF5EF] p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[var(--accent-dark)]">{value}</p>
    </div>
  );
}
