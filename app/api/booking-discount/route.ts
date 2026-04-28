import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  booking_id: z.number().int().positive(),
  discount_id: z.number().int().positive(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  return NextResponse.json({ data: parsed.data }, { status: 201 });
}
