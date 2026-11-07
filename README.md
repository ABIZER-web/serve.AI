# 🍽️ Serve.AI - QR Table Ordering, Restaurant Management & AI Voice Notification System

> A production-ready, full-stack, multi-tenant restaurant ordering and operations platform inspired by modern point-of-sale systems (Toast, DotPe, Petpooja, Restroworks) with real-time order synchronisation and AI-powered text-to-speech order announcements.

---

## 📸 System Visual Showcase

The ecosystem provides dedicated, tailored experiences for every role in the dining journey:

1. **Customer QR Table Ordering Experience**
   - Zero-installation mobile web app (`/r/food-house/table/T-05?token=...`).
   - Cryptographic table token verification preventing URL table spoofing.
   - Dynamic digital menu with Veg/Non-veg tags, Bestseller indicators, preparation times, and search.
   - Item customisations: portion sizes/variants (e.g., Regular ₹149, Medium ₹249, Large ₹349), add-ons (Extra cheese, dips), and kitchen cooking notes.
   - Persistent shopping cart, auto-calculated 5% GST (2.5% CGST + 2.5% SGST), and idempotent order checkout.
   - Live order tracking timeline: Placed &rarr; Accepted &rarr; Preparing &rarr; Ready &rarr; Served.
   - GST-compliant digital Tax Invoice (`INV-2026-001`) with printable layout and PDF download.

2. **Real-Time Staff POS Dashboard (`/staff`)**
   - Instant order popup card (`#ORD-1001 Table T-05`) with dual-tone bell chime.
   - AI Voice Announcement speaking order details in Indian English / Hindi:
     > *"Attention staff! A new order has been received for Table Five. Order number one zero zero one. Two Paneer Pizzas, one Cold Coffee and one French Fries. The total bill is five hundred and twenty-eight rupees. Please accept and prepare the order."*
   - Automatic audio deduplication & session mutex preventing duplicate echo across multiple tabs/devices.
   - Order lifecycle state transitions: Pending &rarr; Accepted &rarr; Preparing &rarr; Ready &rarr; Served &rarr; Completed.

3. **Touch-Screen Kitchen Display System (KDS) (`/kitchen`)**
   - 3-column Kanban layout:
     - **New Orders (Blue)**: Unaccepted tickets with 1-tap *Start Preparation*.
     - **Preparing (Orange)**: Live elapsed timers with SLA delay color codes and 1-tap *Mark as Ready*.
     - **Ready (Green)**: Prepared orders ready for food runner / waitstaff dispatch.
   - Fullscreen mode and live digital clock.

4. **Restaurant Admin Operations Hub (`/admin`)**
   - **Dashboard Overview**: Executive KPIs (Total orders today, Revenue today, Pending orders, Active tables), intraday revenue area chart (Today vs Yesterday), and top-selling dishes.
   - **Menu Management**: Full CRUD for categories, items, variants, add-ons, prices, and stock toggling (*In Stock* / *Sold Out*).
   - **Table & QR Management**: Dining room floor grid, secure token generation, QR code image download, and high-resolution printable acrylic table stands.
   - **Staff Management**: Role-Based Access Control (Owner, Admin, Manager, Waiter, Kitchen, Cashier).
   - **Reports & Analytics**: Tax revenue audit, payment method breakdown (UPI vs Cash), and CSV export.
   - **Settings**: Restaurant legal profile, GSTIN, CGST/SGST tax slabs, and AI voice announcement speech sliders.

5. **Flutter Mobile Application (`mobile_app/`)**
   - Native Dart + Flutter Material 3 application for on-the-floor staff and restaurant owners.
   - Live order sync via Supabase Realtime WebSocket engine.
   - Audio announcements using `flutter_tts`.
   - "Hello Chef!" dashboard with daily revenue trends and bump bar actions.

---

## 📁 Repository Structure

```
serve.AI/
├── webapp/                    # React 18 + Vite + Tailwind CSS web application
│   ├── src/
│   │   ├── components/        # UI primitives, layout, menu, orders, billing, tables
│   │   ├── context/           # RestaurantContext, CartContext, AuthContext
│   │   ├── lib/               # Supabase client, sound effects, AI speech service
│   │   ├── pages/             # Landing, Customer menu, Tracking, Staff, KDS, Admin
│   │   └── utils/             # Currency formatter, GST tax invoice generator
│   └── package.json
│
├── mobile_app/                # Flutter + Dart native mobile application
│   ├── lib/
│   │   ├── config/            # Theme (Warm Orange #F97316), constants
│   │   ├── models/            # Order and Menu item models
│   │   ├── providers/         # Riverpod order state management
│   │   ├── screens/           # Dashboard, Orders, Order Details, KDS, Settings
│   │   └── services/          # Flutter TTS speech announcement service
│   └── pubspec.yaml
│
├── supabase/                  # Supabase Backend & Database Engine
│   ├── migrations/            # PostgreSQL migrations (26 tables, RLS, functions)
│   ├── functions/             # Supabase Edge Functions (Deno / TypeScript)
│   │   ├── create-order/      # Atomic order creation & server-side price check
│   │   ├── generate-invoice/  # GST tax invoice snapshot generator
│   │   ├── payment-webhook/   # Razorpay / UPI payment capture handler
│   │   ├── send-notification/ # In-app and push notification dispatcher
│   │   └── generate-table-qr/ # Cryptographic token & QR generator
│   ├── seed.sql               # Seed data for "Food House" (10 tables, 20+ dishes)
│   └── config.toml
│
├── shared/                    # Shared API contracts and data models
├── ARCHITECTURE.md            # Deep system architecture & technical specification
├── PROJECT_PROGRESS.md        # Comprehensive checklist across all 20 phases
└── README.md
```

---

## ⚡ Quick Start & Local Execution

### 1. Web Application

```bash
cd webapp
npm install
npm run dev
```

The web application runs at `http://localhost:5173`:
- **Landing Page**: `http://localhost:5173/`
- **Customer Table Menu (Table T-05)**: `http://localhost:5173/r/food-house/table/T-05?token=TOKEN_FOOD_HOUSE_T-05_SECURE_KEY`
- **Staff Dashboard (POS)**: `http://localhost:5173/staff`
- **Kitchen Display System (KDS)**: `http://localhost:5173/kitchen`
- **Admin Hub**: `http://localhost:5173/admin`

*Note: The webapp includes an integrated offline/fallback store with the authentic Food House seed data. It is 100% functional and interactive immediately out of the box even before remote Supabase credentials are plugged in!*

### 2. Flutter Mobile Application

```bash
cd mobile_app
flutter pub get
flutter run
```

---

## 🔐 Supabase Configuration & Migrations

To deploy to your hosted Supabase project:

1. **Run Database Migrations**:
   Execute the migration SQL scripts in the Supabase SQL Editor:
   - `supabase/migrations/20261107000001_initial_schema.sql` (Creates all 26 tables, Row Level Security policies, indexes, and Realtime publications).
   - `supabase/migrations/20261107000002_functions_and_triggers.sql` (Stored procedures, sequential order/invoice numbering, and status change triggers).
   - `supabase/seed.sql` (Loads "Food House" sample restaurant, 10 tables, and 20+ dishes).

2. **Configure Environment Variables in `webapp/.env`**:
   ```env
   VITE_SUPABASE_URL=https://<your-project-id>.supabase.co
   VITE_SUPABASE_ANON_KEY=<your-anon-key>
   VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id
   VITE_APP_URL=http://localhost:5173
   ```

3. **Deploy Edge Functions**:
   ```bash
   supabase functions deploy create-order
   supabase functions deploy generate-invoice
   supabase functions deploy payment-webhook
   supabase functions deploy send-notification
   supabase functions deploy generate-table-qr
   ```

---

## 📜 Indian GST Tax Compliance

- **Taxable Subtotal**: $\sum (\text{Base Price} + \text{Addons}) \times \text{Qty} - \text{Discounts}$
- **CGST (2.5%)** + **SGST (2.5%)**: Default 5% GST for standalone restaurants without ITC.
- **Invoice Snapshotting**: Invoices are stored in `invoices` and `invoice_items` as immutable records. Changes to menu prices never alter historical invoices.
- **Exporting**: Invoices can be printed or exported as PDF via `jspdf` and `html2canvas`.

