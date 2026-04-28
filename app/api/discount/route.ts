import { NextResponse } from "next/server";
import { discounts } from "@/lib/mock";

export async function GET() {
  return NextResponse.json({ data: discounts });
}

export async function POST(req: Request) {
  try {
    const { code } = await req.json();
    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }

    const discount = discounts.find(
      (d) =>
        d.code.toLowerCase() === code.trim().toLowerCase() &&
        new Date(d.expiry_date).getTime() >= Date.now(),
    );

    if (!discount) {
      return NextResponse.json({ error: "Invalid or expired code" }, { status: 404 });
    }

    return NextResponse.json({ data: discount });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
