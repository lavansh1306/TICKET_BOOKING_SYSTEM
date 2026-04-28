import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { RowDataPacket } from "mysql2/promise";

import db from "@/lib/db";
import { loginSchema } from "@/lib/validations/auth";

interface UserRow extends RowDataPacket {
  user_id: number;
  name: string;
  email: string;
  phone: string;
  password: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { email, password } = parsed.data;

    const [rows] = await db.query<UserRow[]>(
      "SELECT user_id, name, email, phone, password FROM `Users` WHERE email = ? LIMIT 1",
      [email.toLowerCase()],
    );

    const user = rows[0];

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    return NextResponse.json(
      {
        data: {
          user_id: user.user_id,
          name: user.name,
          email: user.email,
          phone: user.phone,
        },
        session: true,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Unable to login" },
      { status: 500 },
    );
  }
}
