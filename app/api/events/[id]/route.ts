import { NextResponse } from "next/server";

import { getEventById } from "@/lib/queries/events";

interface Context {
  params: {
    id: string;
  };
}

export async function GET(_: Request, { params }: Context) {
  const eventId = Number(params.id);

  if (Number.isNaN(eventId)) {
    return NextResponse.json({ error: "Invalid event id" }, { status: 400 });
  }

  const data = await getEventById(eventId);

  if (!data) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  return NextResponse.json({ data });
}
