import Link from 'next/link';

export default function DocsPage() {
  return (
    <div className="prose prose-brand max-w-none">
      <h1>Flex Living Reviews Dashboard Documentation</h1>
      <p>
        This application delivers a modern management dashboard for the Flex Living team.  It
        helps property managers quickly assess how each property is performing based on guest
        feedback, spot trends and curate which reviews appear on the public property page.
      </p>
      <h2>Tech stack</h2>
      <ul>
        <li><strong>Next.js&nbsp;14</strong> with the App Router for server and client components.</li>
        <li><strong>TypeScript</strong> for type safety across the codebase.</li>
        <li><strong>Tailwind&nbsp;CSS</strong> for styling and a custom green palette inspired by theflex.global.</li>
        <li><strong>Zustand</strong> to manage lightweight client state such as filters and toggles.</li>
        <li><strong>Recharts</strong> for charts including rating trends, category bars and channel mix pies.</li>
        <li><strong>Node API routes</strong> for serving a mocked Hostaway reviews endpoint and toggling approval state.</li>
      </ul>
      <h2>API endpoints</h2>
      <p>The application defines the following REST endpoints under <code>/api/reviews</code>:</p>
      <ul>
        <li>
          <code>GET /api/reviews/hostaway</code> – Returns normalized reviews grouped by listing.  Query parameters
          allow filtering by listing name, review type, channel, date range, minimum rating and whether only approved reviews should
          be returned.  The response includes per-listing averages, category breakdowns and trend data.
        </li>
        <li>
          <code>POST /api/reviews/[id]/approve</code> – Toggles or explicitly sets the approval state for a single review.
          The request body may include an <code>approved</code> boolean; otherwise the state is flipped.  Approval
          persists to the local JSON data file.
        </li>
        <li>
          <code>GET /api/reviews/google?placeId=…</code> – Placeholder for integrating Google Reviews via the Places API.
          No implementation is provided by default but the route can be extended.
        </li>
      </ul>
      <h2>Pages</h2>
      <ul>
        <li>
          <strong>/dashboard</strong> – Displays an overview of all listings with summary cards.  Managers can search,
          filter by channel, type, minimum rating and approval state.  Each card shows the average rating, top
          category scores and a sparkline of ratings over time.
        </li>
        <li>
          <strong>/property/[listingId]</strong> – Shows detailed analytics for a single property.  Charts depict
          category averages and the channel mix.  A management table lists every review with a toggle to approve
          or hide it from the public page.
        </li>
        <li>
          <strong>/share/[listingId]</strong> – Public view of a property’s reviews.  Only approved reviews are shown
          along with an aggregated star distribution.  If no reviews are approved a friendly empty state is displayed.
        </li>
        <li>
          <strong>/docs</strong> – You’re reading it!  Summarises the architecture, API and design decisions.
        </li>
      </ul>
      <h2>Design considerations</h2>
      <ul>
        <li>Data is mocked via <code>data/reviews.json</code> and normalised on each request.  Swapping in a real Hostaway
          integration would involve replacing the file read with an API call and mapping the response to the same shape.</li>
        <li>The green colour palette is defined in <code>tailwind.config.js</code> and applied throughout the UI to mirror the
          Flex Living brand.  Components are composed with simple Tailwind classes rather than relying on a heavy
          UI framework.</li>
        <li>State is kept minimal; filters live in component state and approval toggles update the backend directly.  A
          small Zustand store could be introduced for more complex global state.</li>
        <li>Server components fetch data from the API routes and pass it into client components when interactivity is needed.</li>
      </ul>
      <h2>Running locally</h2>
      <p>
        Install dependencies with <code>npm install</code> (requires access to npm registry) and start the dev server with
        <code>npm run dev</code>.  The API reads and writes <code>data/reviews.json</code> so you can add your own reviews or
        adjust the sample data.  For a production deployment on Vercel, environment variables are not required unless
        you choose to integrate external services such as Google Reviews.
      </p>
      <p>
        For more information see the <Link href="https://nextjs.org/docs">Next.js documentation</Link> and the
        <Link href="https://recharts.org/">Recharts docs</Link>.
      </p>
    </div>
  );
}