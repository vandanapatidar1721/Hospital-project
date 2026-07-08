# Hospital Management System (HMS)

A full-stack web application to digitize hospital operations — patient records, appointments, prescriptions, billing, and role-based dashboards for Admin, Doctor, Receptionist, and Patient.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, Tailwind CSS, React Router |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose |
| Auth | JWT + Role-Based Access Control (RBAC) |

## Features

- **Authentication** — Login, logout, change password, JWT tokens
- **Role-Based Dashboards** — Admin, Doctor, Receptionist, Patient
- **Department Management** — CRUD (Admin)
- **Doctor Management** — CRUD, search, profiles (Admin)
- **Patient Management** — Registration, CRUD, search (Receptionist/Admin)
- **Appointment Management** — Book, update status, cancel, history
- **Prescription Management** — Digital prescriptions, print, history (Doctor)
- **Billing Management** — Generate bills, auto-calculate, print invoices
- **Receptionist Management** — Admin can add/remove receptionists
- **Search** — Across departments, doctors, patients, appointments, prescriptions, bills
- **Responsive UI** — Mobile-friendly layout

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [MongoDB](https://www.mongodb.com/) running locally or MongoDB Atlas connection string

## Quick Start

### 1. Install dependencies

```bash
cd Hospital
npm run install:all
```

### 2. Configure environment

Backend config is at `backend/.env`. Copy `backend/.env.example` and set your values:

```
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/hospital_management
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
```

All demo login emails and passwords for seeding must be set in `.env` (see `backend/.env.example`). They are stored in the database only — never hardcoded in source code.

### 3. Seed the database (demo data)

```bash
npm run seed
```

### 4. Run the application

```bash
npm run dev
```

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000/api

## Login

Open http://localhost:5173/login — one page for all users. Enter email and password; the system routes you to the correct dashboard based on your role (Admin, Doctor, Receptionist, or Patient).

Demo accounts are created in the database when you run `npm run seed`. Configure their emails and passwords in `backend/.env` before seeding.

## Project Structure

```
Hospital/
├── backend/
│   ├── config/         # Database connection
│   ├── controllers/    # Route handlers
│   ├── middleware/     # Auth, validation, errors
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API routes
│   ├── seeds/          # Database seed script
│   └── server.js       # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── context/    # Auth context
│   │   ├── pages/      # Page components
│   │   ├── services/   # API client
│   │   └── utils/      # Helpers
│   └── vite.config.js
└── package.json        # Root scripts
```

## API Endpoints

| Module | Base Path | Methods |
|--------|-----------|---------|
| Auth | `/api/auth` | POST login, change-password; GET me; POST logout |
| Dashboard | `/api/dashboard` | GET admin, doctor, receptionist, patient |
| Departments | `/api/departments` | GET, POST, PUT, DELETE |
| Doctors | `/api/doctors` | GET, POST, PUT, DELETE |
| Patients | `/api/patients` | GET, POST, PUT, DELETE |
| Appointments | `/api/appointments` | GET, POST, PUT, PATCH cancel |
| Prescriptions | `/api/prescriptions` | GET, POST |
| Bills | `/api/bills` | GET, POST, PUT |
| Users | `/api/users` | GET, POST receptionist, PUT, DELETE |

All protected routes require `Authorization: Bearer <token>` header.

## Database Collections

- **users** — All system users with roles
- **departments** — Hospital departments
- **doctors** — Doctor profiles linked to users
- **patients** — Patient records
- **appointments** — Scheduled appointments
- **prescriptions** — Digital prescriptions with medicine items
- **bills** — Billing records

## Production Build

```bash
npm run build:frontend
npm run start:backend
```

Serve the `frontend/dist` folder with any static file server, or configure Express to serve it.

## License

MIT
