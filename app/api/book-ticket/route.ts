import { NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { z } from "zod";

import db from "@/lib/db";

const requestSchema = z.object({
  user_id: z.number().int().positive(),
  event_id: z.number().int().positive(),
  seat_ids: z.array(z.number().int().positive()).min(1, "Select at least one seat"),
  amount: z.number().positive(),
  payment_method: z.string().trim().min(2),
  booking_date: z.string().trim().optional(),
});

type ExistingTicketRow = RowDataPacket & {
  ticket_id: number;
  booking_id: number;
  seat_id: number;
  event_id: number;
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { user_id, event_id, seat_ids, amount, payment_method } = parsed.data;
  const booking_date = parsed.data.booking_date ?? new Date().toISOString().slice(0, 10);
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    for (const seat_id of seat_ids) {
      const [existingTickets] = await connection.execute<ExistingTicketRow[]>(
        "SELECT ticket_id, booking_id, seat_id, event_id FROM Ticket WHERE event_id = ? AND seat_id = ? LIMIT 1 FOR UPDATE",
        [event_id, seat_id],
      );

      if (existingTickets.length > 0) {
        throw new Error(`Seat ${seat_id} is already booked`);
      }
    }

    const [bookingResult] = await connection.execute<ResultSetHeader>(
      "INSERT INTO Booking (user_id, event_id, booking_date) VALUES (?, ?, ?)",
      [user_id, event_id, booking_date],
    );

    const bookingId = bookingResult.insertId;

    const ticketIds: number[] = [];
    for (const seat_id of seat_ids) {
      const qr_code = `QR_${bookingId}_${seat_id}`;
      const [ticketResult] = await connection.execute<ResultSetHeader>(
        "INSERT INTO Ticket (booking_id, seat_id, event_id, qr_code) VALUES (?, ?, ?, ?)",
        [bookingId, seat_id, event_id, qr_code],
      );

      ticketIds.push(ticketResult.insertId);
    }

    const [paymentResult] = await connection.execute<ResultSetHeader>(
      "INSERT INTO Payment (booking_id, amount, payment_method, status) VALUES (?, ?, ?, ?)",
      [bookingId, amount, payment_method, "Completed"],
    );

    await connection.commit();

    return NextResponse.json(
      {
        data: {
          booking_id: bookingId,
          ticket_ids: ticketIds,
          payment_id: paymentResult.insertId,
          seat_ids,
          amount,
          payment_method,
          booking_date,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    await connection.rollback();

    const message = error instanceof Error ? error.message : "Failed to create booking";

    return NextResponse.json({ error: message }, { status: 400 });
  } finally {
    connection.release();
  }
}