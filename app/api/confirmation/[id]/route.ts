import { NextResponse } from "next/server";
import { events, users, venues } from "@/lib/mock";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);

  if (Number.isNaN(id) || id <= 0) {
    return NextResponse.json({ error: "Invalid booking id" }, { status: 400 });
  }

  // Build a richer mock response that varies with the booking id.
  const user = users[(id - 1) % users.length];
  const event = events[(id - 1) % events.length];
  const venue = venues.find((item) => item.venue_id === event.venue_id)!;

  const seatCount = 2 + ((id - 1) % 3);
  const row = String.fromCharCode(65 + ((id - 1) % 5));
  const seats = Array.from({ length: seatCount }, (_, index) => `${row}${((id + index) % 9) + 1}`);

  const bookingDate = new Date();
  bookingDate.setDate(bookingDate.getDate() - ((id - 1) % 4));

  const amount = seatCount * 799 + 118;
  const paymentMethods = ["Credit Card", "UPI", "Net Banking", "Wallet"];

  const booking = {
    booking_id: id,
    booking_date: bookingDate.toISOString().split("T")[0],
    event_id: event.event_id,
    user_id: user.user_id,
  };

  const tickets = seats.map((seatNumber, index) => ({
    ticket_id: id * 100 + index + 1,
    qr_code: `QR-${id}-${user.user_id}-${seatNumber}`,
    seat_number: seatNumber,
  }));

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
      venue_name: venue.venue_name,
      location: venue.location,
    },
    payment: {
      amount,
      payment_method: paymentMethods[(id - 1) % paymentMethods.length],
      status: "Completed",
    },
    user: {
      name: user.name,
      email: user.email,
      phone: user.phone,
    },
    tickets,
    seatLabels: seats,
    totalSeats: seatCount,
  };

  return NextResponse.json({ data: payload }, { status: 200 });
}
