import Link from "next/link";
import { getEvents } from "@/lib/queries/events";
import { formatDate } from "@/lib/utils/formatDate";
import Badge from "@/components/ui/Badge";
import { MapPin, Calendar } from "lucide-react";

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="font-display mb-8 text-3xl font-bold text-[var(--accent-dark)]">All Events</h1>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <Link
            key={event.event_id}
            href={`/events/${event.event_id}`}
            className="group rounded-2xl border border-[var(--border)] bg-white p-5 transition hover:shadow-md"
          >
            {/* Colour banner placeholder */}
            <div
              className="mb-4 h-36 w-full rounded-xl bg-indigo-50"
              style={{
                background: `hsl(${(event.event_id * 60) % 360}, 60%, 92%)`,
              }}
            />

            <Badge variant="category" className="mb-2">
              {event.category?.category_name}
            </Badge>

            <h2 className="font-display mb-2 text-lg font-bold text-[var(--accent-dark)] group-hover:text-[var(--accent-light)]">
              {event.event_name}
            </h2>

            <div className="space-y-1 text-sm text-[var(--text-secondary)]">
              <p className="flex items-center gap-1.5">
                <MapPin size={13} />
                {event.venue?.venue_name}, {event.venue?.location}
              </p>
              <p className="flex items-center gap-1.5">
                <Calendar size={13} />
                {formatDate(event.event_date)}
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm font-semibold text-[var(--accent)]">From ₹150</span>
              <span className="text-xs font-medium text-[var(--accent-light)] group-hover:underline">
                View details →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
