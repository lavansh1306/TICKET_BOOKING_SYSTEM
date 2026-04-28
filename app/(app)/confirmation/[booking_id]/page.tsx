"use client";

import dynamic from "next/dynamic";
import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppNavbar from "@/components/layout/AppNavbar";
import Button from "@/components/ui/Button";

const Ticket3DDynamic = dynamic(() => import("@/components/confirmation/Ticket3D"), { ssr: false });

export default function ConfirmationPage({ params }: { params: Promise<{ booking_id: string }> }) {
  const { booking_id } = use(params);
  const bookingId = Number(booking_id);
  const router = useRouter();

  // Simple fetch — for demo we rely on API route to return mock data
  useEffect(() => {
    // confetti CSS runs on mount via CSS animation (declared in global styles)
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <AppNavbar />

      <main className="mx-auto max-w-[720px] p-12">
        <div className="flex items-center gap-6">
          <div className="rounded-full bg-white p-2 shadow-[0_0_20px_rgba(22,163,74,0.12)]">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div>
            <h1 className="font-syne text-3xl font-bold text-[#0A0A0A]">Booking Confirmed!</h1>
            <p className="text-sm text-[#6B6B6B]">Your tickets have been sent to your email.</p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6">
          <div className="flex items-start gap-6">
            <Ticket3DDynamic />
            <div className="flex-1">
              <div className="rounded-2xl border border-[#E4E4E7] bg-white p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-sm text-[#6B6B6B]">Booking ID</div>
                  <div className="font-mono text-sm text-[#4F46E5]">BKG-{bookingId}</div>
                </div>

                <div className="mt-4 flex gap-3">
                  <Button onClick={() => window.print()}>Download Ticket</Button>
                  <Button variant="secondary" onClick={() => {
                    const ics = `BEGIN:VCALENDAR\nBEGIN:VEVENT\nSUMMARY:Sample Event\nDTSTART:20260505\nLOCATION:Venue\nDESCRIPTION:Booking ID: BKG-${bookingId}\nEND:VEVENT\nEND:VCALENDAR`;
                    const blob = new Blob([ics], { type: 'text/calendar' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url; a.download = `booking-${bookingId}.ics`; a.click();
                    URL.revokeObjectURL(url);
                  }}>Add to Calendar</Button>
                  <button className="ml-auto text-indigo-600" onClick={() => router.push('/events')}>Browse More Events →</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
