"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import { useUserStore } from "@/lib/store/userStore";

type Option = {
  id: number;
  label: string;
};

type ManagedEvent = {
  event_id: number;
  event_name: string;
  event_date: string;
  venue_id: number;
  category_id: number;
  organizer_id: number;
  admin_id: number;
};

type AdminBooking = {
  booking_id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  event_id: number;
  event_name: string;
  event_date: string;
  venue_name: string;
  location: string;
  booking_date: string;
  seats: string[];
  amount: number;
  payment_method: string;
  payment_status: string;
};

export default function AdminPage() {
  const user = useUserStore((state) => state.user);

  const [events, setEvents] = useState<ManagedEvent[]>([]);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [venues, setVenues] = useState<Option[]>([]);
  const [categories, setCategories] = useState<Option[]>([]);
  const [organizers, setOrganizers] = useState<Option[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [venueId, setVenueId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [organizerId, setOrganizerId] = useState("");

  const adminEmail = user?.email ?? "";

  async function fetchDashboardData() {
    if (!adminEmail) {
      return;
    }

    setError("");
    setLoading(true);

    try {
      const headers = { "x-admin-email": adminEmail };
      const [eventsRes, bookingsRes, lookupsRes] = await Promise.all([
        fetch("/api/admin/events", { headers, cache: "no-store" }),
        fetch("/api/admin/bookings", { headers, cache: "no-store" }),
        fetch("/api/admin/lookups", { headers, cache: "no-store" }),
      ]);

      if (!eventsRes.ok || !bookingsRes.ok || !lookupsRes.ok) {
        setError("Unable to load admin dashboard data");
        return;
      }

      const eventsJson = await eventsRes.json();
      const bookingsJson = await bookingsRes.json();
      const lookupsJson = await lookupsRes.json();

      setEvents(eventsJson.data ?? []);
      setBookings(bookingsJson.data ?? []);

      setVenues((lookupsJson.data?.venues ?? []).map((item: { venue_id: number; venue_name: string }) => ({
        id: item.venue_id,
        label: item.venue_name,
      })));
      setCategories((lookupsJson.data?.categories ?? []).map((item: { category_id: number; category_name: string }) => ({
        id: item.category_id,
        label: item.category_name,
      })));
      setOrganizers((lookupsJson.data?.organizers ?? []).map((item: { organizer_id: number; name: string }) => ({
        id: item.organizer_id,
        label: item.name,
      })));
    } catch {
      setError("Network error while loading admin dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminEmail]);

  async function handleCreateEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!adminEmail) {
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/admin/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-email": adminEmail,
        },
        body: JSON.stringify({
          event_name: eventName,
          event_date: eventDate,
          venue_id: Number(venueId),
          category_id: Number(categoryId),
          organizer_id: Number(organizerId),
        }),
      });

      const json = await response.json();

      if (!response.ok) {
        setError(json.error?.formErrors?.[0] ?? json.error ?? "Unable to create event");
        return;
      }

      setEventName("");
      setEventDate("");
      setVenueId("");
      setCategoryId("");
      setOrganizerId("");

      await fetchDashboardData();
    } catch {
      setError("Network error while creating event");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteEvent(eventId: number) {
    if (!adminEmail) {
      return;
    }

    const confirmed = window.confirm("Delete this event? This fails if bookings exist.");

    if (!confirmed) {
      return;
    }

    setError("");

    try {
      const response = await fetch(`/api/admin/events/${eventId}`, {
        method: "DELETE",
        headers: { "x-admin-email": adminEmail },
      });

      const json = await response.json();

      if (!response.ok) {
        setError(json.error ?? "Unable to delete event");
        return;
      }

      await fetchDashboardData();
    } catch {
      setError("Network error while deleting event");
    }
  }

  const bookingRevenue = useMemo(
    () => bookings.reduce((total, booking) => total + Number(booking.amount ?? 0), 0),
    [bookings],
  );

  if (loading) {
    return <div className="rounded-2xl border border-[var(--border)] bg-white p-6 text-sm">Loading admin dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-[var(--border)] bg-white p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--accent)]">Admin Console</p>
        <h1 className="mt-2 font-syne text-3xl font-bold text-[var(--accent-dark)]">Manage events and bookings</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Add new events, delete events, and monitor every booking from one place.
        </p>
      </header>

      {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard label="Total Events" value={String(events.length)} />
        <MetricCard label="Total Bookings" value={String(bookings.length)} />
        <MetricCard
          label="Revenue"
          value={new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(
            bookingRevenue,
          )}
        />
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-white p-6">
        <h2 className="font-syne text-2xl font-bold text-[var(--accent-dark)]">Add new event</h2>

        <form className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={handleCreateEvent}>
          <Field label="Event name">
            <input
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] px-3 py-2.5 text-sm"
              placeholder="Summer Music Night"
              required
            />
          </Field>

          <Field label="Event date">
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] px-3 py-2.5 text-sm"
              required
            />
          </Field>

          <Field label="Venue">
            <select
              value={venueId}
              onChange={(e) => setVenueId(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] px-3 py-2.5 text-sm"
              required
            >
              <option value="">Select venue</option>
              {venues.map((venue) => (
                <option key={venue.id} value={venue.id}>{venue.label}</option>
              ))}
            </select>
          </Field>

          <Field label="Category">
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] px-3 py-2.5 text-sm"
              required
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.label}</option>
              ))}
            </select>
          </Field>

          <Field label="Organizer">
            <select
              value={organizerId}
              onChange={(e) => setOrganizerId(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] px-3 py-2.5 text-sm"
              required
            >
              <option value="">Select organizer</option>
              {organizers.map((organizer) => (
                <option key={organizer.id} value={organizer.id}>{organizer.label}</option>
              ))}
            </select>
          </Field>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {submitting ? "Creating event..." : "Create event"}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-white p-6">
        <h2 className="font-syne text-2xl font-bold text-[var(--accent-dark)]">Events</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-[var(--text-secondary)]">
                <th className="pb-2">Name</th>
                <th className="pb-2">Date</th>
                <th className="pb-2">Venue ID</th>
                <th className="pb-2">Category ID</th>
                <th className="pb-2">Organizer ID</th>
                <th className="pb-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((eventItem) => (
                <tr key={eventItem.event_id} className="border-t border-[var(--border)]">
                  <td className="py-2.5">{eventItem.event_name}</td>
                  <td className="py-2.5">{new Date(eventItem.event_date).toLocaleDateString("en-IN")}</td>
                  <td className="py-2.5">{eventItem.venue_id}</td>
                  <td className="py-2.5">{eventItem.category_id}</td>
                  <td className="py-2.5">{eventItem.organizer_id}</td>
                  <td className="py-2.5">
                    <button
                      onClick={() => handleDeleteEvent(eventItem.event_id)}
                      className="rounded-md border border-red-200 px-3 py-1.5 font-semibold text-red-700 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-white p-6">
        <h2 className="font-syne text-2xl font-bold text-[var(--accent-dark)]">All bookings</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-[var(--text-secondary)]">
                <th className="pb-2">Booking</th>
                <th className="pb-2">User</th>
                <th className="pb-2">Event</th>
                <th className="pb-2">Seats</th>
                <th className="pb-2">Amount</th>
                <th className="pb-2">Payment</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.booking_id} className="border-t border-[var(--border)]">
                  <td className="py-2.5">#{booking.booking_id}</td>
                  <td className="py-2.5">
                    <p className="font-medium text-[var(--accent-dark)]">{booking.user_name}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{booking.user_email}</p>
                  </td>
                  <td className="py-2.5">
                    <p>{booking.event_name}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{booking.venue_name}, {booking.location}</p>
                  </td>
                  <td className="py-2.5">{booking.seats.join(", ") || "-"}</td>
                  <td className="py-2.5">
                    {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(
                      Number(booking.amount ?? 0),
                    )}
                  </td>
                  <td className="py-2.5">{booking.payment_method} ({booking.payment_status})</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">{label}</span>
      {children}
    </label>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-2xl border border-[var(--border)] bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">{label}</p>
      <p className="mt-2 font-syne text-3xl font-bold text-[var(--accent-dark)]">{value}</p>
    </article>
  );
}
