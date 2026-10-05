# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (Next.js + Turbopack)
npm run build     # Production build
npm run lint      # ESLint
npm run start     # Run production server
```

No test suite is configured.

## Architecture Overview

**Coldmaily** is a cold email campaign tool built with Next.js 15 (App Router), React 19, and Tailwind CSS v4.

### URL Routing

Public URLs are shorter than the file-system paths. `next.config.mjs` rewrites:
- `/mails` → `/home/mails`
- `/campaign` → `/home/campaign`
- `/campaign/create` → `/home/campaign/create`
- `/campaign/:id` → `/home/campaign/:id`

The protected app shell lives under `app/home/` with its own layout (`app/home/layout.js`) that renders the sidebar and top header around every page.

### Authentication

Two layers:

1. **Middleware** (`middleware.js`) — edge-level cookie check. Reads `app_refresh_token` cookie; redirects unauthenticated users to `/unauthorized` and logged-in users away from `/` to `/home`.

2. **AuthContext** (`libapi/AuthContext.js`) — client-side context provider. Calls `/auth/verify` on mount to hydrate `{ user, loading, logout }`. Wrap pages in `<AuthProvider>` when components need `useAuth()`.

### API Layer (`libapi/`)

All backend calls go through helpers in `libapi/`. The base URL is `NEXT_PUBLIC_API_BASE_URL` (defaults to `http://localhost:8000`).

- `api.js` — core fetchers (`fetcher`, `postFetcher`, `putFetcher`, `DeleteFetcher`) plus `sendMailFormData` and `createCampaign` for multipart uploads. Contains automatic token-refresh logic: on any 401, a single shared promise calls `/auth/refresh`, retries the original request once, then redirects to login on failure.
- `mail.js` — mail CRUD + follow-up management.
- `dashboard.js` — dashboard stats, notifications, logout.

### State Management

[Zustand](https://zustand.pmnd.rs/) for global state, plain `useState` for local form/UI state.

- `app/home/mails/useMailStore.js` — tabs in the mail list page. Lazy-fetches each tab only when first opened; guards against duplicate in-flight requests.
- `app/home/dashboard/mailStore.js` — lightweight dashboard mail counts.
- `app/home/dashboard/useSendMail.js` — encapsulates the compose-mail form: state, file attachments, and the `handleSend` call. Used exclusively by `ComposeMailForm`.

### Key Shared Components

- `components/helper/ComposeMailForm.js` — floating Gmail-style compose window (fixed bottom-right). Uses `useSendMail` hook.
- `components/helper/RichTextEditor.js` — shared rich-text editor used in both `ComposeMailForm` and the campaign create page. Toolbar renders **at the bottom** (Gmail style). Uses `document.execCommand` internally. Accepts `value`, `onChange`, `name`, `placeholder`, `minHeight`, `className`.
- `components/helper/Sidebar.js` — app navigation sidebar.

### Campaign Flow

1. Create: `app/home/campaign/create/page.js` — multi-field form, CSV upload, `createCampaign()` API call → redirects to detail page.
2. Review: `app/home/campaign/[campaign_id]/page.jsx` — shows `ValidationPanel` (blocking errors), `EmailPreview`, `CampaignOverview`. Launch/pause/resume via `ActionButtons`.

### Environment

`.env.local`:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

`next.config.mjs` also allowlists `lh3.googleusercontent.com` for Google profile images and disables ESLint during `next build`.
