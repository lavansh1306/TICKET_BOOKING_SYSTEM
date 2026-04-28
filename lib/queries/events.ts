import { RowDataPacket } from "mysql2/promise";
import db from "@/lib/db";

interface EventRow extends RowDataPacket {
  event_id: number;
  event_name: string;
  event_date: string;
  venue_id: number;
  category_id: number;
  organizer_id: number;
  admin_id: number;
  venue_name: string;
  location: string;
  capacity: number;
  category_name: string;
  organizer_name: string;
  contact: string;
}

interface ArtistRow extends RowDataPacket {
  artist_id: number;
  artist_name: string;
  genre: string;
}

interface ReviewRow extends RowDataPacket {
  review_id: number;
  user_id: number;
  event_id: number;
  rating: number;
  comment: string;
  user_name: string;
}

interface SeatCountRow extends RowDataPacket {
  total: number;
  booked: number;
}

export async function getEvents() {
  const [rows] = await db.query<EventRow[]>(`
    SELECT
      e.event_id, e.event_name, e.event_date, e.venue_id, e.category_id, e.organizer_id, e.admin_id,
      v.venue_name, v.location, v.capacity,
      c.category_name,
      o.name AS organizer_name, o.contact
    FROM Event e
    JOIN Venue v ON v.venue_id = e.venue_id
    JOIN Category c ON c.category_id = e.category_id
    JOIN Organizer o ON o.organizer_id = e.organizer_id
    ORDER BY e.event_date ASC
  `);

  const eventIds = rows.map((r) => r.event_id);
  let artistMap: Record<number, ArtistRow[]> = {};

  if (eventIds.length > 0) {
    const placeholders = eventIds.map(() => "?").join(",");
    const [artists] = await db.query<ArtistRow[]>(
      `SELECT ea.event_id, a.artist_id, a.artist_name, a.genre
       FROM Event_Artist ea
       JOIN Artist a ON a.artist_id = ea.artist_id
       WHERE ea.event_id IN (${placeholders})`,
      eventIds
    );
    for (const a of artists) {
      (artistMap[a.event_id] ??= []).push(a);
    }
  }

  return rows.map((r) => ({
    event_id: r.event_id,
    event_name: r.event_name,
    event_date: r.event_date,
    venue_id: r.venue_id,
    category_id: r.category_id,
    organizer_id: r.organizer_id,
    admin_id: r.admin_id,
    venue: { venue_id: r.venue_id, venue_name: r.venue_name, location: r.location, capacity: r.capacity },
    category: { category_id: r.category_id, category_name: r.category_name },
    organizer: { organizer_id: r.organizer_id, name: r.organizer_name, contact: r.contact },
    artists: artistMap[r.event_id] ?? [],
  }));
}

export async function getEventById(eventId: number) {
  const all = await getEvents();
  return all.find((e) => e.event_id === eventId) ?? null;
}

export async function getEventDetails(eventId: number) {
  const event = await getEventById(eventId);
  if (!event) return null;

  const [reviewRows] = await db.query<ReviewRow[]>(
    `SELECT r.review_id, r.user_id, r.event_id, r.rating, r.comment, u.name AS user_name
     FROM Review r
     JOIN Users u ON u.user_id = r.user_id
     WHERE r.event_id = ?`,
    [eventId]
  );

  const reviews = reviewRows.map((r) => ({
    review_id: r.review_id,
    user_id: r.user_id,
    event_id: r.event_id,
    rating: r.rating,
    comment: r.comment,
    user: { name: r.user_name },
  }));

  const [[counts]] = await db.query<SeatCountRow[]>(
    `SELECT
       COUNT(s.seat_id) AS total,
       COUNT(t.ticket_id) AS booked
     FROM Seat s
     LEFT JOIN Ticket t ON t.seat_id = s.seat_id AND t.event_id = ?
     WHERE s.venue_id = ?`,
    [eventId, event.venue_id]
  );

  const totalSeats = Number(counts?.total ?? 0);
  const bookedSeats = Number(counts?.booked ?? 0);

  return {
    ...event,
    reviews,
    totalSeats,
    bookedSeats,
    availableSeats: totalSeats - bookedSeats,
  };
}
