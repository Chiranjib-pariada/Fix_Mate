# FixMate

> **"Trusted help. Right when you need it."**

FixMate is an AI-powered home-services marketplace connecting customers with verified local service professionals (Electricians, Plumbers, AC Repair, Cleaners, Carpenters, Painters, and more) with real-world booking logic, time-slot availability checking, real-time chat, notifications, and intelligent AI concierge assistance.

---

## 🚀 Key Features

### 1. Customer Experience
* **Marketplace Discovery:** Search and filter verified pros by category, ratings, price, experience, and service area.
* **Smart Availability Engine:** Real-time slot management preventing double bookings.
* **End-to-End Booking Lifecycle:** Strict state transitions (`PENDING` → `CONFIRMED` → `PROVIDER_ON_THE_WAY` → `ARRIVED` → `IN_PROGRESS` → `COMPLETED`).
* **Customer Reviews:** Submit star ratings and feedback only on completed bookings with duplicate prevention.
* **Saved Addresses:** Add multiple locations with postal codes, landmarks, and primary indicators.

### 2. Service Provider Portal
* **Operations Pipeline:** Track active jobs, incoming requests, and dispatch statuses.
* **One-Click State Transitions:** Update dispatch statuses (*On The Way*, *Arrived*, *Start Work*, *Complete*).
* **Earnings & Metrics:** Total revenue, completed jobs, customer rating score.

### 3. Administrator Console
* **Platform Governance:** Live platform metrics (GMV, active bookings, registered customers).
* **Provider Verification Queue:** Audit provider documents with 1-click **Approve**, **Suspend**, or **Reject** actions.

### 4. FixMate AI Concierge (Powered by Gemini)
* **Home Repair Diagnostics:** Understands natural repair problems (e.g., *"My kitchen sink is leaking"* → matches Plumbing).
* **Tool & Function Calling:** Invokes backend-controlled tools (`searchServices`, `searchProviders`, `getBookingStatus`) without hallucinating data.
* **Safety & Emergency Routing:** Escalates hazards (gas leaks, active electrical sparks) to emergency precautions.

---

## 🛠 Tech Stack

* **Frontend:** React 19, TypeScript, React Router 7, Tailwind CSS, Lucide React, Socket.IO client
* **Backend:** Node.js, Express.js, Socket.IO, JWT, bcryptjs
* **AI:** Google GenAI SDK (`@google/genai`) using `gemini-3.8-flash` with backend tool calling
* **Data Layer:** High-performance document store with MongoDB-compatible schema and relational references

---

## 📁 Repository Structure

```text
├── server.ts                    # Express + Socket.IO + Vite full-stack server
├── server/
│   └── src/
│       ├── config/              # Typed ENV and configuration
│       ├── db/                  # MongoDB-compatible document store & seed data
│       ├── middleware/          # JWT protect, role authorization, centralized error handler
│       ├── routes/              # Modular REST routes (auth, users, providers, bookings, ai, admin)
│       ├── services/            # Gemini API AI service & tool execution
│       └── sockets/             # Socket.IO real-time chat & notifications
├── src/
│   ├── components/              # Layout, Navbar, MobileNav, Footer, AI Widget
│   ├── context/                 # AuthContext, NotificationContext, AIContext
│   ├── lib/                     # API client, Socket.IO client
│   ├── pages/                   # Home, Services, Bookings, Messages, Provider, Admin, Profile
│   └── types/                   # TypeScript domain contracts
```

---

## 🔑 Quick Demo Personas

Use the **Persona Switcher** in the top navigation bar or under `/profile` to test all 3 roles:

| Role | Persona | Key Capabilities |
| :--- | :--- | :--- |
| **Customer** | John Doe | Browse services, book slots, track appointments, rate pros, chat |
| **Provider** | Rajesh Kumar | View job requests, update travel & work status, review earnings |
| **Admin** | Admin FixMate | Platform GMV metrics, approve/suspend provider KYC |

---

## 💻 Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Run fullstack development server (Express + Vite on port 3000)
npm run dev

# 3. Production build
npm run build
npm start
```
