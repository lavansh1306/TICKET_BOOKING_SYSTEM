import { users } from "@/lib/mock";

export async function getUserById(userId: number) {
  return users.find((user) => user.user_id === userId) ?? null;
}

export async function getUserByEmail(email: string) {
  return users.find((user) => user.email.toLowerCase() === email.toLowerCase()) ?? null;
}
