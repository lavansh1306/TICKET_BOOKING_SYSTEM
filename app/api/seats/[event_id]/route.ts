import { NextResponse } from "next/server";
import { RowDataPacket } from "mysql2/promise";
import db from "@/lib/db";

interface EventRow extends RowDataPacket { venue_id: number; }
interface SeatRow extends RowDataPacket {
  seat_id: number;
  seat_number: string;
  venue_id: number;
  is_booked: number;
}

interface Context {
  params: Promise<{ event_id: string }>;
}

export async function GET(_: Request, { params }: Context) {
  const { event_id } = await params;
  const eventId = Number(event_id);

  if (Number.isNaN(eventId)) {
    return NextResponse.json({ error: "Invalid event id" }, { status: 400 });
  }

  const [eventRows] = await db.query<EventRow[]>(
    "SELECT venue_id FROM Event WHERE event_id = ? LIMIT 1",
    [eventId]
  );

  if (!eventRows[0]) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const { venue_id } = eventRows[0];

  const [seats] = await db.query<SeatRow[]>(
    `SELECT s.seat_id, s.seat_number, s.venue_id,
       CASE WHEN t.ticket_id IS NOT NULL THEN 1 ELSE 0 END AS is_booked
     FROM Seat s
     LEFT JOIN Ticket t ON t.seat_id = s.seat_id AND t.event_id = ?
     WHERE s.venue_id = ?
     ORDER BY s.seat_number ASC`,
    [eventId, venue_id]
  );

  const data = seats.map((s) => ({
    seat_id: s.seat_id,
    seat_number: s.seat_number,
    venue_id: s.venue_id,
    status: s.is_booked ? "booked" : "available",
  }));

  return NextResponse.json({ data });
}
