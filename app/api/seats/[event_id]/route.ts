import { NextResponse } from "next/server";
import { events, seats } from "@/lib/mock";

interface Context {
  params: Promise<{ event_id: string }>;
}

export async function GET(_: Request, { params }: Context) {
  const { event_id } = await params;
  const eventId = Number(event_id);

  if (Number.isNaN(eventId)) {
    return NextResponse.json({ error: "Invalid event id" }, { status: 400 });
  }

  const event = events.find((e) => e.event_id === eventId);
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  // Mock: no tickets booked yet — all seats available
  const data = seats
    .filter((s) => s.venue_id === event.venue_id)
    .map((s) => ({ ...s, status: "available" as const }))
    .sort((a, b) => a.seat_number.localeCompare(b.seat_number));

  return NextResponse.json({ data });
}
