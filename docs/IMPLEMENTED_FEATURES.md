# JustShowUp - Implemented Features & Project Status

## 🎯 App Concept
A 365-day journaling app where users write 50+ words daily to "forge" collectible weapon cards. Each week (7 days) = one weapon. More days completed = higher forge level (0-7).

---

## 🏗️ Tech Stack
| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Database** | Supabase PostgreSQL + Drizzle ORM |
| **Auth** | Supabase Auth (Google OAuth) |
| **Storage** | Supabase Storage (weapon assets) |
| **Hosting** | Vercel |
| **State** | Zustand (with localStorage persistence for drafts) |

---

## ✅ Features Working

| Feature | Status | Notes |
|---------|--------|-------|
| **Google OAuth Login** | ✅ Working | Auto-detects timezone at signup |
| **Journal Entry** | ✅ Working | 50-word minimum, upsert per day |
| **Word Counter** | ✅ Working | Real-time with circular progress ring |
| **Flip Card UI** | ✅ Working | Front=text area, Back=weapon image |
| **Weapon Assignment** | ✅ Working | Deterministic per user+week (seeded) |
| **Forge Level Tracking** | ✅ Working | 0-7 based on completed days |
| **Week Slider** | ✅ Working | Shows 7 days, highlights current |
| **Asset CDN** | ✅ Working | WebP images from Supabase Storage |
| **Lazy Finalization** | ✅ Working | Locks weapons when user enters new week |
| **Rate Limiting** | ✅ Working | 10 submissions/min |
| **Draft Autosave** | ✅ Working | Persisted to localStorage |

---

## 📂 Key File Locations

```
src/
├── app/
│   ├── (auth)/login/page.tsx     # Google OAuth login
│   ├── (main)/journal/           # Main journal page
│   ├── actions/auth.ts           # OAuth server actions
│   ├── actions/journal.ts        # Journal CRUD + stats
│   └── auth/callback/route.ts    # OAuth callback handler
├── components/
│   ├── ForgeCard.tsx             # Flip card with textarea
│   ├── WeekSlider.tsx            # 7-day navigation
│   └── Header.tsx                # Brand + day counter
├── db/
│   ├── schema.ts                 # Drizzle schema (users, entries, weapons)
│   └── index.ts                  # DB connection
├── lib/
│   ├── calendar.ts               # Day/week/quarter calculations
│   ├── weapon-assignment.ts      # Deterministic weapon selection
│   ├── word-count.ts             # Word counting utility
│   └── supabase/                 # Supabase client setup
└── stores/
    └── journal-store.ts          # Zustand state (draft, flip, etc.)
```

---

## 🗄️ Database Schema

**`users`**: id, email, timezone, journey_start_date, total_entries, total_words

**`journal_entries`**: user_id, day_number, week_number, content, word_count, is_complete

**`user_weapons`**: user_id, week_number, artifact_id, forge_level, completed_days[], is_finalized, final_forge_level

---

## 🔧 Environment Variables (Vercel)

```
NEXT_PUBLIC_SUPABASE_URL=https://kklbdggyxsvhmmocalvo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
DATABASE_URL=postgresql://postgres.[ref]:pw@pooler.supabase.com:6543/postgres
NEXT_PUBLIC_SITE_URL=https://justshowup-steel.vercel.app
```

---

## 🚧 Not Yet Implemented

- Armory page (view all collected weapons)
- Settings page (change timezone, logout button in UI)
- History view (read past entries)
- Onboarding flow for new users
- Push notifications / reminders
- Quarters 2-4 weapon assets
- "Ace" seasonal weapons (Week 13)

---

## 📋 Context Prompt for Next Chat

Copy and paste this at the start of a new conversation:

```
I'm continuing work on JustShowUp, a 365-day journaling app built with:
- Next.js 16 (App Router) + TypeScript
- Supabase (Auth, PostgreSQL, Storage)
- Drizzle ORM
- Zustand for client state
- Deployed on Vercel

Key concepts:
- Day 1 starts when user makes first entry (not signup)
- Week = 7-day block (Week 1 = Days 1-7)
- Each week, user forges a weapon by writing 50+ words daily
- Forge level = number of completed days (0-7)
- Weapons are deterministically assigned per user+week
- At week end, weapon is "finalized" with whatever forge level achieved

Current status:
- Google OAuth login works
- Journal entry submission works
- Forge card flip animation works
- Assets served from Supabase Storage (WebP)
- Rate limiting implemented

Project location: d:\50wordsdaily\Justshowup
GitHub: devashish-guliya/justshowup-app
Production: https://justshowup-steel.vercel.app
Supabase project: kklbdggyxsvhmmocalvo

What I need help with: [YOUR REQUEST HERE]
```
