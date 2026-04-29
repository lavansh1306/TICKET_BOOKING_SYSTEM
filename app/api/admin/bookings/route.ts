import { NextResponse } from "next/server";
import { RowDataPacket } from "mysql2/promise";

import { requireAdmin } from "@/lib/auth/admin";
import db from "@/lib/db";

interface BookingRow extends RowDataPacket {
  booking_id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  event_id: number;
  event_name: string;
  event_date: string;
  venue_name: string;
  location: string;
  booking_date: string;
  amount: number | null;
  payment_method: string | null;
  payment_status: string | null;
}

interface SeatRow extends RowDataPacket {
  booking_id: number;
  seat_number: string;
}

export async function GET(request: Request) {
  const admin = await requireAdmin(request.headers);

  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [bookings] = await db.query<BookingRow[]>(
    `SELECT
       b.booking_id,
       b.user_id,
       u.name AS user_name,
       u.email AS user_email,
       b.event_id,
       e.event_name,
       e.event_date,
       v.venue_name,
       v.location,
       b.booking_date,
       p.amount,
       p.payment_method,
       p.status AS payment_status
     FROM Booking b
     JOIN Users u ON u.user_id = b.user_id
     JOIN Event e ON e.event_id = b.event_id
     JOIN Venue v ON v.venue_id = e.venue_id
     LEFT JOIN Payment p ON p.booking_id = b.booking_id
     ORDER BY b.booking_date DESC, b.booking_id DESC`,
  );

  if (bookings.length === 0) {
    return NextResponse.json({ data: [] });
  }

  const bookingIds = bookings.map((booking) => booking.booking_id);
  const placeholders = bookingIds.map(() => "?").join(",");
  const [seatRows] = await db.query<SeatRow[]>(
    `SELECT t.booking_id, s.seat_number
     FROM Ticket t
     JOIN Seat s ON s.seat_id = t.seat_id
     WHERE t.booking_id IN (${placeholders})`,
    bookingIds,
  );

  const seatMap: Record<number, string[]> = {};

  for (const row of seatRows) {
    (seatMap[row.booking_id] ??= []).push(row.seat_number);
  }

  return NextResponse.json({
    data: bookings.map((booking) => ({
      booking_id: booking.booking_id,
      user_id: booking.user_id,
      user_name: booking.user_name,
      user_email: booking.user_email,
      event_id: booking.event_id,
      event_name: booking.event_name,
      event_date: booking.event_date,
      venue_name: booking.venue_name,
      location: booking.location,
      booking_date: booking.booking_date,
      seats: seatMap[booking.booking_id] ?? [],
      amount: booking.amount ?? 0,
      payment_method: booking.payment_method ?? "N/A",
      payment_status: booking.payment_status ?? "Pending",
    })),
  });
}
