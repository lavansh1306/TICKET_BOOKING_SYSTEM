"use client";

// Full implementation built in PROMPT 7
// This placeholder keeps the booking page compilable

interface PaymentStepProps {
  eventId: number;
}

export default function PaymentStep({ eventId: _ }: PaymentStepProps) {
  return (
    <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-[#E4E4E7] p-8 text-sm text-[#9B9B9B]">
      Payment step — implemented in PROMPT 7
    </div>
  );
}
