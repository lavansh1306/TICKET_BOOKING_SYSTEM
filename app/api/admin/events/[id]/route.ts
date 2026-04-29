import { NextResponse } from "next/server";
import { ResultSetHeader } from "mysql2/promise";

import { requireAdmin } from "@/lib/auth/admin";
import db from "@/lib/db";

interface Context {
  params: Promise<{ id: string }>;
}

export async function DELETE(request: Request, { params }: Context) {
  const admin = await requireAdmin(request.headers);

  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const eventId = Number(id);

  if (!Number.isInteger(eventId) || eventId <= 0) {
    return NextResponse.json({ error: "Invalid event id" }, { status: 400 });
  }

  try {
    const [result] = await db.query<ResultSetHeader>(
      "DELETE FROM Event WHERE event_id = ?",
      [eventId],
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ data: { event_id: eventId, deleted: true } });
  } catch (error) {
    console.error("Delete event error:", error);
    return NextResponse.json(
      { error: "Event cannot be deleted because linked bookings exist" },
      { status: 409 },
    );
  }
}
