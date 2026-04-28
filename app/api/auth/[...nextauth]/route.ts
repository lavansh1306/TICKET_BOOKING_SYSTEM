import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { users } from "@/lib/mock";
import { loginSchema } from "@/lib/validations/auth";

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

        const matched = users.find(
          (user) =>
            user.email.toLowerCase() === parsed.data.email.toLowerCase() &&
            user.password === parsed.data.password,
        );

        if (!matched) {
          return null;
        }

        return {
          id: String(matched.user_id),
          name: matched.name,
          email: matched.email,
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
