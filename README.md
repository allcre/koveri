# koveri

AI-powered social discovery for meeting people with shared taste, projects, and context.

koveri builds a compatibility profile from a user's online presence — GitHub, Spotify, Letterboxd, Twitter/X, Substack, Steam, and optional photos — then turns that data into a swipeable discovery experience, messaging flow, and AI coach for profile improvements.

> Originally prototyped as `gemini-connect`; renamed and polished as **koveri**.

## Why it exists

Most social apps make people describe themselves from scratch. koveri explores a different flow: use public digital traces to surface concrete conversation starters like repos, music taste, film history, interests, and creative work.

The app can be aimed at different discovery goals, including:

- finding friends
- meeting potential dates
- finding hackathon or project collaborators

## Features

- **Guided onboarding** for basic info, platform usernames, profile goals, and photos.
- **Online-presence extraction** through a Supabase Edge Function proxy for Yellowcake.
- **AI profile generation** that turns extracted data into bios, prompt answers, highlights, fun facts, and data-backed insights.
- **Gemini-style profile coach** for conversational profile edits and optimization.
- **Swipeable discovery feed** with compatibility cards, prompts, match badges, and like/skip interactions.
- **Local messaging prototype** for starting conversations with discovered profiles.
- **Local-first demo state** using localStorage/IndexedDB for profile, matches, messages, and photos.

## Tech stack

**Frontend**

- React 18
- TypeScript
- Vite
- Tailwind CSS + shadcn/ui
- Framer Motion
- Recharts
- Vitest

**Backend / AI services**

- Supabase Edge Functions
- Yellowcake API for web extraction
- Lovable AI Gateway / Gemini model for profile generation and coaching

## Architecture

```text
User onboarding
  ├─ platform usernames + photos + discovery goal
  ↓
Yellowcake extraction proxy
  ├─ GitHub repos
  ├─ Spotify playlists/tracks
  ├─ Letterboxd films
  ├─ Twitter/X posts
  ├─ Substack posts
  └─ Steam games
  ↓
AI profile generation
  ├─ bio
  ├─ prompt answers
  ├─ fun facts
  ├─ data insights
  └─ best features
  ↓
Discovery + profile coach + messages
```

The frontend talks to Supabase Edge Functions instead of calling private APIs directly from the browser:

- `supabase/functions/yellowcake-proxy` keeps `YELLOWCAKE_API_KEY` server-side.
- `supabase/functions/generate-profile` generates profile content.
- `supabase/functions/coach-chat` powers the profile coaching chat.

## Getting started

### Prerequisites

- Node.js 18+
- npm
- A Supabase project if you want to run the Edge Function integrations

### Install

```bash
npm install
```

### Configure environment

Copy the example file:

```bash
cp .env.example .env
```

Set the frontend Supabase values:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

Server-side secrets should be configured in Supabase, not committed to this repo:

```bash
supabase secrets set YELLOWCAKE_API_KEY=...
supabase secrets set LOVABLE_API_KEY=...
```

### Run locally

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Test

```bash
npm test
```

### Lint

```bash
npm run lint
```

## Security notes

- `.env` is intentionally ignored and should never be committed.
- API keys for Yellowcake and AI providers belong in Supabase Edge Function secrets.
- This is a prototype; any production version should add authentication, database-backed authorization, rate limits, and privacy controls around extracted profile data.

## Project status

Prototype / portfolio project. The core product flow is implemented, but some data is still mocked or demo-oriented. The next polish pass would add real auth, production persistence, more tests, and deployment docs.

## My role

Solo implementation of the React/Vite frontend, onboarding flow, local data persistence, discovery UI, AI prompt system, profile coach, Supabase Edge Function integrations, and Yellowcake extraction flow.

## Future improvements

- Add authentication and real user-backed Supabase persistence.
- Replace remaining mock discovery data with generated or database-backed profiles.
- Add screenshots, a hosted demo link, and a short product walkthrough video.
- Add unit/integration tests for profile generation, local storage hooks, and messaging flows.
- Add privacy controls for imported data and user deletion/export flows.
