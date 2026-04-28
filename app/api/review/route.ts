import { NextResponse } from "next/server";
import { z } from "zod";
import { reviews } from "@/lib/mock";

const reviewSchema = z.object({
  user_id: z.number().int().positive(),
  event_id: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(1).max(255),
});

export async function GET() {
  return NextResponse.json({ data: reviews });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = reviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const newReview = {
      review_id: reviews.length + 1,
      ...parsed.data,
    };

    // In production this would INSERT into DB; mock just returns the new review
    return NextResponse.json({ data: newReview }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
