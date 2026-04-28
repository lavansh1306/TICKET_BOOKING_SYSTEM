import bcrypt from "bcrypt";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
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

const auth = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const [rows] = await db.query<UserRow[]>(
          "SELECT user_id, name, email, phone, password FROM `Users` WHERE email = ? LIMIT 1",
          [parsed.data.email.toLowerCase()],
        );

        const user = rows[0];

        if (!user) {
          return null;
        }

        const passwordMatches = await bcrypt.compare(parsed.data.password, user.password);

        if (!passwordMatches) {
          return null;
        }

        return {
          id: String(user.user_id),
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export const { GET, POST } = auth.handlers;
