# MedBlock – Doctor Appointment Booking Platform

MedBlock is a modern healthcare platform that connects patients with qualified doctors for online and in-person consultations. Built with Next.js, it offers secure appointment booking, patient management, and an admin dashboard.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Core Functionality](#core-functionality)
  - [Patient Experience](#patient-experience)
  - [Doctor Profiles](#doctor-profiles)
  - [Appointment Management](#appointment-management)
  - [Admin Dashboard](#admin-dashboard)
- [API Routes](#api-routes)
- [Authentication](#authentication)
- [Styling](#styling)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- Browse and search for doctors by specialty
- Book, reschedule, or cancel appointments
- Patient and doctor profile management
- Admin dashboard for managing doctors, patients, and appointments
- Secure authentication and role-based access
- Responsive UI with modern design
- Export appointments to CSV (admin)
- FAQ and help pages

---

## Tech Stack

- [Next.js](https://nextjs.org/) (React framework)
- [Lucide Icons](https://lucide.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- Custom authentication and database utilities

---

## Getting Started

First, install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the app.

---

## Project Structure

```
components/         # Reusable UI components (Navbar, Layout, DoctorCard, AppointmentCard, etc.)
lib/                # Authentication, database, and utility functions
pages/              # Next.js pages (routing)
  |_ index.js       # Home page
  |_ about/         # About page
  |_ admin/         # Admin dashboard and subpages
  |_ appointments/  # Patient appointments
  |_ doctors/       # Doctor listings and profiles
  |_ profile/       # User profile management
  |_ api/           # API routes (serverless functions)
public/             # Static assets
styles/             # Global and component styles (Tailwind CSS)
```

---

## Core Functionality

### Patient Experience

- Register and log in as a patient
- View and edit your profile ([pages/profile/index.js](pages/profile/index.js))
- Browse doctors by specialty ([pages/doctors/index.js](pages/doctors))
- Book appointments with available doctors ([components/DoctorCard.jsx](components/DoctorCard.jsx))
- Manage your appointments ([pages/appointments/index.js](pages/appointments/index.js))

### Doctor Profiles

- View detailed doctor profiles ([pages/doctors/[id].js](pages/doctors/[id].js))
- See doctor availability, specialties, and patient reviews

### Appointment Management

- Book, reschedule, or cancel appointments ([components/AppointmentCard.jsx](components/AppointmentCard.jsx))
- View appointment status (booked, completed, cancelled)
- Add notes to appointments

### Admin Dashboard

- Access via `/admin` ([pages/admin/index.js](pages/admin/index.js))
- Manage doctors, patients, and appointments
- View statistics and recent activity
- Export appointments to CSV ([pages/admin/appointments/index.js](pages/admin/appointments/index.js))

---

## API Routes

API routes are located in [pages/api/](pages/api/). For example:

- `/api/hello` – Example endpoint
- Custom endpoints for authentication, appointments, etc.

See [Next.js API Routes documentation](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) for details.

---

## Authentication

- Custom authentication logic in [lib/auth.js](lib/auth.js)
- Role-based access for patients, doctors, and admins
- Session management via tokens

---

## Styling

- Uses [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- Custom global styles in [styles/globals.css](styles/globals.css)
- Fonts optimized with [`next/font`](https://nextjs.org/docs/pages/building-your-application/optimizing/fonts) (Geist)

---

## Deployment

The easiest way to deploy is with [Vercel](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

For manual deployment, see [Next.js deployment documentation](https://nextjs.org/docs/pages/building-your-application/deploying).

---

## Contributing

Contributions are welcome! Please open issues or pull requests for improvements or bug fixes.

---

## Author

#### Deepak

---