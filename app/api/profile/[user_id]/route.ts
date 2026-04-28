import { NextResponse } from "next/server";

import { getUserById } from "@/lib/queries/user";

interface Context {
  params: {
    user_id: string;
  };
}

export async function GET(_: Request, { params }: Context) {
  const userId = Number(params.user_id);

  if (Number.isNaN(userId)) {
    return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
  }

  const data = await getUserById(userId);

  if (!data) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ data });
}
