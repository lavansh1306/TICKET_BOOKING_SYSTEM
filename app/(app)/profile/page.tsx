"use client";

import { useEffect, useMemo, useState } from "react";
import { Calendar, CreditCard, MessageSquareText, Star } from "lucide-react";
import { useRouter } from "next/navigation";

import { useUserStore } from "@/lib/store/userStore";

type EventItem = {
  event_id: number;
  event_name: string;
  event_date: string;
  venue?: { venue_name: string; location: string };
};

type ReviewItem = {
  review_id: number;
  user_id: number;
  event_id: number;
  rating: number;
  comment: string;
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function ProfilePage() {
  const router = useRouter();
  const user = useUserStore((s) => s.user);

  const [events, setEvents] = useState<EventItem[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let active = true;

    async function load() {
      try {
        const [eventsRes, reviewsRes] = await Promise.all([
          fetch("/api/events", { cache: "no-store" }),
          fetch("/api/review", { cache: "no-store" }),
        ]);

        const [eventsJson, reviewsJson] = await Promise.all([eventsRes.json(), reviewsRes.json()]);

        if (!active) return;
        setEvents(eventsJson.data ?? []);
        setReviews(reviewsJson.data ?? []);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => { active = false; };
  }, [user]);

  const metrics = useMemo(() => {
    const now = new Date();
    const myReviews = reviews.filter((review) => review.user_id === user?.user_id);
    const myReviewedEventIds = new Set(myReviews.map((review) => review.event_id));
    const myEvents = events.filter((event) => myReviewedEventIds.has(event.event_id));
    const upcoming = myEvents.filter((event) => new Date(event.event_date) >= now).length;
    const avgRating =
      myReviews.length > 0
        ? (myReviews.reduce((sum, review) => sum + review.rating, 0) / myReviews.length).toFixed(1)
        : "0.0";

    const spend = 0; // real spend is shown on the Bookings page

    return {
      attended: myEvents.length,
      upcoming,
      spend,
      reviewsCount: myReviews.length,
      avgRating,
      recentReviews: myReviews.slice(0, 3),
    };
  }, [events, reviews, user?.user_id]);

  if (!user) return null;

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-[var(--border)] bg-white p-6">
        <p className="text-sm font-medium text-[var(--text-secondary)]">Welcome back</p>
        <h1 className="mt-1 font-syne text-3xl font-bold text-[var(--accent-dark)]">{user.name}</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">Manage your tickets, reviews, and account details from here.</p>
      </header>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Events Attended" value={loading ? "..." : String(metrics.attended)} icon={<Calendar size={16} />} />
        <MetricCard label="Upcoming Events" value={loading ? "..." : String(metrics.upcoming)} icon={<CreditCard size={16} />} />
        <MetricCard label="Total Spend" value={loading ? "..." : formatMoney(metrics.spend)} icon={<CreditCard size={16} />} />
        <MetricCard label="Avg. Review Rating" value={loading ? "..." : `${metrics.avgRating}/5`} icon={<Star size={16} />} />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-syne text-xl font-bold text-[var(--accent-dark)]">Recent Reviews</h2>
            <button className="text-sm font-medium text-[var(--accent)] hover:underline" onClick={() => router.push("/profile/reviews")}>
              View all
            </button>
          </div>

          {metrics.recentReviews.length === 0 ? (
            <p className="text-sm text-[var(--text-secondary)]">No reviews yet. Share feedback after attending an event.</p>
          ) : (
            <div className="space-y-3">
              {metrics.recentReviews.map((review) => {
                const event = events.find((item) => item.event_id === review.event_id);
                return (
                  <div key={review.review_id} className="rounded-xl border border-[var(--border)] p-4">
                    <p className="text-sm font-semibold text-[var(--accent-dark)]">{event?.event_name ?? "Event"}</p>
                    <p className="mt-1 text-xs text-[var(--text-secondary)]">Rated {review.rating}/5</p>
                    <p className="mt-2 text-sm text-[#3F3F46]">{review.comment}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
          <h2 className="mb-4 font-syne text-xl font-bold text-[var(--accent-dark)]">Quick Actions</h2>
          <div className="space-y-3">
            <ActionButton
              title="My Bookings"
              subtitle="View upcoming and past tickets"
              icon={<CreditCard size={16} />}
              onClick={() => router.push("/profile/bookings")}
            />
            <ActionButton
              title="Write a Review"
              subtitle="Share your recent event experience"
              icon={<MessageSquareText size={16} />}
              onClick={() => router.push("/profile/reviews")}
            />
            <ActionButton
              title="Update Settings"
              subtitle="Change your profile details"
              icon={<Calendar size={16} />}
              onClick={() => router.push("/profile/settings")}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function MetricCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-4">
      <div className="mb-3 inline-flex rounded-lg bg-[#EEF2FF] p-2 text-[var(--accent)]">{icon}</div>
      <p className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">{label}</p>
      <p className="mt-1 font-syne text-2xl font-bold text-[var(--accent-dark)]">{value}</p>
    </div>
  );
}

function ActionButton({
  title,
  subtitle,
  icon,
  onClick,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-start gap-3 rounded-xl border border-[var(--border)] px-4 py-3 text-left transition hover:border-[var(--accent)]/40 hover:bg-[#FAFAFF]"
    >
      <span className="mt-0.5 inline-flex rounded-md bg-[#EEF2FF] p-2 text-[var(--accent)]">{icon}</span>
      <span>
        <span className="block text-sm font-semibold text-[var(--accent-dark)]">{title}</span>
        <span className="mt-0.5 block text-xs text-[var(--text-secondary)]">{subtitle}</span>
      </span>
    </button>
  );
}
