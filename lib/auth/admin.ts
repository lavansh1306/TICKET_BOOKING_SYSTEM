import { RowDataPacket } from "mysql2/promise";

import db from "@/lib/db";

interface AdminRow extends RowDataPacket {
  admin_id: number;
  name: string;
  email: string;
}

export interface AdminIdentity {
  admin_id: number;
  name: string;
  email: string;
}

export async function getAdminByEmail(email: string) {
  const [rows] = await db.query<AdminRow[]>(
    "SELECT admin_id, name, email FROM `Admin` WHERE email = ? LIMIT 1",
    [email.toLowerCase()],
  );

  const admin = rows[0];

  if (!admin) {
    return null;
  }

  return {
    admin_id: admin.admin_id,
    name: admin.name,
    email: admin.email,
  } satisfies AdminIdentity;
}

export async function requireAdmin(headers: Headers) {
  const email = headers.get("x-admin-email")?.trim().toLowerCase();

  if (!email) {
    return null;
  }

  return getAdminByEmail(email);
}
