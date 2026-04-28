"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Check, X, Trash2, ChevronLeft, Tag, Mail, Phone } from "lucide-react";
import toast from "react-hot-toast";
import { useBookingStore, getSeatPrice, calcPricing, CONVENIENCE_FEE } from "@/lib/store/bookingStore";
import { useUserStore } from "@/lib/store/userStore";
import { useBookingFlow } from "@/lib/hooks/useBookingFlow";
import StepIndicator from "@/components/ui/StepIndicator";
import CountdownTimer from "@/components/ui/CountdownTimer";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import PaymentStep from "@/components/payment/PaymentStep";
import { formatDate } from "@/lib/utils/formatDate";
import { cn } from "@/lib/utils/cn";
import type { Seat, Discount } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface EventSummary {
  event_id: number;
  event_name: string;
  event_date: string;
  venue?: { venue_name: string; location: string };
  category?: { category_name: string };
}

// ─── Seat row prefix grouping ─────────────────────────────────────────────────

function groupByRow(seats: Seat[]): Record<string, Seat[]> {
  return seats.reduce<Record<string, Seat[]>>((acc, seat) => {
    const row = seat.seat_number[0].toUpperCase();
    (acc[row] ??= []).push(seat);
    return acc;
  }, {});
}

// ─── Price breakdown helper ───────────────────────────────────────────────────

function PriceBreakdown({
  seats,
  discount,
  compact = false,
}: {
  seats: Seat[];
  discount: Discount | null;
  compact?: boolean;
}) {
  const { subtotal, convFee, gst, discountAmt, total } = calcPricing(seats, discount);
  const row = (label: string, value: string, bold = false) => (
    <div className={cn("flex justify-between text-sm", bold ? "font-bold text-[#0A0A0A]" : "text-[#6B6B6B]")}>
      <span>{label}</span>
      <span>₹{value}</span>
    </div>
  );

  return (
    <div className="space-y-1.5">
      {row("Subtotal", subtotal.toLocaleString("en-IN"))}
      {!compact && row(`Convenience fee (₹${CONVENIENCE_FEE} × ${seats.length})`, convFee.toLocaleString("en-IN"))}
      {!compact && row(`GST (18%)`, gst.toFixed(2))}
      {discount && discountAmt > 0 && (
        <div className="flex justify-between text-sm font-medium text-green-600">
          <span>{discount.code} ({discount.percentage}% off)</span>
          <span>−₹{discountAmt.toLocaleString("en-IN")}</span>
        </div>
      )}
      <div className="border-t border-[#E4E4E7] pt-1.5">
        {row("Total", total.toLocaleString("en-IN"), true)}
      </div>
    </div>
  );
}

// ─── Step 1: Seat Selection ───────────────────────────────────────────────────

function SeatStep({ event }: { event: EventSummary }) {
  const { selectedSeats, setSeats, appliedDiscount } = useBookingStore();
  const { nextStep } = useBookingFlow();

  const [seats, setAvailableSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [expired, setExpired] = useState(false);
  const [timerKey, setTimerKey] = useState(0);

  useEffect(() => {
    fetch(`/api/seats/${event.event_id}`)
      .then((r) => r.json())
      .then((json) => setAvailableSeats(json.data ?? []))
      .finally(() => setLoading(false));
  }, [event.event_id]);

  function toggleSeat(seat: Seat) {
    const isSelected = selectedSeats.some((s) => s.seat_id === seat.seat_id);
    if (isSelected) {
      setSeats(selectedSeats.filter((s) => s.seat_id !== seat.seat_id));
    } else {
      if (selectedSeats.length >= 6) {
        toast.error("Maximum 6 seats per booking");
        return;
      }
      setSeats([...selectedSeats, { ...seat, status: "selected" }]);
    }
  }

  function handleExpire() {
    setExpired(true);
    setSeats([]);
  }

  function handleReselect() {
    setExpired(false);
    setTimerKey((k) => k + 1);
  }

  const grouped = groupByRow(seats);
  const rows = Object.keys(grouped).sort();

  return (
    <>
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* ── Seat map ── */}
        <div className="min-w-0 flex-1">
          {/* Countdown */}
          <div className="mb-4 flex items-center gap-3 rounded-xl border border-[#E4E4E7] px-4 py-3">
            <span className="text-sm text-[#6B6B6B]">Seats held for you:</span>
            <CountdownTimer key={timerKey} seconds={600} onExpire={handleExpire} />
          </div>

          {/* Screen arc */}
          <div className="mb-6 text-center">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-[#9B9B9B]">
              Screen this side
            </p>
            <svg viewBox="0 0 320 24" className="mx-auto w-full max-w-sm" fill="none">
              <path
                d="M10 20 Q160 2 310 20"
                stroke="#D1D9E6"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Seat grid */}
          {loading ? (
            <div className="flex h-40 items-center justify-center text-sm text-[#9B9B9B]">
              Loading seats…
            </div>
          ) : (
            <div className="overflow-auto touch-manipulation">
              <div className="inline-block min-w-full space-y-2 pb-4">
                {rows.map((row) => (
                  <div key={row} className="flex items-center gap-2">
                    <span className="w-5 shrink-0 text-center text-[13px] font-semibold text-[#6B6B6B]">
                      {row}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {grouped[row].map((seat) => {
                        const isSelected = selectedSeats.some((s) => s.seat_id === seat.seat_id);
                        const isBooked = seat.status === "booked";

                        return (
                          <SeatButton
                            key={seat.seat_id}
                            seat={seat}
                            isSelected={isSelected}
                            isBooked={isBooked}
                            onToggle={() => !isBooked && toggleSeat(seat)}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="mt-6 flex flex-wrap gap-4">
            {[
              { label: "Available", cls: "neu-raised bg-[#F5F5F7]" },
              { label: "Selected", cls: "neu-pressed bg-[#EEF2FF] border border-[#4F46E5]" },
              { label: "Booked", cls: "bg-[#EEEEEE] cursor-not-allowed" },
            ].map(({ label, cls }) => (
              <div key={label} className="flex items-center gap-2 text-sm text-[#6B6B6B]">
                <span className={cn("h-5 w-5 rounded-[4px]", cls)} />
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* ── Booking summary panel ── */}
        <aside className="w-full lg:w-[320px] lg:shrink-0">
          <div className="sticky top-24 rounded-2xl border border-[#E4E4E7] p-5">
            <p className="mb-0.5 text-base font-semibold text-[#0A0A0A]">{event.event_name}</p>
            <p className="mb-4 text-[13px] text-[#6B6B6B]">
              {event.venue?.venue_name} · {formatDate(event.event_date)}
            </p>

            {selectedSeats.length === 0 ? (
              <p className="mb-4 text-sm text-[#9B9B9B]">No seats selected yet.</p>
            ) : (
              <div className="mb-4 space-y-1.5">
                {selectedSeats.map((s) => (
                  <div key={s.seat_id} className="flex items-center justify-between text-sm">
                    <span className="font-medium text-[#0A0A0A]">Seat {s.seat_number}</span>
                    <div className="flex items-center gap-2 text-[#6B6B6B]">
                      <span>₹{getSeatPrice(s.seat_number).toLocaleString("en-IN")}</span>
                      <button
                        onClick={() => setSeats(selectedSeats.filter((x) => x.seat_id !== s.seat_id))}
                        className="text-[#9B9B9B] hover:text-red-500"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedSeats.length > 0 && (
              <div className="mb-5 border-t border-[#E4E4E7] pt-4">
                <PriceBreakdown seats={selectedSeats} discount={appliedDiscount} />
              </div>
            )}

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              disabled={selectedSeats.length === 0}
              onClick={nextStep}
            >
              Continue to Review
            </Button>
          </div>
        </aside>
      </div>

      {/* Expired modal */}
      <Modal isOpen={expired} onClose={() => {}} title="Session Expired">
        <p className="mb-5 text-sm text-[#6B6B6B]">
          Your seat hold has expired. Please reselect your seats.
        </p>
        <Button variant="primary" size="md" className="w-full" onClick={handleReselect}>
          Reselect Seats
        </Button>
      </Modal>
    </>
  );
}

// ─── Seat button with GSAP-style spring via Framer ───────────────────────────

function SeatButton({
  seat,
  isSelected,
  isBooked,
  onToggle,
}: {
  seat: Seat;
  isSelected: boolean;
  isBooked: boolean;
  onToggle: () => void;
}) {
  const [animate, setAnimate] = useState(false);

  function handleClick() {
    if (isBooked) return;
    if (!isSelected) {
      setAnimate(true);
      setTimeout(() => setAnimate(false), 350);
    }
    onToggle();
  }

  return (
    <motion.button
      title={`Seat ${seat.seat_number}`}
      onClick={handleClick}
      animate={animate ? { scale: [1, 0.85, 1.1, 1] } : {}}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "relative flex h-8 w-8 items-center justify-center rounded-[6px] text-[8px] transition-colors",
        isBooked
          ? "cursor-not-allowed bg-[#EEEEEE] text-[#9B9B9B]"
          : isSelected
          ? "neu-pressed border border-[#4F46E5] bg-[#EEF2FF] text-[#4F46E5]"
          : "neu-raised bg-[#F5F5F7] text-[#6B6B6B] hover:bg-[#EAEEF2]",
      )}
    >
      {isBooked ? <X size={8} /> : isSelected ? <Check size={8} /> : null}
    </motion.button>
  );
}

// ─── Step 2: Review Order ─────────────────────────────────────────────────────

function ReviewStep({ event }: { event: EventSummary }) {
  const { user } = useUserStore();
  const { selectedSeats, appliedDiscount, applyDiscount } = useBookingStore();
  const { nextStep, prevStep } = useBookingFlow();

  const [code, setCode] = useState("");
  const [discountError, setDiscountError] = useState("");
  const [applying, setApplying] = useState(false);

  async function handleApplyDiscount() {
    if (!code.trim()) return;
    setApplying(true);
    setDiscountError("");
    try {
      const res = await fetch("/api/discount", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      const json = await res.json();
      if (!res.ok) {
        setDiscountError(json.error ?? "Invalid or expired code");
        applyDiscount(null);
      } else {
        applyDiscount(json.data);
        toast.success(`${json.data.code} applied — ${json.data.percentage}% off!`);
      }
    } finally {
      setApplying(false);
    }
  }

  const { subtotal, convFee, gst, discountAmt, total } = calcPricing(selectedSeats, appliedDiscount);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Order table */}
      <div className="rounded-2xl border border-[#E4E4E7] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#F5F5F7]">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-[#0A0A0A]">Seat</th>
              <th className="px-4 py-3 text-left font-semibold text-[#0A0A0A]">Category</th>
              <th className="px-4 py-3 text-right font-semibold text-[#0A0A0A]">Price</th>
            </tr>
          </thead>
          <tbody>
            {selectedSeats.map((s) => (
              <tr key={s.seat_id} className="border-t border-[#E4E4E7]">
                <td className="px-4 py-3 text-[#0A0A0A]">Seat {s.seat_number}</td>
                <td className="px-4 py-3 text-[#6B6B6B]">{event.category?.category_name}</td>
                <td className="px-4 py-3 text-right text-[#0A0A0A]">
                  ₹{getSeatPrice(s.seat_number).toLocaleString("en-IN")}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t-2 border-[#E4E4E7] bg-[#F5F5F7]">
            <tr>
              <td colSpan={2} className="px-4 py-2 text-[#6B6B6B]">Subtotal</td>
              <td className="px-4 py-2 text-right text-[#0A0A0A]">₹{subtotal.toLocaleString("en-IN")}</td>
            </tr>
            <tr>
              <td colSpan={2} className="px-4 py-2 text-[#6B6B6B]">
                Convenience fee (₹{CONVENIENCE_FEE} × {selectedSeats.length})
              </td>
              <td className="px-4 py-2 text-right text-[#0A0A0A]">₹{convFee.toLocaleString("en-IN")}</td>
            </tr>
            <tr>
              <td colSpan={2} className="px-4 py-2 text-[#6B6B6B]">GST (18%)</td>
              <td className="px-4 py-2 text-right text-[#0A0A0A]">₹{gst.toFixed(2)}</td>
            </tr>
            {appliedDiscount && discountAmt > 0 && (
              <tr>
                <td colSpan={2} className="px-4 py-2 font-medium text-green-600">
                  {appliedDiscount.code} ({appliedDiscount.percentage}% off)
                </td>
                <td className="px-4 py-2 text-right font-medium text-green-600">
                  −₹{discountAmt.toLocaleString("en-IN")}
                </td>
              </tr>
            )}
            <tr className="border-t border-[#E4E4E7]">
              <td colSpan={2} className="px-4 py-3 text-base font-bold text-[#0A0A0A]">Total</td>
              <td className="px-4 py-3 text-right text-base font-bold text-[#0A0A0A]">
                ₹{total.toLocaleString("en-IN")}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Discount code */}
      <div className="rounded-2xl border border-[#E4E4E7] p-5">
        <p className="mb-3 text-sm font-semibold text-[#0A0A0A]">Have a promo code?</p>
        {appliedDiscount ? (
          <div className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-2.5 text-sm font-medium text-green-700">
            <Check size={15} />
            {appliedDiscount.code} applied — {appliedDiscount.percentage}% off ✓
            <button
              className="ml-auto text-green-500 hover:text-green-700"
              onClick={() => { applyDiscount(null); setCode(""); }}
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Input
              placeholder="Enter promo code"
              value={code}
              onChange={(e) => { setCode(e.target.value.toUpperCase()); setDiscountError(""); }}
              leadingIcon={<Tag size={14} />}
              error={discountError}
              className="uppercase"
            />
            <Button
              variant="primary"
              size="md"
              loading={applying}
              onClick={handleApplyDiscount}
              className="shrink-0"
            >
              Apply
            </Button>
          </div>
        )}
      </div>

      {/* Contact details */}
      <div className="rounded-2xl border border-[#E4E4E7] p-5">
        <p className="mb-3 text-sm font-semibold text-[#0A0A0A]">Ticket details will be sent to:</p>
        <div className="space-y-3">
          <Input
            label="Email"
            value={user?.email ?? ""}
            readOnly
            disabled
            leadingIcon={<Mail size={14} />}
          />
          <Input
            label="Phone"
            value={user?.phone ?? ""}
            readOnly
            disabled
            leadingIcon={<Phone size={14} />}
          />
        </div>
        <a href="/profile/settings" className="mt-2 inline-block text-xs text-[#4F46E5] hover:underline">
          Update in settings
        </a>
      </div>

      <div className="flex flex-col gap-3">
        <Button variant="primary" size="lg" className="w-full" onClick={nextStep}>
          Proceed to Payment
        </Button>
        <button
          onClick={prevStep}
          className="flex items-center justify-center gap-1 text-sm font-medium text-[#6B6B6B] hover:text-[#0A0A0A]"
        >
          <ChevronLeft size={15} /> Back to Seat Selection
        </button>
      </div>
    </div>
  );
}

// ─── Main booking client ──────────────────────────────────────────────────────

const STEP_LABELS = ["Seats", "Review", "Payment"];

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

export default function BookingClient({ event }: { event: EventSummary }) {
  const { currentStep } = useBookingFlow();
  const router = useRouter();
  const prevStepRef = useRef(currentStep);
  const dir = currentStep > prevStepRef.current ? 1 : -1;

  useEffect(() => {
    prevStepRef.current = currentStep;
  }, [currentStep]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display mb-6 text-2xl font-bold text-[#0A0A0A]">
          {event.event_name}
        </h1>
        <div className="flex items-center gap-4">
          <StepIndicator currentStep={currentStep} totalSteps={3} />
          <div className="flex gap-6">
            {STEP_LABELS.map((label, i) => (
              <span
                key={label}
                className={cn(
                  "text-sm",
                  i + 1 === currentStep
                    ? "font-semibold text-[#0A0A0A]"
                    : i + 1 < currentStep
                    ? "text-[#4F46E5]"
                    : "text-[#9B9B9B]",
                )}
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait" custom={dir}>
        <motion.div
          key={currentStep}
          custom={dir}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.25, ease: "easeInOut" }}
        >
          {currentStep === 1 && <SeatStep event={event} />}
          {currentStep === 2 && <ReviewStep event={event} />}
          {currentStep === 3 && (
            <PaymentStep
              eventId={event.event_id}
              onSuccess={(bookingId) => router.push(`/confirmation/${bookingId}`)}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
