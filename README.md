<div align="center">

<br />

# 🎟️ BOOKING SYSTEM

### Production-grade full-stack event ticketing platform

<br />

![Next.js](https://img.shields.io/badge/Next.js-16.2.4-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)
![MariaDB](https://img.shields.io/badge/MariaDB-3.22-C0765A?style=for-the-badge&logo=mariadb&logoColor=white)

![Framer Motion](https://img.shields.io/badge/Framer_Motion-12.38-0055FF?style=for-the-badge&logo=framer&logoColor=white)
![GSAP](https://img.shields.io/badge/GSAP-3.15-88D35A?style=for-the-badge&logo=greensock&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-0.184-000000?style=for-the-badge&logo=threedotjs&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-5-FF6B35?style=for-the-badge)

![TanStack Query](https://img.shields.io/badge/TanStack_Query-5-FF4154?style=for-the-badge&logo=reactquery&logoColor=white)
![NextAuth](https://img.shields.io/badge/NextAuth.js-v5_beta-7C3AED?style=for-the-badge)
![Zod](https://img.shields.io/badge/Zod-4-3E67B1?style=for-the-badge)
![bcrypt](https://img.shields.io/badge/bcrypt-6-4A90D9?style=for-the-badge)

<br />

> **A complete booking lifecycle** — event discovery, interactive seat selection, discount validation, payment processing, and QR ticket generation — backed by a live relational MariaDB database with transaction handling and concurrency control.
>
> Every API route reads from and writes to the live database. **No mock data** is served in production paths.

<br />

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [Database Schema](#-database-schema)
- [Booking Flow](#-booking-flow)
- [Pricing Formula](#-pricing-formula)
- [Project Structure](#-project-structure)
- [API Reference](#-api-reference)
- [State Management](#-state-management)
- [Animation Inventory](#-animation-inventory)
- [Getting Started](#-getting-started)
- [Known Limitations](#-known-limitations)

---

## 🔭 Overview

BOOKING_SYSTEM is a full-stack event ticket booking platform built as a DBMS course project at **SRM IST**. It covers the complete booking lifecycle backed by a real relational MariaDB database with proper transaction handling and concurrency control.

**Double-booking protection** is enforced at the database level. `/api/book-ticket` opens a transaction, runs `SELECT ... FOR UPDATE` on each seat before inserting, and rolls back the entire transaction if any seat is already taken.

---

## 🛠 Tech Stack

| Layer | Technology | Version |
|:---|:---|:---:|
| ▲ Framework | Next.js App Router | `16.2.4` |
| 🔷 Language | TypeScript | `5` |
| 🎨 Styling | Tailwind CSS | `3.4` |
| ✦ Animation | Framer Motion | `12.38` |
| ▶ Animation | GSAP + SplitText + ScrollTrigger | `3.15` |
| ◈ 3D | Three.js | `0.184` |
| ⊕ State | Zustand | `5` |
| ◇ Server State | TanStack Query | `5` |
| 🔐 Auth | NextAuth.js | `v5.0.0-beta.31` |
| ✓ Forms | React Hook Form + Zod | `7 + 4` |
| 🗄 Database | MariaDB via mysql2/promise | `3.22` |
| 🔒 Password | bcrypt | `6` |
| 🎯 Icons | Lucide React | `1.11` |
| 🔔 Notifications | react-hot-toast | `2.6` |

---

## 🗄 Database Schema

**18 tables** in MariaDB. All API routes query these directly.

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│     Users       │  │      Event      │  │      Venue      │
│─────────────────│  │─────────────────│  │─────────────────│
│ user_id (PK)    │  │ event_id (PK)   │  │ venue_id (PK)   │
│ name            │  │ event_name      │  │ venue_name      │
│ email           │  │ event_date      │  │ location        │
│ phone           │  │ venue_id (FK)   │  │ capacity        │
│ password        │  │ category_id (FK)│  └─────────────────┘
└─────────────────┘  │ organizer_id(FK)│
                     │ admin_id (FK)   │
                     └─────────────────┘

┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│    Booking      │  │     Ticket      │  │    Payment      │
│─────────────────│  │─────────────────│  │─────────────────│
│ booking_id (PK) │  │ ticket_id (PK)  │  │ payment_id (PK) │
│ user_id (FK)    │  │ booking_id (FK) │  │ booking_id (FK) │
│ event_id (FK)   │  │ seat_id (FK)    │  │ amount          │
│ booking_date    │  │ event_id (FK)   │  │ payment_method  │
└─────────────────┘  │ qr_code         │  │ status          │
                     └─────────────────┘  └─────────────────┘

┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│    Discount     │  │     Review      │  │      Seat       │
│─────────────────│  │─────────────────│  │─────────────────│
│ discount_id(PK) │  │ review_id (PK)  │  │ seat_id (PK)    │
│ code            │  │ user_id (FK)    │  │ seat_number     │
│ percentage      │  │ event_id (FK)   │  │ venue_id (FK)   │
│ expiry_date     │  │ rating          │  └─────────────────┘
└─────────────────┘  │ comment         │
                     └─────────────────┘

── Junction Tables ──────────────────────────────────────────
  Event_Artist      →  event_id · artist_id
  Booking_Discount  →  booking_id · discount_id

── Special Tables ───────────────────────────────────────────
  Seat_Lock         →  Concurrency seat locking
  Admin             →  Admin table

── Database Views ───────────────────────────────────────────
  Booking_View      →  Booking summaries
  Revenue_View      →  Revenue reporting
```

### 🔒 Concurrency Control

```sql
-- /api/book-ticket — runs inside BEGIN ... COMMIT / ROLLBACK

BEGIN;

  SELECT * FROM Seat
    WHERE seat_id IN (?, ?, ...)
    FOR UPDATE;                   -- row-level lock on each seat

  INSERT INTO Booking  (...) VALUES (...);
  INSERT INTO Ticket   (...) VALUES (...);  -- × n seats
  INSERT INTO Payment  (...) VALUES (...);

COMMIT;
-- ROLLBACK automatically fires if any seat is already taken
```

---

## 🎯 Booking Flow

```
/events  ──►  /events/[id]  ──►  /booking/[id]  ──►  /confirmation/[id]
                                       │
                             ┌─────────┴──────────┐
                             │    3-step wizard    │
                             └─────────────────────┘
                                       │
              ┌────────────────────────┼────────────────────────┐
              │                        │                        │
      ┌───────▼───────┐       ┌───────▼───────┐       ┌───────▼───────┐
      │   STEP 1      │       │   STEP 2      │       │   STEP 3      │
      │   Seats       │       │   Review      │       │   Payment     │
      │───────────────│       │───────────────│       │───────────────│
      │ Live seat map │       │ Order summary │       │ Card /        │
      │ LEFT JOIN     │       │ Promo code    │       │ NetBanking    │
      │ Seat+Ticket   │       │ POST /api/    │       │ OTP verify    │
      │ Max 6 seats   │       │ discount      │       │ POST /api/    │
      │ Spring pop-in │       │ CURDATE()     │       │ book-ticket   │
      │               │       │ expiry check  │       │ TRANSACTION   │
      └───────────────┘       └───────────────┘       └───────────────┘
```

---

## 💰 Pricing Formula

### Seat Pricing by Row

| Row | Price | Description |
|:---:|:---:|:---|
| **A** | `₹ 500` | Front row — premium |
| **B** | `₹ 400` | Second row |
| **C** | `₹ 300` | Middle |
| **D** | `₹ 200` | Upper middle |
| **E** | `₹ 150` | Back row |

### Calculation

```
Subtotal    =  Σ SEAT_PRICE[row]   for each selected seat
ConvFee     =  ₹29  ×  number of seats
GST         =  ConvFee × 18%
DiscountAmt =  Subtotal × discount.percentage / 100   (if code applied)
              ─────────────────────────────────────────────────────────
Total       =  Subtotal − DiscountAmt + ConvFee + GST
```

---

## 📁 Project Structure

```
booking-system/
│
├── app/
│   ├── (app)/                            # Authenticated app shell
│   │   ├── events/
│   │   │   ├── page.tsx                  # SSR event list (getEvents → DB)
│   │   │   ├── EventsPageClient.tsx      # Animated grid, category filter
│   │   │   └── [event_id]/
│   │   │       ├── page.tsx              # SSR event detail
│   │   │       └── EventDetailClient.tsx
│   │   ├── booking/[event_id]/
│   │   │   ├── page.tsx
│   │   │   └── BookingClient.tsx         # 3-step wizard
│   │   ├── confirmation/[booking_id]/
│   │   │   └── page.tsx                  # Ticket + Three.js 3D card
│   │   └── profile/
│   │       ├── page.tsx                  # GSAP counter metrics
│   │       ├── bookings/page.tsx
│   │       ├── reviews/page.tsx
│   │       └── settings/page.tsx         # PATCH user in DB
│   │
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts            # POST — queries Users table
│   │   │   └── signup/route.ts           # POST — INSERT into Users
│   │   ├── events/
│   │   │   ├── route.ts                  # GET — JOIN Event+Venue+Category
│   │   │   └── [id]/route.ts             # GET — single event
│   │   ├── seats/[event_id]/route.ts     # GET — LEFT JOIN Seat+Ticket
│   │   ├── book-ticket/route.ts          # POST — full atomic transaction
│   │   ├── confirmation/[id]/route.ts    # GET — 6-table JOIN
│   │   ├── discount/route.ts             # GET/POST — Discount table
│   │   ├── booking-discount/route.ts     # POST — Booking_Discount
│   │   ├── review/route.ts               # GET/POST — Review table
│   │   ├── payment/route.ts              # POST — Payment table
│   │   ├── booking/route.ts              # POST — Booking table
│   │   ├── ticket/route.ts               # GET/POST — Ticket table
│   │   └── profile/
│   │       ├── [user_id]/route.ts        # GET/PATCH — Users table
│   │       └── [user_id]/bookings/       # GET — full booking history
│   │
│   ├── auth/
│   │   ├── login/page.tsx                # Split-screen, floating cards
│   │   └── register/page.tsx             # Step timeline, confetti
│   └── page.tsx                          # Landing page
│
├── components/
│   ├── landing/
│   │   ├── HeroSection.tsx               # GSAP SplitText + Framer 3D cards
│   │   ├── StatsSection.tsx              # GSAP ScrollTrigger counters
│   │   ├── FeaturesSection.tsx           # Framer whileInView stagger
│   │   └── HowItWorksSection.tsx         # GSAP horizontal scroll pin
│   ├── confirmation/
│   │   └── Ticket3D.tsx                  # Three.js rotating ticket card
│   ├── layout/
│   │   ├── AppNavbar.tsx                 # Scroll-aware compression
│   │   └── AppFooter.tsx
│   ├── payment/
│   │   └── PaymentStep.tsx
│   └── shared/
│       └── PageTransition.tsx            # Route-level fade transition
│
├── lib/
│   ├── db.ts                             # mysql2 pool (limit: 10)
│   ├── queries/
│   │   ├── events.ts                     # getEvents, getEventById
│   │   ├── booking.ts                    # findDiscountByCode, calcPricing
│   │   ├── payment.ts                    # payment helpers
│   │   └── user.ts                       # getUserById, getUserByEmail
│   ├── store/
│   │   ├── bookingStore.ts               # Zustand: seats, step, discount
│   │   └── userStore.ts                  # Zustand: auth user session
│   ├── validations/
│   │   ├── auth.ts                       # Zod login + register schemas
│   │   ├── booking.ts                    # Zod booking schema
│   │   └── payment.ts                    # Zod payment schema
│   └── utils/
│       ├── cn.ts                         # clsx + tailwind-merge
│       ├── formatDate.ts
│       ├── formatPrice.ts
│       └── generateQR.ts
│
└── types/index.ts                        # All shared TypeScript interfaces
```

---

## 📡 API Reference

### 🔐 Auth

| Method | Endpoint | Description |
|:---:|:---|:---|
| `POST` | `/api/auth/login` | Query `Users` table, compare password |
| `POST` | `/api/auth/signup` | `INSERT` into `Users`, check duplicate email |

### 🎪 Events

| Method | Endpoint | Description |
|:---:|:---|:---|
| `GET` | `/api/events` | `JOIN` Event + Venue + Category + Organizer + Event_Artist |
| `GET` | `/api/events/[id]` | Single event with full relations |

### 🪑 Seats & Booking

| Method | Endpoint | Description |
|:---:|:---|:---|
| `GET` | `/api/seats/[event_id]` | Live seat status via `LEFT JOIN Ticket` |
| `POST` | `/api/book-ticket` | **Atomic transaction:** Booking + Ticket + Payment |
| `POST` | `/api/booking` | Standalone Booking `INSERT` |
| `GET` | `/api/confirmation/[id]` | 6-table `JOIN` for full ticket confirmation |

### 💳 Discount & Payment

| Method | Endpoint | Description |
|:---:|:---|:---|
| `GET/POST` | `/api/discount` | Validate code against `Discount` table |
| `POST` | `/api/booking-discount` | `INSERT` into `Booking_Discount` |
| `POST` | `/api/payment` | `INSERT` into `Payment` |
| `GET/POST` | `/api/ticket` | Ticket table read/write |

### 👤 Profile

| Method | Endpoint | Description |
|:---:|:---|:---|
| `GET/PATCH` | `/api/profile/[user_id]` | Read or update `Users` table |
| `GET` | `/api/profile/[user_id]/bookings` | Full booking history with seats + payments |
| `GET/POST` | `/api/review` | Review table read/write |

---

## 🧠 State Management

### `useBookingStore` — Zustand

```typescript
interface BookingStore {
  selectedSeats:   Seat[]            // seats chosen on the map
  currentStep:     1 | 2 | 3        // wizard step
  appliedDiscount: Discount | null
  subtotal:        number            // auto-recalculated on seat/discount change
  total:           number            // includes ConvFee + GST − Discount

  setSeats(seats: Seat[]):           void
  setStep(step: 1 | 2 | 3):         void
  applyDiscount(discount: Discount): void
  clearBooking():                    void
}
```

### `useUserStore` — Zustand

```typescript
interface UserStore {
  user:     User | null
  isAuthed: boolean

  setUser(user: User):  void
  clearUser():          void
}
```

---

## 🎬 Animation Inventory

| Location | Technology | Effect |
|:---|:---:|:---|
| Landing hero | `GSAP SplitText` | Character-by-character headline reveal |
| Landing hero | `Framer Motion` | 3D floating event cards with mouse tracking |
| Stats section | `GSAP ScrollTrigger` | Counter animation from 0 to real value |
| How it works | `GSAP horizontal pin` | Scroll-driven horizontal step sequence |
| Features | `Framer whileInView` | Staggered card entrance |
| Events grid | `GSAP stagger` | Cards pop in on load and filter change |
| Events grid | `Framer useSpring` | Per-card 3D tilt on mouse move |
| Event detail | `Framer useTransform` | Ken Burns parallax banner on scroll |
| Event detail | `GSAP stagger` | Section-by-section reveal on mount |
| Seat map | `Framer spring stagger` | Each seat button pops in with `delay: index × 8ms` |
| Seat map | `Framer pathLength` | SVG screen arc draws itself |
| Booking wizard | `Framer AnimatePresence` | Blur + slide between steps |
| Booking summary | `Framer popLayout` | Seat rows animate in/out individually |
| Step indicator | `Framer layout` | Progress bar fills between steps |
| Navbar | `Framer useMotionValueEvent` | Height + blur compress on scroll |
| Login page | `GSAP + Framer` | Floating event cards, idle sine float |
| Login success | `Framer` | Particle ring burst, SVG checkmark draw |
| Register success | `Framer` | 48-particle confetti, glow expand, progress bar |
| Confirmation | `Three.js` | Rotating 3D ticket card with QR code |
| Profile metrics | `GSAP ScrollTrigger` | Counters animate from 0 on scroll enter |
| Page transitions | `Framer` | 220ms opacity fade on route change |

---

## 🚀 Getting Started

### Prerequisites

- Node.js `≥ 18`
- MariaDB / MySQL `8+`

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/lavansh1306/TICKET_BOOKING_SYSTEM.git
cd TICKET_BOOKING_SYSTEM/booking-system

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local
# → fill in your DB credentials (see below)

# 4. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

### Environment Variables

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=ticket_booking_system

# Auth
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

## ⚠️ Known Limitations

> These are known and documented — not bugs, just scope decisions for a course project.

| # | Issue | Status |
|:---:|:---|:---:|
| 1 | Passwords stored as **plain text** — bcrypt migration noted in codebase but not yet applied | 🔴 Pending |
| 2 | **No email delivery** — QR codes generated client-side, no SMTP integration | 🟡 Planned |
| 3 | `Seat_Lock` table exists in schema but locking uses `SELECT ... FOR UPDATE` inside the booking transaction instead | 🟢 Working |

---

<div align="center">

<br />

Made with ❤️ by

**Lavansh Choubey** &nbsp;&·&nbsp; **Aiyana Sehgal**

*SRM Institute of Science and Technology · 21CSC205P · DBMS Project*

<br />

</div>
