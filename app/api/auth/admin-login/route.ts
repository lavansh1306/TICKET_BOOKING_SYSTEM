import { NextResponse } from "next/server";

import { getAdminByEmail } from "@/lib/auth/admin";
import { adminLoginSchema } from "@/lib/validations/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = adminLoginSchema.safeParse(body);

    if (!parsed.success) {
      const errors = parsed.error.flatten();
      const errorMessage = Object.values(errors.fieldErrors)[0]?.[0] ?? "Invalid input";
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 },
      );
    }

    const admin = await getAdminByEmail(parsed.data.email);

    if (!admin) {
      return NextResponse.json(
        { error: "Admin account not found" },
        { status: 401 },
      );
    }

    return NextResponse.json(
      {
        data: {
          user_id: admin.admin_id,
          admin_id: admin.admin_id,
          name: admin.name,
          email: admin.email,
          phone: "",
          role: "admin",
        },
        session: true,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { error: "Unable to login" },
      { status: 500 },
    );
  }
}
