import { NextResponse } from "next/server";
import { events, users } from "@/lib/mock";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  // Build a mock response using existing mock arrays
  const booking = {
    booking_id: id,
    booking_date: new Date().toISOString().split("T")[0],
    event_id: 2,
    user_id: 1,
  };

  const event = events.find((e) => e.event_id === booking.event_id)!;
  const user = users.find((u) => u.user_id === booking.user_id)!;

  // Tickets: generate a couple of mock tickets
  const tickets = [
    { ticket_id: 1001, qr_code: `QR-${id}-1`, seat_number: "A1" },
    { ticket_id: 1002, qr_code: `QR-${id}-2`, seat_number: "A2" },
  ];

  const payload = {
    booking: {
      booking_id: booking.booking_id,
      booking_date: booking.booking_date,
    },
    event: {
      event_name: event.event_name,
      event_date: event.event_date,
    },
    venue: {
      venue_name: "Sample Venue",
      location: "City",
    },
    payment: {
      amount: 1200,
      payment_method: "Credit Card",
      status: "Completed",
    },
    user: {
      name: user.name,
      email: user.email,
      phone: user.phone,
    },
    tickets,
  };

  return NextResponse.json({ data: payload }, { status: 200 });
}
