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
      <h3>AI-assisted insights</h3>
      <p>
        A new server-side endpoint was added to surface potential problem reviews using an AI model:
      </p>
      <ul>
        <li>
          <code>GET /api/ai/bad-reviews</code> – Scans <code>data/reviews.json</code> and returns reviews that are likely
          to contain complaints or require host attention. If a Gemini API key is provided (see <code>GEMINI_API_KEY</code>), the
          endpoint will attempt to call the Gemini generative API and return the model-detected items with an <code>aiReason</code>.
          When the key is missing or the model call fails, the route falls back to a simple heuristic (low ratings or keyword matching).
        </li>
      </ul>
      <h2>AI / Gemini setup</h2>
      <p>
        To enable AI-powered detection you must provide a Gemini API key in your environment. Create a local <code>.env</code> file
        in the project root with the following variable (do not commit secrets):
      </p>
      <pre className="language-properties">GEMINI_API_KEY=YOUR_KEY_HERE</pre>
      <p>
        The server route does a best-effort POST to a generic Gemini endpoint. Depending on your Google Cloud setup you may need to
        adjust <code>src/app/api/ai/bad-reviews/route.ts</code> to match your project’s model name, region, or auth flow (service account
        token vs. API key). The endpoint returns JSON shaped like <code>{'{ source: "ai" | "heuristic", issues: Review[] , warning?: string }'}</code>.
      </p>

      <h2>Map & UI updates</h2>
      <ul>
        <li>
          The project was migrated from a Google Maps prototype to <strong>Leaflet + OpenStreetMap</strong> for a simpler, key-free map by default.
          Leaflet is now installed as an npm dependency and dynamically imported in the client Map component at <code>src/components/Map.tsx</code>.
        </li>
        {/* <li>
          A small UI Loader component was added at <code>src/components/ui/Loader.tsx</code> and replaces text-based loading states across the app
          with a circular spinner for a consistent experience.
        </li>
        <li>
          Map markers use a custom dark-green location SVG icon to match the brand (see the marker creation in <code>Map.tsx</code>).
        </li> */}
      </ul>

      <h2>Files of interest</h2>
      <ul>
        <li><code>src/components/Map.tsx</code> — Leaflet integration, dynamic import (avoids SSR errors), custom marker icon and fallback UI.</li>
        <li><code>src/components/ui/Loader.tsx</code> — Reusable circular loader used across pages and components.</li>
        <li><code>src/app/api/ai/bad-reviews/route.ts</code> — Server route that runs the AI detection (with a heuristic fallback).</li>
        <li><code>data/reviews.json</code> — Mocked review dataset used by the API routes and AI scan.</li>
      </ul>

      <h2>Local testing and developer checklist</h2>
      <ol>
        <li>Install dependencies: <code>npm install</code>. (Leaflet and its types were added.)</li>
        <li>Run a TypeScript check: <code>npx tsc --noEmit</code>.</li>
        <li>Start the dev server: <code>npm run dev</code> and open <code>/dashboard</code> in the browser.</li>
        <li>To test AI flow: add <code>GEMINI_API_KEY</code> to <code>.env</code>, restart the dev server and reload the dashboard — the Spot Trends
          panel will show AI-detected issues (or the heuristic fallback).</li>
        <li>If the editor reports path-alias errors (e.g. <code>Cannot find module '@/...'</code>), restart your editor’s TypeScript server
          (VS Code → Command Palette → "TypeScript: Restart TS server") and ensure the workspace TypeScript is selected.</li>
      </ol>

      <h2>Security & operational notes</h2>
      <ul>
        <li>Never commit API keys to version control. Use environment variables and secret management for production deployments.</li>
        <li>The AI call is done synchronously in the server route for simplicity. Consider adding caching (in-memory TTL) to reduce costs and latency.</li>
        <li>The AI prompt expects a strict JSON response; the route includes parsing fallbacks but you should test and adapt prompts to your preferred model behavior.</li>
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