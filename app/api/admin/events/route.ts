import { NextResponse } from "next/server";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";

import { requireAdmin } from "@/lib/auth/admin";
import db from "@/lib/db";
import { adminCreateEventSchema } from "@/lib/validations/admin";

interface EventRow extends RowDataPacket {
  event_id: number;
  event_name: string;
  event_date: string;
  venue_id: number;
  category_id: number;
  organizer_id: number;
  admin_id: number;
}

export async function GET(request: Request) {
  const admin = await requireAdmin(request.headers);

  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [rows] = await db.query<EventRow[]>(
    `SELECT event_id, event_name, event_date, venue_id, category_id, organizer_id, admin_id
     FROM Event
     ORDER BY event_date ASC`,
  );

  return NextResponse.json({ data: rows });
}

export async function POST(request: Request) {
  const admin = await requireAdmin(request.headers);

  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = adminCreateEventSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { event_name, event_date, venue_id, category_id, organizer_id } = parsed.data;

  const [result] = await db.query<ResultSetHeader>(
    `INSERT INTO Event (event_name, event_date, venue_id, category_id, organizer_id, admin_id)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [event_name, event_date, venue_id, category_id, organizer_id, admin.admin_id],
  );

  return NextResponse.json(
    {
      data: {
        event_id: result.insertId,
        event_name,
        event_date,
        venue_id,
        category_id,
        organizer_id,
        admin_id: admin.admin_id,
      },
    },
    { status: 201 },
  );
}
