# DSTRCT Website

## Stack

- **Framework**: [TanStack Start](https://tanstack.com/start) (React)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com)
- **UI Components**: [React Aria Components](https://react-spectrum.adobe.com/react-aria/) (accessible)
- **Build Tool**: [Vite](https://vite.dev)

## Prerequisites

- Node.js 22+
- pnpm 9+

## Getting Started

### 1. Install dependencies

From the workspace root:

```bash
pnpm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` and set your values. For local development, the defaults work out of the box.

### 3. Start the development server

```bash
pnpm --filter @code-by-jos/demo dev
```

The app will be available at http://localhost:3000.

## Scripts

| Script     | Description                        |
| ---------- | ---------------------------------- |
| `dev`      | Start the development server       |
| `build`    | Build for production               |
| `preview`  | Preview the production build       |
| `test`     | Run news routing and content tests |
| `lint`     | Run ESLint                         |
| `lint:fix` | Run ESLint with auto-fix           |
| `format`   | Format code with Prettier          |

## Deployment

GitHub Actions builds and deploys pushes to these branches on Blacksmith Ubuntu 24.04 runners:

| Branch    | GitHub environment | Cloudflare Worker        | URL                              |
| --------- | ------------------ | ------------------------ | -------------------------------- |
| `main`    | `production`       | `dstrct-website`         | https://dstrct-mgmt.com/         |
| `staging` | `staging`          | `dstrct-website-staging` | https://staging.dstrct-mgmt.com/ |

The workflow installs the locked dependencies with pnpm 9 and Node.js 22. Deployments to each branch run one at a time. The Cloudflare environment is selected for both the Vite build and Wrangler deployment.

### Configuration

- The workflow uses `blacksmith-4vcpu-ubuntu-2404` runners through the organization's Blacksmith installation.
- Each GitHub environment has its own `CLOUDFLARE_API_TOKEN` secret. The tokens are scoped to their matching Worker in account `e4c0462505c8548e12ea8ae441ef1244`, with **Individual Workers Editor** and **Workers Routes Write** for `dstrct-mgmt.com`. To rotate a token, use that Worker's **Settings → Builds → API token for external CI/CD**, then replace the corresponding GitHub environment secret.
- The Sanity build variables default to project `qanl3ico` and dataset `production`, as in `.env.example`. Both sites initially read the same published content. Override `VITE_SANITY_PROJECT_ID` and `VITE_SANITY_DATASET` using GitHub environment variables to use a separate content dataset later.
- Configure the runtime secret `RESEND_API_KEY` separately on each Cloudflare Worker under **Settings → Variables and Secrets**. It is not a Vite build variable. The existing production secret stays on the production Worker.
- Keep Cloudflare's Git-based automatic builds disabled for these Workers so GitHub Actions controls deployments.

### Optional local deployment

```bash
pnpm deploy             # staging
pnpm deploy:staging     # staging
pnpm deploy:production  # production (explicit)
```

Authenticate with Wrangler or set `CLOUDFLARE_API_TOKEN` before deploying locally. All commands rebuild before deployment. The default Wrangler configuration also targets staging, so a plain `wrangler deploy` cannot target production by default. Production requires selecting the `production` environment.

## News

`/news` shows six runway previews in a horizontal strip above **Recent news**. The runway **Show more** link opens `/runway`, a vertical grid of runway posts. News-page posts open at `/news/<slug>`; posts opened from the runway page use `/runway/<slug>`. Direct links open the same popup over their respective listing. Escape, the close button, or clicking the backdrop closes the popup. Left/right arrows and mobile swipes navigate photos.

Both vertical feeds fetch 12 summaries at a time from Sanity, ordered by publication date and document ID. A date/ID cursor prevents offset shifts when posts are added or deleted. Intersection Observer loads the next page near the bottom, with a manual loading/retry fallback. After 24 loaded posts, TanStack Virtual renders only nearby rows; responsive columns and row measurements preserve space for offscreen content. Full text and gallery photos are fetched only when a post is opened.

Content is managed in the neighboring `dstrct-crm` Sanity Studio under **News posts**. The website and CRM must point at the same Sanity project and dataset. Build and redeploy that Studio to expose the new document type; no content migration is needed.

Create a title and URL slug, choose **Runway news** or **General news**, set the publication date, and upload a cover image. Optionally add a short description, Markdown text/credits, and additional gallery photos. The cover is the first gallery photo; additional photos follow the order in the CRM. Image descriptions are generated from the post title automatically. Keep published slugs unchanged to preserve shared links.

Only published posts with a cover image, category, slug, and a publication date at or before the current time appear on the website. Drafts stay hidden. Future-dated published posts become eligible when their date is reached, on the next page load. Posts are ordered newest first.
