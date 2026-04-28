import { NextResponse } from "next/server";
import { ResultSetHeader } from "mysql2/promise";
import { z } from "zod";
import db from "@/lib/db";

const schema = z.object({
  user_id: z.number().int().positive(),
  event_id: z.number().int().positive(),
  booking_date: z.string().optional(),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { user_id, event_id } = parsed.data;
  const booking_date = parsed.data.booking_date ?? new Date().toISOString().slice(0, 10);

  const [result] = await db.query<ResultSetHeader>(
    "INSERT INTO Booking (user_id, event_id, booking_date) VALUES (?, ?, ?)",
    [user_id, event_id, booking_date]
  );

  return NextResponse.json(
    { data: { booking_id: result.insertId, user_id, event_id, booking_date } },
    { status: 201 }
  );
}
