import { NextResponse } from "next/server";

import { getEvents } from "@/lib/queries/events";

export async function GET() {
  const data = await getEvents();
  return NextResponse.json({ data });
}
