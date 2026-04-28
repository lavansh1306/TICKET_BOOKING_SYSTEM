import { NextResponse } from "next/server";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { z } from "zod";
import db from "@/lib/db";

interface TicketRow extends RowDataPacket {
  ticket_id: number;
  booking_id: number;
  seat_id: number;
  event_id: number;
  qr_code: string;
}

const schema = z.object({
  booking_id: z.number().int().positive(),
  seat_id: z.number().int().positive(),
  event_id: z.number().int().positive(),
  qr_code: z.string().min(1),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const bookingId = Number(searchParams.get("booking_id"));

  if (Number.isNaN(bookingId) || bookingId <= 0) {
    return NextResponse.json({ error: "booking_id is required" }, { status: 400 });
  }

  const [rows] = await db.query<TicketRow[]>(
    "SELECT ticket_id, booking_id, seat_id, event_id, qr_code FROM Ticket WHERE booking_id = ?",
    [bookingId]
  );

  return NextResponse.json({ data: rows });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { booking_id, seat_id, event_id, qr_code } = parsed.data;

  const [result] = await db.query<ResultSetHeader>(
    "INSERT INTO Ticket (booking_id, seat_id, event_id, qr_code) VALUES (?, ?, ?, ?)",
    [booking_id, seat_id, event_id, qr_code]
  );

  return NextResponse.json(
    { data: { ticket_id: result.insertId, booking_id, seat_id, event_id, qr_code } },
    { status: 201 }
  );
}
