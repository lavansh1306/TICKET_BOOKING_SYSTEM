import { artists, categories, events, organizers, reviews, seats, venues } from "@/lib/mock";

export async function getEvents() {
  return events.map((event) => ({
    ...event,
    venue: venues.find((v) => v.venue_id === event.venue_id),
    category: categories.find((c) => c.category_id === event.category_id),
    organizer: organizers.find((o) => o.organizer_id === event.organizer_id),
    artists: artists.filter((a) => {
      if (event.category_id === 2) return a.genre === "Music";
      if (event.category_id === 4) return a.genre === "Comedy";
      if (event.category_id === 3) return a.genre === "Theatre";
      return true;
    }),
  }));
}

export async function getEventById(eventId: number) {
  const allEvents = await getEvents();
  return allEvents.find((e) => e.event_id === eventId) ?? null;
}

export async function getEventDetails(eventId: number) {
  const event = await getEventById(eventId);
  if (!event) return null;

  const eventReviews = reviews
    .filter((r) => r.event_id === eventId)
    .map((r) => ({ ...r, user: r.user }));

  const totalSeats = seats.filter((s) => s.venue_id === event.venue_id).length;
  // Mock: 0 booked tickets for now — booking flow populates this
  const bookedSeats = 0;

  return {
    ...event,
    reviews: eventReviews,
    totalSeats,
    bookedSeats,
    availableSeats: totalSeats - bookedSeats,
  };
}
