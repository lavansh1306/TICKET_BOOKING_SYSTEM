<div align="center">

# 🎟️ TICKET BOOKING SYSTEM

### A premium, full-stack event ticketing platform built with Next.js 15 App Router

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![MySQL](https://img.shields.io/badge/MySQL-3-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com)
[![Zustand](https://img.shields.io/badge/Zustand-5-orange?style=for-the-badge)](https://zustand-demo.pmnd.rs)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-0055FF?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion)
[![GSAP](https://img.shields.io/badge/GSAP-3-88CE02?style=for-the-badge&logo=greensock&logoColor=white)](https://gsap.com)
[![Zod](https://img.shields.io/badge/Zod-4-3E67B1?style=for-the-badge)](https://zod.dev)
[![React Query](https://img.shields.io/badge/TanStack_Query-5-FF4154?style=for-the-badge&logo=react-query&logoColor=white)](https://tanstack.com/query)
[![NextAuth](https://img.shields.io/badge/NextAuth.js-5_beta-purple?style=for-the-badge)](https://authjs.dev)
[![Three.js](https://img.shields.io/badge/Three.js-0.184-black?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [Project Structure](#-project-structure)
- [Data Models](#-data-models)
- [API Reference](#-api-reference)
- [Booking Flow](#-booking-flow)
- [State Management](#-state-management)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Scripts](#-scripts)

---

## 🌟 Overview

**TICKET_BOOKING_SYSTEM** is a production-grade event ticket booking platform that lets users discover events, choose seats on an interactive seat map, apply discount codes, and complete a secure multi-step payment checkout. The system enforces double-booking protection, real-time seat availability, OTP-verified payments, and post-event reviews — all wrapped in a silky-smooth animated UI.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                         │
│                                                                 │
│  ┌─────────────┐  ┌──────────────────┐  ┌───────────────────┐  │
│  │  Landing    │  │  Event Discovery │  │   Booking Flow    │  │
│  │  Page       │  │  /events         │  │   (3-step wizard) │  │
│  │  (GSAP +    │  │  /events/[id]    │  │                   │  │
│  │  Framer)    │  │                  │  │  1. Seat Select   │  │
│  └─────────────┘  └──────────────────┘  │  2. Discount      │  │
│                                         │  3. Payment       │  │
│                                         └───────────────────┘  │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                Zustand Global State                       │  │
│  │   useBookingStore (seats, step, discount, totals)         │  │
│  │   useUserStore    (auth user session)                     │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │            TanStack Query  (server cache)                 │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │  HTTP / API Routes
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Next.js App Router  (Server)                   │
│                                                                 │
│  Route Handlers (app/api/*)                                     │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────────┐ │
│  │ /api/auth    │ │ /api/events  │ │ /api/booking             │ │
│  │   login      │ │   GET list   │ │   POST create booking    │ │
│  │   signup     │ │   GET [id]   │ │   GET user bookings      │ │
│  │   [...next]  │ │              │ └──────────────────────────┘ │
│  └──────────────┘ └──────────────┘                             │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────────┐ │
│  │ /api/payment │ │ /api/seats   │ │ /api/discount            │ │
│  │   POST pay   │ │   GET map    │ │   POST validate code     │ │
│  └──────────────┘ └──────────────┘ └──────────────────────────┘ │
│                                                                 │
│  Zod Validation Layer ─────────────────────────────────────────│
│  (auth.ts · booking.ts · payment.ts)                            │
│                                                                 │
│  Query Layer (lib/queries/*)                                    │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────────┐ │
│  │ events.ts    │ │ booking.ts   │ │ user.ts / payment.ts     │ │
│  └──────────────┘ └──────────────┘ └──────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Data Layer                                 │
│                                                                 │
│   MySQL  (mysql2/promise · connection pool)                     │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  Users · Events · Venues · Seats · Bookings             │   │
│   │  Payments · Tickets · Reviews · Discounts · Artists     │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│   Mock Layer (lib/mock/) — used in development / demo mode      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 16 (App Router) | Full-stack React framework, SSR + API routes |
| **Language** | TypeScript 5 | End-to-end type safety |
| **Styling** | Tailwind CSS 3 | Utility-first CSS |
| **Animation** | Framer Motion 12 | Page transitions, scroll effects, hover physics |
| **Animation** | GSAP 3 + SplitText | Hero text animations, scroll-driven sequences |
| **3D** | Three.js 0.184 | 3D ticket confirmation card |
| **State** | Zustand 5 | Booking wizard + auth global state |
| **Data Fetching** | TanStack Query 5 | Server state cache, loading/error handling |
| **Auth** | NextAuth.js v5 beta | Session management, credential + OAuth |
| **Forms** | React Hook Form 7 + Zod 4 | Schema validation on forms and API routes |
| **Database** | MySQL 2 + mysql2/promise | Relational data, connection pooling |
| **Password** | bcrypt 6 | Secure password hashing |
| **Notifications** | react-hot-toast 2 | Toast notifications |
| **Icons** | Lucide React 1 | Icon library |

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎭 **Event Discovery** | Browse concerts, movies, sports, festivals and theatre events |
| 🗺️ **Interactive Seat Map** | Row-based seat grid with real-time availability and pricing tiers |
| 💳 **Multi-step Checkout** | 3-step booking wizard: Seats → Discount → Payment |
| 🔖 **Discount Codes** | Promo codes validated against expiry date with live price recalculation |
| 🔐 **Auth System** | Register & login with email/password; NextAuth session management |
| 🛡️ **Double-booking Guard** | `UNIQUE(seat_id, event_id)` constraint prevents concurrent seat conflicts |
| 🎟️ **3D Ticket** | Animated Three.js confirmation ticket on booking success |
| ⭐ **Event Reviews** | Post-event 1–5 star ratings with comments |
| 💰 **Tiered Pricing** | Seat price by row prefix (A=₹500 → E=₹150) + GST + convenience fee |
| 📱 **Responsive UI** | Mobile-first layout using Tailwind CSS breakpoints |
| 🎨 **Premium Design** | Warm earth-tone palette, glassmorphism cards, floating parallax cards |

---

## 📁 Project Structure

```
TICKET_BOOKING_SYSTEM/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (fonts, providers)
│   ├── page.tsx                  # Landing page (Hero, Stats, Features, HowItWorks)
│   ├── auth/
│   │   ├── login/                # Login page
│   │   └── register/             # Registration page
│   ├── payment/                  # Payment page
│   └── api/                      # Route Handlers
│       ├── auth/
│       │   ├── [...nextauth]/    # NextAuth handler
│       │   ├── login/            # POST /api/auth/login
│       │   └── signup/           # POST /api/auth/signup
│       ├── events/
│       │   ├── route.ts          # GET /api/events
│       │   └── [id]/route.ts     # GET /api/events/:id
│       ├── booking/route.ts      # POST /api/booking
│       ├── booking-discount/     # POST apply discount to booking
│       ├── confirmation/         # GET booking confirmation
│       ├── discount/             # POST /api/discount (validate code)
│       ├── payment/route.ts      # POST /api/payment
│       ├── profile/              # GET /api/profile
│       ├── review/               # POST /api/review
│       ├── seats/                # GET /api/seats
│       ├── ticket/               # GET /api/ticket
│       └── book-ticket/          # POST full book-ticket flow
│
├── components/
│   ├── landing/
│   │   ├── HeroSection.tsx       # Animated hero with floating event cards
│   │   ├── FeaturesSection.tsx   # Sticky scroll feature list
│   │   ├── HowItWorksSection.tsx # Step-by-step explainer
│   │   ├── StatsSection.tsx      # Key platform stats
│   │   └── LandingNav.tsx        # Landing page navigation
│   ├── layout/
│   │   ├── AppNavbar.tsx         # Authenticated app navbar
│   │   ├── AppFooter.tsx         # App footer
│   │   └── Footer.tsx            # Landing footer
│   ├── payment/
│   │   └── PaymentStep.tsx       # Payment form step
│   ├── confirmation/
│   │   └── Ticket3D.tsx          # Three.js 3D ticket card
│   ├── shared/
│   │   ├── AppProviders.tsx      # TanStack Query + auth providers
│   │   └── RoutePlaceholder.tsx  # Loading placeholder
│   └── ui/
│       ├── Button.tsx            # Reusable button variants
│       ├── Card.tsx              # Card container
│       ├── Input.tsx             # Form input
│       ├── Modal.tsx             # Dialog/modal
│       ├── Badge.tsx             # Status badge
│       ├── StepIndicator.tsx     # Booking wizard step dots
│       ├── CountdownTimer.tsx    # Event countdown
│       └── SkeletonLoader.tsx    # Loading skeleton
│
├── lib/
│   ├── db.ts                     # MySQL connection pool
│   ├── hooks/
│   │   ├── useBookingFlow.ts     # Booking wizard navigation hook
│   │   └── useSeatMap.ts         # Seat selection state hook
│   ├── mock/
│   │   └── index.ts              # Mock data (events, seats, users, etc.)
│   ├── queries/
│   │   ├── events.ts             # Event data queries
│   │   ├── booking.ts            # Booking + discount helpers
│   │   ├── payment.ts            # Payment queries
│   │   └── user.ts               # User queries
│   ├── store/
│   │   ├── bookingStore.ts       # Zustand booking state + pricing logic
│   │   └── userStore.ts          # Zustand auth user state
│   ├── utils/
│   │   ├── cn.ts                 # clsx + tailwind-merge helper
│   │   ├── formatDate.ts         # Date formatter
│   │   ├── formatPrice.ts        # Currency formatter
│   │   └── generateQR.ts         # QR code generator
│   └── validations/
│       ├── auth.ts               # Login + register Zod schemas
│       ├── booking.ts            # Booking Zod schema
│       └── payment.ts            # Payment Zod schema
│
├── types/
│   └── index.ts                  # All shared TypeScript interfaces
│
├── tailwind.config.ts
├── tsconfig.json
├── next.config.mjs
└── package.json
```

---

## 🗃️ Data Models

```
┌──────────────────┐        ┌──────────────────┐        ┌──────────────────┐
│      User        │        │      Event        │        │      Venue       │
├──────────────────┤        ├──────────────────┤        ├──────────────────┤
│ user_id (PK)     │        │ event_id (PK)    │        │ venue_id (PK)    │
│ name             │        │ event_name       │        │ venue_name       │
│ email (UNIQUE)   │        │ event_date       │        │ location         │
│ phone            │        │ venue_id (FK)    │───────▶│ capacity         │
│ password (hash)  │        │ category_id (FK) │        └──────────────────┘
└──────────┬───────┘        │ organizer_id (FK)│
           │                │ admin_id         │        ┌──────────────────┐
           │                └────────┬─────────┘        │    Category      │
           │                         │                  ├──────────────────┤
           ▼                         │                  │ category_id (PK) │
┌──────────────────┐                 │                  │ category_name    │
│     Booking      │                 │                  └──────────────────┘
├──────────────────┤                 │
│ booking_id (PK)  │◀────────────────┘
│ user_id (FK)     │        ┌──────────────────┐
│ event_id (FK)    │        │      Seat        │
│ booking_date     │        ├──────────────────┤
└──────┬───────────┘        │ seat_id (PK)     │
       │                    │ seat_number      │
       │   ┌────────────────│ venue_id (FK)    │
       │   │                │ status           │
       │   ▼                └──────────────────┘
       │  ┌──────────────────┐
       │  │     Ticket       │   UNIQUE(seat_id, event_id)
       │  ├──────────────────┤   ← double-booking guard
       │  │ ticket_id (PK)   │
       │  │ booking_id (FK)  │
       │  │ seat_id (FK)     │
       │  │ event_id (FK)    │
       │  │ qr_code          │
       │  └──────────────────┘
       │
       ▼
┌──────────────────┐        ┌──────────────────┐
│     Payment      │        │     Discount     │
├──────────────────┤        ├──────────────────┤
│ payment_id (PK)  │        │ discount_id (PK) │
│ booking_id (FK)  │        │ code (UNIQUE)    │
│ amount           │        │ percentage       │
│ payment_method   │        │ expiry_date      │
│ status           │        └──────────────────┘
└──────────────────┘
```

---

## 🔌 API Reference

### Authentication

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/login` | `{ email, password }` | Sign in a user |
| `POST` | `/api/auth/signup` | `{ name, email, phone, password }` | Register a new user |
| `GET/POST` | `/api/auth/[...nextauth]` | — | NextAuth.js handler |

### Events

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/events` | List all events with venue, category, organizer and artists |
| `GET` | `/api/events/:id` | Get full event detail including reviews and seat availability |

### Booking

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| `POST` | `/api/booking` | `{ user_id, event_id, booking_date }` | Create a booking record |
| `POST` | `/api/book-ticket` | `{ user_id, event_id, seat_ids, discount_code? }` | Full end-to-end booking |
| `GET` | `/api/confirmation` | Query `?booking_id=` | Fetch booking confirmation |

### Seats and Discount

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/seats` | Get seat map for a venue |
| `POST` | `/api/discount` | Validate a discount code |
| `POST` | `/api/booking-discount` | Link a discount to a booking |

### Payment and Tickets

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| `POST` | `/api/payment` | `{ booking_id, amount, payment_method, status }` | Record a payment |
| `GET` | `/api/ticket` | Query `?booking_id=` | Retrieve tickets with QR codes |
| `POST` | `/api/review` | `{ user_id, event_id, rating, comment }` | Submit event review |
| `GET` | `/api/profile` | — | Get authenticated user profile |

---

## 🎬 Booking Flow

```
User visits /events
      │
      ▼
Browse event list ──▶ Click event ──▶ /events/[id]  (event details + seat map)
                                              │
                                              ▼
                                    ┌─────────────────┐
                                    │  STEP 1: Seats  │
                                    │  Select seats   │
                                    │  from row grid  │
                                    │  (A-E pricing)  │
                                    └────────┬────────┘
                                             │ Next
                                             ▼
                                    ┌─────────────────┐
                                    │ STEP 2: Discount│
                                    │  Enter promo    │
                                    │  code (optional)│
                                    │  Live total     │
                                    │  recalculation  │
                                    └────────┬────────┘
                                             │ Next
                                             ▼
                                    ┌─────────────────┐
                                    │ STEP 3: Payment │
                                    │  Card / NetBank │
                                    │  OTP verify     │
                                    │  POST /booking  │
                                    │  POST /payment  │
                                    └────────┬────────┘
                                             │ Success
                                             ▼
                                    ┌─────────────────┐
                                    │  Confirmation   │
                                    │  3D Ticket card │
                                    │  QR Code        │
                                    └─────────────────┘
```

### Pricing Formula

```
Subtotal     = sum of SEAT_PRICE[row] per selected seat
               (A = 500  ·  B = 400  ·  C = 300  ·  D = 200  ·  E = 150)

ConvFee      = 29 x number_of_seats
GST          = ConvFee x 18%
DiscountAmt  = Subtotal x discount.percentage / 100  (if code applied)

Total        = Subtotal - DiscountAmt + ConvFee + GST
```

---

## 🧠 State Management

### `useBookingStore` (Zustand)

```ts
{
  selectedSeats: Seat[]       // seats chosen on the map
  currentStep: 1 | 2 | 3     // wizard step
  appliedDiscount: Discount | null
  subtotal: number
  total: number               // auto-recalculated on seat/discount change
  setSeats(seats)
  setStep(step)
  applyDiscount(discount)
  clearBooking()
}
```

### `useUserStore` (Zustand)

```ts
{
  user: User | null
  isAuthed: boolean
  setUser(user)
  clearUser()
}
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- MySQL 8+ (or any mysql2-compatible database)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/lavansh1306/TICKET_BOOKING_SYSTEM.git
cd TICKET_BOOKING_SYSTEM

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local
# Edit .env.local with your DB credentials and auth secret

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Environment Variables

Create a `.env.local` file in the project root:

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=ticket_booking

# NextAuth
NEXTAUTH_SECRET=your_super_secret_key
NEXTAUTH_URL=http://localhost:3000
```

---

## 📜 Scripts

```bash
npm run dev      # Start development server with hot-reload
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

<div align="center">

Made with ❤️ by [lavansh1306](https://github.com/lavansh1306)

[![GitHub stars](https://img.shields.io/github/stars/lavansh1306/TICKET_BOOKING_SYSTEM?style=social)](https://github.com/lavansh1306/TICKET_BOOKING_SYSTEM/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/lavansh1306/TICKET_BOOKING_SYSTEM?style=social)](https://github.com/lavansh1306/TICKET_BOOKING_SYSTEM/network/members)

</div>
