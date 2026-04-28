"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import CountdownTimer from "@/components/ui/CountdownTimer";
import { useBookingStore } from "@/lib/store/bookingStore";
import { useUserStore } from "@/lib/store/userStore";
import toast from "react-hot-toast";

interface PaymentStepProps {
  eventId: number;
  onSuccess: (bookingId: number) => void;
}

const cardSchema = z.object({
  cardNumber: z
    .string()
    .min(19, "Enter 16 digit card number")
    .regex(/^(?:\d{4} \d{4} \d{4} \d{4})$/, "Invalid format"),
  name: z.string().min(3).regex(/^[A-Za-z ]+$/, "Only letters and spaces"),
  expiry: z.string().regex(/^(0[1-9]|1[0-2])\/(\d{2})$/, "Invalid expiry"),
  cvv: z.string().min(3).max(4).regex(/^\d{3,4}$/, "Invalid CVV"),
});

type CardForm = z.infer<typeof cardSchema>;

export default function PaymentStep({ eventId, onSuccess }: PaymentStepProps) {
  const { selectedSeats, total, appliedDiscount, clearBooking } = useBookingStore();
  const { user } = useUserStore();

  const [activeTab, setActiveTab] = useState<"card" | "bank">("card");
  const [loadingText, setLoadingText] = useState<string | null>(null);
  const [showOTP, setShowOTP] = useState(false);
  const [otpAttempts, setOtpAttempts] = useState(0);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [showBankRedirect, setShowBankRedirect] = useState(false);
  const otpRef = useRef<(HTMLInputElement | null)[]>([]);

  const form = useForm<CardForm>({ resolver: zodResolver(cardSchema) });

  useEffect(() => {
    setOtpAttempts(0);
  }, [activeTab]);

  const maskedPhone = useMemo(() => {
    const ph = user?.phone ?? "";
    const digits = ph.replace(/\D/g, "");
    if (digits.length >= 2) {
      return `+91 XXXXXX${digits.slice(-2)}`;
    }
    return ph;
  }, [user]);

  async function doTransaction(simulateBank?: { bankName: string }) {
    try {
      setLoadingText("Verifying payment details...");
      await new Promise((r) => setTimeout(r, 400));

      if (simulateBank) {
        // show bank redirect overlay
        setShowBankRedirect(true);
        await new Promise((r) => setTimeout(r, 1600));
        setShowBankRedirect(false);
      }

      // show OTP modal
      setShowOTP(true);
    } catch (err) {
      console.error(err);
      toast.error("Payment flow failed");
      setLoadingText(null);
    }
  }

  async function submitBookingFlow() {
    setLoadingText("Confirming your booking...");
    try {
      // STEP A - create booking
      const bRes = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user!.user_id,
          event_id: eventId,
          booking_date: new Date().toISOString().split("T")[0],
        }),
      });
      const bJson = await bRes.json();
      if (!bRes.ok) throw new Error(bJson.error?.message || "Booking failed");
      const bookingId: number = bJson.data.booking_id;

      // STEP B - tickets
      for (const seat of selectedSeats) {
        const tRes = await fetch("/api/ticket", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            booking_id: bookingId,
            seat_id: seat.seat_id,
            event_id: eventId,
            qr_code: `QR-${Date.now()}-${seat.seat_id}-${eventId}`,
          }),
        });
        if (!tRes.ok) {
          const tj = await tRes.json();
          throw new Error(tj.error?.message || "Ticket creation failed");
        }
      }

      // STEP C - payment
      const pRes = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          booking_id: bookingId,
          amount: total,
          payment_method: activeTab === "card" ? "Credit Card" : "Net Banking",
          status: "Completed",
        }),
      });
      if (!pRes.ok) {
        const pj = await pRes.json();
        throw new Error(pj.error?.message || "Payment record failed");
      }

      // STEP D - discount
      if (appliedDiscount) {
        const dRes = await fetch("/api/booking-discount", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ booking_id: bookingId, discount_id: appliedDiscount.discount_id }),
        });
        if (!dRes.ok) throw new Error("Booking discount failed");
      }

      // success
      clearBooking();
      onSuccess(bookingId);
    } catch (err: unknown) {
      console.error(err);
      setLoadingText(null);
      setShowOTP(false);
      // simulate rollback message
      const message = err instanceof Error ? err.message : String(err);
      toast.error(`Payment failed — ${message}`);
    }
  }

  // OTP handling
  function handleOtpSubmit(otp: string) {
    setOtpError(null);
    if (otp === "123456") {
      // correct
      submitBookingFlow();
    } else {
      const attempts = otpAttempts + 1;
      setOtpAttempts(attempts);
      setOtpError(`Incorrect OTP. ${3 - attempts} attempts remaining`);
      if (attempts >= 3) {
        setTimeout(() => {
          setShowOTP(false);
          setOtpAttempts(0);
          setOtpError(null);
          setLoadingText(null);
        }, 400);
      }
    }
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-3">
        <button
          onClick={() => setActiveTab("card")}
          className={activeTab === "card" ? "neu-pressed border-2 border-indigo-600" : "neu-raised"}
        >
          💳 Credit / Debit Card
        </button>
        <button
          onClick={() => setActiveTab("bank")}
          className={activeTab === "bank" ? "neu-pressed border-2 border-indigo-600" : "neu-raised"}
        >
          🏦 Net Banking
        </button>
      </div>

      <div className="rounded-2xl bg-transparent p-4">
        <AnimatePresence mode="wait">
          {activeTab === "card" ? (
            <motion.div key="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex gap-6">
                <div className="relative h-[200px] w-[340px] rounded-lg bg-[#1A1A2E] p-4 text-white">
                  <div className="absolute right-3 top-3 text-xs font-semibold">
                    {form.watch("cardNumber")?.trim().startsWith("4") ? "VISA" : form.watch("cardNumber")?.trim().startsWith("5") ? "MASTERCARD" : ""}
                  </div>
                  <div className="absolute bottom-6 left-4 h-6 w-10 bg-yellow-400" />
                  <div className="absolute inset-0 -z-10 animate-[shimmer_3s_linear_infinite]" />
                  <div className="mt-10 text-sm tracking-widest">
                    {form.watch("cardNumber") ? form.watch("cardNumber").slice(0, -4).replace(/\d/g, "•") + form.watch("cardNumber").slice(-4) : "•••• •••• •••• 1234"}
                  </div>
                  <div className="absolute bottom-4 left-6 text-xs">{form.watch("name") || "CARDHOLDER NAME"}</div>
                </div>

                <div className="flex-1 space-y-3">
                  <Input
                    label="Card Number"
                    placeholder="1234 1234 1234 1234"
                    {...form.register("cardNumber")}
                    maxLength={19}
                    onChange={(e) => {
                      const v = e.currentTarget.value.replace(/[^0-9]/g, "").slice(0, 16);
                      const formatted = v.replace(/(\d{4})/g, "$1 ").trim();
                      form.setValue("cardNumber", formatted, { shouldValidate: true });
                    }}
                  />

                  <Input label="Cardholder Name" placeholder="Full name" {...form.register("name")} />

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Expiry (MM/YY)"
                      placeholder="MM/YY"
                      {...form.register("expiry")}
                      onChange={(e) => {
                        const v = e.currentTarget.value.replace(/[^0-9]/g, "").slice(0, 4);
                        const formatted = v.length > 2 ? `${v.slice(0, 2)}/${v.slice(2)}` : v;
                        form.setValue("expiry", formatted, { shouldValidate: true });
                      }}
                    />
                    <Input label="CVV" placeholder="123" type="password" maxLength={4} {...form.register("cvv")} />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="neu-raised px-3 py-2"> 
                      <input type="checkbox" className="mr-2" /> Save this card for future bookings
                    </label>
                    <div className="text-xs text-[#6B6B6B]">Pay ₹{total.toLocaleString("en-IN")}</div>
                  </div>

                  <Button
                    className="w-full"
                    onClick={async () => {
                      const valid = await form.trigger();
                      if (!valid) return;
                      doTransaction();
                    }}
                  >
                    Pay ₹{total.toLocaleString("en-IN")}
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div key="bank" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="grid grid-cols-4 gap-3">
                {[
                  ["SBI", "State Bank of India"],
                  ["HDFC", "HDFC Bank"],
                  ["ICICI", "ICICI Bank"],
                  ["AXIS", "Axis Bank"],
                  ["KOTAK", "Kotak Mahindra"],
                  ["PNB", "Punjab National Bank"],
                  ["BOB", "Bank of Baroda"],
                  ["CAN", "Canara Bank"],
                ].map(([abbr, name]) => (
                  <button key={abbr} className="neu-raised p-3 text-left" onClick={() => { setActiveTab("bank"); setShowBankRedirect(true); doTransaction({ bankName: String(name) }); }}>
                    <div className="font-bold text-[#1A1A2E]">{abbr}</div>
                    <div className="text-xs text-[#6B6B6B]">{name}</div>
                  </button>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between text-sm text-[#6B6B6B]">
                <div className="flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 1v2" stroke="#6B6B6B" strokeWidth="2"/></svg>
                  <div> You will be redirected to your bank's secure portal to complete this payment.</div>
                </div>
                <Button onClick={() => doTransaction({ bankName: "Selected Bank" })}>Proceed to Bank →</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Security footer */}
      <div className="flex items-center gap-4 text-sm text-[#9B9B9B]">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 1v2" stroke="#9B9B9B" strokeWidth="2"/></svg>
        <div>256-bit SSL Encrypted</div>
        <div className="ml-2">Powered by Razorpay</div>
      </div>

      {/* Bank redirect overlay */}
      <AnimatePresence>
        {showBankRedirect && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-[520px] rounded-2xl bg-white p-6 text-center">
              <h3 className="text-lg font-semibold">Redirecting to bank secure portal...</h3>
              <div className="mt-4 h-3 w-full rounded bg-gray-200">
                <div className="h-full w-full animate-[progress_1.5s_linear_forwards] bg-indigo-600" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* OTP modal */}
      <AnimatePresence>
        {showOTP && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" />
            <div className="relative z-10 w-[420px] rounded-2xl bg-white p-6">
              <h3 className="text-xl font-semibold">Verify Payment</h3>
              <p className="text-sm text-[#6B6B6B]">Enter the OTP sent to {maskedPhone}</p>

              <div className="mt-4 flex gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <input
                    key={i}
                    ref={(el) => (otpRef.current[i] = el)}
                    className="neu-raised h-14 w-12 text-center text-lg"
                    maxLength={1}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace") {
                        otpRef.current[Math.max(0, i - 1)]?.focus();
                      }
                    }}
                    onInput={(e) => {
                      const val = (e.target as HTMLInputElement).value;
                      if (val && i < 5) otpRef.current[i + 1]?.focus();
                      const otp = otpRef.current.map((r) => r?.value || "").join("");
                      if (otp.length === 6) setTimeout(() => handleOtpSubmit(otp), 300);
                    }}
                  />
                ))}
              </div>

              {otpError && <p className="mt-2 text-sm text-red-600">{otpError}</p>}

              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-[#6B6B6B]">
                  <CountdownTimer seconds={30} onComplete={() => {}} />
                  <div className="text-xs text-[#6B6B6B]">(Demo OTP: 123456)</div>
                </div>
                <div className="flex gap-2">
                  <button className="text-sm text-red-600" onClick={() => { setShowOTP(false); setLoadingText(null); }}>Cancel payment</button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
