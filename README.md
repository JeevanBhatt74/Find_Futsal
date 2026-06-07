# ⚽ FindFutsal: Full-Stack Monorepo

> Nepal's fastest futsal court booking platform. From search to confirmed slot in under 60 seconds.

## 📁 Project Structure

```
FindFutsal/
├── backend/                  # Node.js · Express · TypeScript · MongoDB
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts   # MongoDB connector w/ connection pooling
│   │   ├── middleware/
│   │   │   └── errorHandler.ts  # Global error handler + AppError class
│   │   ├── models/
│   │   │   ├── User.ts       # +977 phone validation, profile metadata
│   │   │   ├── Venue.ts      # Location sub-schema, image array, amenities enum
│   │   │   └── Slot.ts       # BookingStatus state machine, lock TTL virtuals
│   │   └── server.ts         # Express app: CORS, Helmet, rate-limiting, health check
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/                 # Vite · React 18 · TypeScript · TailwindCSS
    ├── src/
    │   ├── components/
    │   │   └── layout/       # Navbar (glassmorphism), Footer, Layout shell
    │   ├── lib/
    │   │   └── api.ts        # Axios instance w/ auth interceptors
    │   ├── pages/
    │   │   ├── HomePage.tsx        # Hero, city filter, features, CTA
    │   │   ├── VenuesPage.tsx      # Search, filter, venue card grid
    │   │   ├── VenueDetailPage.tsx # Image gallery, slot selector
    │   │   ├── BookingPage.tsx     # 3-step booking + success screen
    │   │   └── NotFoundPage.tsx
    │   ├── store/
    │   │   └── index.ts      # Zustand: AuthStore (persisted) + BookingStore
    │   ├── types/
    │   │   └── index.ts      # Shared TS interfaces mirroring Mongoose models
    │   ├── App.tsx           # React Router v6 route definitions
    │   └── main.tsx          # Bootstrap: QueryClient, Toaster, StrictMode
    ├── index.html
    ├── tailwind.config.js    # Brand tokens: emerald palette, 8px radius, animations
    ├── vite.config.ts        # Path alias @/*, API proxy to :5000
    └── package.json
```

## 🚀 Quick Start

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env — set MONGODB_URI and JWT_SECRET
npm install
npm run dev          # → http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev          # → http://localhost:5173
```

## 🎨 Design System

| Token          | Value     |
|----------------|-----------|
| Primary        | `#10B981` |
| Text           | `#1F2937` |
| Surface BG     | `#F3F4F6` |
| Canvas White   | `#FFFFFF` |
| Border Radius  | `8px`     |
| Font           | Inter + Outfit (Google Fonts) |

## 📋 Slot State Machine

```
Available ──► Locked (10 min TTL) ──► Booked
                   │
                   └── (expired) ──► Available
Maintenance (admin override)
```

## 🗺️ API Route Plan (Phase 2)

| Method | Route                     | Description               |
|--------|---------------------------|---------------------------|
| GET    | `/api/v1/venues`          | List/search venues        |
| GET    | `/api/v1/venues/:id`      | Venue detail              |
| GET    | `/api/v1/slots?venueId=&date=` | Available slots      |
| POST   | `/api/v1/slots/:id/lock`  | Acquire 10-min lock       |
| POST   | `/api/v1/bookings`        | Confirm booking           |
| POST   | `/api/v1/auth/register`   | User registration         |
| POST   | `/api/v1/auth/login`      | Login → JWT               |
