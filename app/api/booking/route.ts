import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  user_id: z.number().int().positive(),
  event_id: z.number().int().positive(),
  booking_date: z.string(),
});

// Mock auto-increment — in production this comes from DB INSERT
let nextBookingId = 100;

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const booking_id = nextBookingId++;
  return NextResponse.json({ data: { booking_id, ...parsed.data } }, { status: 201 });
}
