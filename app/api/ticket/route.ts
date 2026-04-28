import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  booking_id: z.number().int().positive(),
  seat_id: z.number().int().positive(),
  event_id: z.number().int().positive(),
  qr_code: z.string().min(1),
});

let nextTicketId = 1000;

export async function GET() {
  return NextResponse.json({ data: [] });
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const ticket_id = nextTicketId++;
  return NextResponse.json({ data: { ticket_id, ...parsed.data } }, { status: 201 });
}
