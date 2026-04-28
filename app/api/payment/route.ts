import { NextResponse } from "next/server";
import { ResultSetHeader } from "mysql2/promise";
import db from "@/lib/db";
import { paymentSchema } from "@/lib/validations/payment";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = paymentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { booking_id, amount, payment_method, status } = parsed.data;

  const [result] = await db.query<ResultSetHeader>(
    "INSERT INTO Payment (booking_id, amount, payment_method, status) VALUES (?, ?, ?, ?)",
    [booking_id, amount, payment_method, status]
  );

  return NextResponse.json(
    { data: { payment_id: result.insertId, booking_id, amount, payment_method, status } },
    { status: 201 }
  );
}
