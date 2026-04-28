import { NextResponse } from "next/server";
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
      const errors = parsed.error.flatten();
      const errorMessage = Object.values(errors.fieldErrors)[0]?.[0] ?? "Invalid input";
      return NextResponse.json(
        { error: errorMessage },
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

    // TODO: Migrate to bcrypt comparison after database passwords are hashed
    // For now, compare plain-text passwords since DB stores plain text
    const passwordMatches = password === user.password;

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
