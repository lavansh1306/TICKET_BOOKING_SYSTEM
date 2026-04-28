import { NextResponse } from "next/server";
import { paymentSchema } from "@/lib/validations/payment";

let nextPaymentId = 500;

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = paymentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const payment_id = nextPaymentId++;
  return NextResponse.json({ data: { payment_id, ...parsed.data } }, { status: 201 });
}
