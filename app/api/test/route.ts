import { NextResponse } from "next/server";

import db from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await db.query(
      "SELECT user_id, name, email, phone FROM `Users` ORDER BY user_id ASC",
    );

    return NextResponse.json({ data: rows });
  } catch (error) {
    console.error("Failed to fetch users from database:", error);

    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}