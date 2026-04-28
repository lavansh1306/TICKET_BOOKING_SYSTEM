import { NextResponse } from "next/server";
import { ResultSetHeader } from "mysql2/promise";
import { z } from "zod";
import db from "@/lib/db";

const schema = z.object({
  booking_id: z.number().int().positive(),
  discount_id: z.number().int().positive(),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { booking_id, discount_id } = parsed.data;

  await db.query<ResultSetHeader>(
    "INSERT IGNORE INTO Booking_Discount (booking_id, discount_id) VALUES (?, ?)",
    [booking_id, discount_id]
  );

  return NextResponse.json({ data: { booking_id, discount_id } }, { status: 201 });
}
