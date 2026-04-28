import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { z } from "zod";

import db from "@/lib/db";

const signupSchema = z.object({
  name: z.string().trim().min(2, "Name must have at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().trim().min(8, "Enter a valid phone number"),
  password: z.string().min(6, "Password must have at least 6 characters"),
});

interface ExistingUserRow extends RowDataPacket {
  user_id: number;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { name, email, phone, password } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    const [existingRows] = await db.query<ExistingUserRow[]>(
      "SELECT user_id FROM `Users` WHERE email = ? LIMIT 1",
      [normalizedEmail],
    );

    if (existingRows.length > 0) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query<ResultSetHeader>(
      "INSERT INTO `Users` (name, email, phone, password) VALUES (?, ?, ?, ?)",
      [name, normalizedEmail, phone, hashedPassword],
    );

    return NextResponse.json(
      {
        data: {
          user_id: result.insertId,
          name,
          email: normalizedEmail,
          phone,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Unable to create account" },
      { status: 500 },
    );
  }
}
