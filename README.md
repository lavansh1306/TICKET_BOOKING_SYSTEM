<div align="center">

# BOOKING_SYSTEM

### A production-grade full-stack event ticketing platform

**Next.js 16 · TypeScript 5 · MariaDB · Framer Motion · GSAP · Three.js**

</div>

---

## Overview

BOOKING_SYSTEM is a full-stack event ticket booking platform built as a DBMS course project at SRM IST. It covers the complete booking lifecycle — event discovery, interactive seat selection, discount validation, payment processing, and QR ticket generation — backed by a real relational MariaDB database with proper transaction handling and concurrency control.

Every API route reads from and writes to the live database. No mock data is served in production paths.

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js App Router | 16.2.4 |
| Language | TypeScript | 5 |
| Styling | Tailwind CSS | 3.4 |
| Animation | Framer Motion | 12.38 |
| Animation | GSAP + SplitText + ScrollTrigger | 3.15 |
| 3D | Three.js | 0.184 |
| State | Zustand | 5 |
| Server State | TanStack Query | 5 |
| Auth | NextAuth.js v5 beta | 5.0.0-beta.31 |
| Forms | React Hook Form + Zod | 7 + 4 |
| Database | MariaDB via mysql2/promise | 3.22 |
| Password | bcrypt | 6 |
| Icons | Lucide React | 1.11 |
| Notifications | react-hot-toast | 2.6 |

---

## Database Schema

18 tables in MariaDB. All API routes query these directly.

```
Users          — user_id, name, email, phone, password
Event          — event_id, event_name, event_date, venue_id, category_id, organizer_id, admin_id
Venue          — venue_id, venue_name, location, capacity
Category       — category_id, category_name
Organizer      — organizer_id, name, contact
Artist         — artist_id, artist_name, genre
Event_Artist   — event_id, artist_id  (junction)
Seat           — seat_id, seat_number, venue_id
Booking        — booking_id, user_id, event_id, booking_date
Ticket         — ticket_id, booking_id, seat_id, event_id, qr_code
Payment        — payment_id, booking_id, amount, payment_method, status
Discount       — discount_id, code, percentage, expiry_date
Booking_Discount — booking_id, discount_id  (junction)
Review         — review_id, user_id, event_id, rating, comment
Admin          — admin table
Seat_Lock      — concurrency seat locking
Booking_View   — DB view for booking summaries
Revenue_View   — DB view for revenue reporting
```

**Double-booking protection** is enforced at the database level. `/api/book-ticket` opens a transaction, runs `SELECT ... FOR UPDATE` on each seat before inserting, and rolls back the entire transaction if any seat is already taken.

---

## Project Structure

```
booking-system/
├── app/
│   ├── (app)/                        # Authenticated app shell
│   │   ├── events/
│   │   │   ├── page.tsx              # SSR event list (getEvents → DB)
│   │   │   ├── EventsPageClient.tsx  # Animated grid, category filter
│   │   │   └── [event_id]/
│   │   │       ├── page.tsx          # SSR event detail (getEventDetails → DB)
│   │   │       └── EventDetailClient.tsx
│   │   ├── booking/[event_id]/
│   │   │   ├── page.tsx
│   │   │   └── BookingClient.tsx     # 3-step wizard (Seats → Review → Payment)
│   │   ├── confirmation/[booking_id]/
│   │   │   └── page.tsx              # Ticket confirmation + Three.js 3D card
│   │   └── profile/
│   │       ├── page.tsx              # GSAP counter metrics, real booking data
│   │       ├── bookings/page.tsx     # Real bookings from DB
│   │       ├── reviews/page.tsx      # Real reviews from DB
│   │       └── settings/page.tsx     # PATCH user in DB
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts        # POST — queries Users table, plain-text compare
│   │   │   └── signup/route.ts       # POST — INSERT into Users, duplicate check
│   │   ├── events/
│   │   │   ├── route.ts              # GET — JOIN Event+Venue+Category+Organizer
│   │   │   └── [id]/route.ts         # GET — single event
│   │   ├── seats/[event_id]/route.ts # GET — LEFT JOIN Seat+Ticket for live status
│   │   ├── book-ticket/route.ts      # POST — full transaction: Booking+Ticket+Payment
│   │   ├── confirmation/[id]/route.ts# GET — 6-table JOIN for ticket confirmation
│   │   ├── discount/route.ts         # GET/POST — queries Discount table
│   │   ├── booking-discount/route.ts # POST — INSERT into Booking_Discount
│   │   ├── review/route.ts           # GET/POST — Review table
│   │   ├── payment/route.ts          # POST — INSERT into Payment
│   │   ├── booking/route.ts          # POST — INSERT into Booking
│   │   ├── ticket/route.ts           # GET/POST — Ticket table
│   │   └── profile/
│   │       ├── [user_id]/route.ts    # GET/PATCH — Users table
│   │       └── [user_id]/bookings/   # GET — full booking history JOIN
│   ├── auth/
│   │   ├── login/page.tsx            # Split-screen, floating cards, success burst
│   │   └── register/page.tsx         # Step timeline, confetti celebration
│   └── page.tsx                      # Landing page
├── components/
│   ├── landing/
│   │   ├── HeroSection.tsx           # GSAP SplitText, Framer 3D floating cards
│   │   ├── StatsSection.tsx          # GSAP ScrollTrigger counter animation
│   │   ├── FeaturesSection.tsx       # Framer whileInView stagger
│   │   └── HowItWorksSection.tsx     # GSAP horizontal scroll pin
│   ├── confirmation/
│   │   └── Ticket3D.tsx              # Three.js rotating ticket card
│   ├── layout/
│   │   ├── AppNavbar.tsx             # Scroll-aware compression, spring interactions
│   │   └── AppFooter.tsx
│   ├── payment/
│   │   └── PaymentStep.tsx
│   └── shared/
│       └── PageTransition.tsx        # Route-level fade transition
├── lib/
│   ├── db.ts                         # mysql2 connection pool (limit: 10)
│   ├── queries/
│   │   ├── events.ts                 # getEvents, getEventById, getEventDetails
│   │   ├── booking.ts                # findDiscountByCode (DB), calcPricing
│   │   ├── payment.ts                # payment helpers
│   │   └── user.ts                   # getUserById, getUserByEmail
│   ├── store/
│   │   ├── bookingStore.ts           # Zustand: seats, step, discount, pricing
│   │   └── userStore.ts              # Zustand: auth user session
│   ├── validations/
│   │   ├── auth.ts                   # Zod login + register schemas
│   │   ├── booking.ts                # Zod booking schema
│   │   └── payment.ts                # Zod payment schema
│   └── utils/
│       ├── cn.ts                     # clsx + tailwind-merge
│       ├── formatDate.ts
│       ├── formatPrice.ts
│       └── generateQR.ts
└── types/index.ts                    # All shared TypeScript interfaces
```

---

## Booking Flow

```
/events  →  /events/[id]  →  /booking/[id]  →  /confirmation/[id]
                                    │
                          ┌─────────┴──────────┐
                          │   3-step wizard     │
                          │                     │
                          │  Step 1 — Seats     │  fetch /api/seats/[event_id]
                          │  Live seat map      │  LEFT JOIN Seat + Ticket
                          │  Spring pop-in      │  booked seats marked in DB
                          │  Max 6 seats        │
                          │                     │
                          │  Step 2 — Review    │  POST /api/discount
                          │  Order summary      │  validates against Discount table
                          │  Promo code         │  CURDATE() expiry check
                          │  Live price calc    │
                          │                     │
                          │  Step 3 — Payment   │  POST /api/book-ticket
                          │  Card / NetBanking  │  BEGIN TRANSACTION
                          │  OTP verify         │  SELECT ... FOR UPDATE (each seat)
                          │                     │  INSERT Booking
                          └─────────────────────┘  INSERT Ticket × n
                                                   INSERT Payment
                                                   COMMIT / ROLLBACK
```

### Pricing Formula

```
Row A = ₹500  ·  B = ₹400  ·  C = ₹300  ·  D = ₹200  ·  E = ₹150

Subtotal    = Σ SEAT_PRICE[row] for each selected seat
ConvFee     = ₹29 × number of seats
GST         = ConvFee × 18%
DiscountAmt = Subtotal × discount.percentage / 100  (if code applied)
Total       = Subtotal − DiscountAmt + ConvFee + GST
```

---

## API Reference

### Auth
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Query `Users` table, compare password |
| `POST` | `/api/auth/signup` | INSERT into `Users`, check duplicate email |

### Events
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/events` | JOIN Event + Venue + Category + Organizer + Event_Artist |
| `GET` | `/api/events/[id]` | Single event with full relations |

### Seats & Booking
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/seats/[event_id]` | Live seat status via LEFT JOIN Ticket |
| `POST` | `/api/book-ticket` | Atomic transaction: Booking + Ticket + Payment |
| `POST` | `/api/booking` | Standalone Booking INSERT |
| `GET` | `/api/confirmation/[id]` | 6-table JOIN for full ticket confirmation |

### Discount & Payment
| Method | Endpoint | Description |
|---|---|---|
| `GET/POST` | `/api/discount` | Validate code against Discount table |
| `POST` | `/api/booking-discount` | INSERT into Booking_Discount |
| `POST` | `/api/payment` | INSERT into Payment |
| `GET/POST` | `/api/ticket` | Ticket table read/write |

### Profile
| Method | Endpoint | Description |
|---|---|---|
| `GET/PATCH` | `/api/profile/[user_id]` | Read or update Users table |
| `GET` | `/api/profile/[user_id]/bookings` | Full booking history with seats + payments |
| `GET/POST` | `/api/review` | Review table read/write |

---

## State Management

### `useBookingStore` — Zustand

```ts
selectedSeats: Seat[]          // seats chosen on the map
currentStep: 1 | 2 | 3        // wizard step
appliedDiscount: Discount | null
subtotal: number               // auto-recalculated on seat/discount change
total: number                  // includes ConvFee + GST − Discount
setSeats(seats)
setStep(step)
applyDiscount(discount)
clearBooking()
```

### `useUserStore` — Zustand

```ts
user: User | null
isAuthed: boolean
setUser(user)
clearUser()
```

---

## Animations

| Location | Technology | Effect |
|---|---|---|
| Landing hero | GSAP SplitText | Character-by-character headline reveal |
| Landing hero | Framer Motion | 3D floating event cards with mouse tracking |
| Stats section | GSAP ScrollTrigger | Counter animation from 0 to real value |
| How it works | GSAP horizontal pin | Scroll-driven horizontal step sequence |
| Features | Framer `whileInView` | Staggered card entrance |
| Events grid | GSAP stagger | Cards pop in on load and filter change |
| Events grid | Framer `useSpring` | Per-card 3D tilt on mouse move |
| Event detail | Framer `useTransform` | Ken Burns parallax banner on scroll |
| Event detail | GSAP stagger | Section-by-section reveal on mount |
| Seat map | Framer spring stagger | Each seat button pops in with `delay: index × 8ms` |
| Seat map | Framer `pathLength` | SVG screen arc draws itself |
| Booking wizard | Framer `AnimatePresence` | Blur + slide between steps |
| Booking summary | Framer `popLayout` | Seat rows animate in/out individually |
| Step indicator | Framer layout | Progress bar fills between steps |
| Navbar | Framer `useMotionValueEvent` | Height + blur compress on scroll |
| Login page | GSAP + Framer | Floating event cards, idle sine float |
| Login success | Framer | Particle ring burst, SVG checkmark draw, route |
| Register success | Framer | 48-particle confetti, glow expand, progress bar |
| Confirmation | Three.js | Rotating 3D ticket card with QR code |
| Profile metrics | GSAP ScrollTrigger | Counters animate from 0 on scroll enter |
| Page transitions | Framer | 220ms opacity fade on route change |

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- MariaDB / MySQL 8+

### Installation

```bash
git clone https://github.com/lavansh1306/TICKET_BOOKING_SYSTEM.git
cd TICKET_BOOKING_SYSTEM/booking-system
npm install
cp .env.example .env.local
# fill in DB credentials
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Environment Variables

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=ticket_booking_system

NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3000
```

### Scripts

```bash
npm run dev      # Turbopack dev server
npm run build    # Production build
npm run start    # Production server
npm run lint     # ESLint
```

---

## Known Limitations

- Passwords are stored as plain text — bcrypt migration is noted in the codebase but not yet applied
- No email delivery — QR codes are generated client-side, no SMTP integration
- `Seat_Lock` table exists in the DB schema but seat locking uses `SELECT ... FOR UPDATE` inside the booking transaction rather than a separate lock table

---

<div align="center">

Made by Lavansh Choubey & Aiyana Sehgal · SRM IST · 21CSC205P

</div>
