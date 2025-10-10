# Flex Living Reviews Dashboard (Next.js)

This repository contains a full‑stack web application that implements the
Flex Living Reviews Dashboard.  The goal of the project is to help
managers analyse guest feedback for each property, discover trends and
curate which reviews appear on the public site.  A mock dataset is
included to simulate Hostaway reviews and the app is styled to match
Flex Living’s green brand.

## Features

* **Dashboard overview** – See all properties at a glance with average
  ratings, top category scores and mini trend charts.  Search and
  filter by channel, type, minimum rating and approval state.
* **Property analytics** – Drill into a single property to view bar
  charts of category averages, a pie chart of channel mix and a table
  of every review.  Approve or unapprove reviews with a single click.
* **Public share page** – Display only approved reviews for a property
  along with a star distribution chart.  If no reviews are approved
  guests see a friendly empty state instead.
* **API routes** – Next.js API endpoints serve the normalized review
  data and toggle approval state.  A stub for Google Reviews integration
  illustrates how you could hook up the Places API.
* **Tailwind & React** – Built with Next.js 14, TypeScript, Tailwind
  CSS and Recharts.  A simple component library (Button, Switch) is
  included in lieu of shadcn/ui to avoid external dependencies.

## Getting started

1. Install dependencies (requires npm access):

   ```bash
   npm install
   ```

2. Run the development server:

   ```bash
   npm run dev
   ```

   Open your browser at <http://localhost:3000>.  You will be redirected
   to `/dashboard` where the list of properties is displayed.

3. To test review approvals, navigate to a property page (e.g.
   `/property/bayside-retreat`) and use the toggle on each review.  The
   approval state is persisted to `data/reviews.json` on disk.  You can
   then view the public page at `/share/bayside-retreat` to see how
   approved reviews are rendered.

### Project structure

| Path | Purpose |
| --- | --- |
| `data/reviews.json` | Mocked Hostaway reviews used by the API routes.  Feel free to modify or add new reviews. |
| `src/app/api/reviews/` | Next.js API routes for returning normalized reviews, toggling approvals and (stub) Google reviews. |
| `src/app/dashboard` | Dashboard page with filters and summary cards. |
| `src/app/property/[listingId]` | Detailed view for a single property with analytics and review management. |
| `src/app/share/[listingId]` | Public view for a property showing only approved reviews. |
| `src/components` | Reusable UI components (cards, filter bar, tables, toggles) built with Tailwind. |
| `src/lib` | Data models and helper functions for reading and normalizing review data. |

## Extending the app

* **Real API integration** – Replace the file read in `src/lib/reviews.ts` with
  calls to Hostaway’s real API.  Map the response into the `Review`
  interface defined in `src/lib/types.ts`.
* **Database** – Swap out the file‑based persistence with a real
  database (e.g. Postgres or Supabase) and migrate the approval API to
  operate on it.
* **Auth & RBAC** – Protect the dashboard with authentication and role
  based access control.  Supabase provides a straightforward auth system
  that fits neatly with Next.js.
* **Design polish** – Import shadcn/ui components for consistent
  styling and add animations with Framer Motion.  The current app uses
  bespoke Tailwind classes.
* **Google reviews** – Implement the `GET /api/reviews/google` endpoint
  using the Places Details API or Google My Business API.  Use the
  `placeId` query parameter to fetch up to five reviews and merge them
  into the dashboard.

---

Built as part of a developer assessment for Flex Living!