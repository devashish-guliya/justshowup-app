# JustShowUp - Daily Journaling App

> **"Write 50 words. Forge your weapon. Just show up."**

JustShowUp is a gamified daily journaling app that transforms your consistency into a collection of beautifully illustrated mystical weapons.

## 🎯 Features

- **50 Words Daily**: Write just 50 words to complete your daily entry
- **Weapon Forging**: Each completed day reveals more of your weekly weapon
- **7-Day Cycle**: Complete 7 days to fully forge your weapon
- **52 Weapons**: Collect a full year's worth of unique weapons
- **No Shame Mechanics**: Missed days don't penalize you - just continue when you can
- **Beautiful UI**: Card-flip interactions with smooth animations
- **PWA Support**: Install as a mobile app

## 🚀 Quick Start

### Demo Mode (No Database Required)

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000/demo](http://localhost:3000/demo) to see the demo

### Full Setup (With Supabase)

1. Create a Supabase project at [supabase.com](https://supabase.com)

2. Copy `.env.example` to `.env.local` and fill in your credentials:
```bash
cp .env.example .env.local
```

3. Run database migrations:
```bash
npm run db:push
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
justshowup/
├── public/
│   ├── weapons/           # Weapon image assets (day0-day7 for each)
│   ├── icons/             # PWA icons
│   └── manifest.json      # PWA manifest
├── src/
│   ├── app/
│   │   ├── (auth)/        # Login/Signup pages
│   │   ├── (main)/        # Protected pages (journal, armory)
│   │   ├── actions/       # Server actions
│   │   └── demo/          # Demo page (no auth required)
│   ├── components/        # React components
│   ├── data/              # Weapon metadata
│   ├── db/                # Drizzle schema
│   ├── lib/               # Utilities
│   └── stores/            # Zustand stores
└── drizzle/               # Database migrations
```

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **ORM**: Drizzle ORM
- **Auth**: Supabase Auth
- **State**: Zustand
- **Styling**: Tailwind CSS + Custom CSS
- **PWA**: next-pwa

## 📊 Database Schema

### Users
- `id`: UUID (linked to Supabase Auth)
- `email`: User's email
- `timezone`: IANA timezone (e.g., "America/New_York")
- `journeyStartDate`: Start of their 365-day journey
- `totalEntries`, `totalWords`: Stats

### Journal Entries
- `dayNumber`: 1-365 (position in journey)
- `weekNumber`: 1-52
- `content`: The journal text
- `wordCount`: Number of words
- `isComplete`: True if >= 50 words

### User Weapons
- `weekNumber`: Which week this weapon is for
- `artifactId`: Reference to weapon metadata
- `forgeLevel`: 0-7 (how many days completed)
- `completedDays`: Array of 7 booleans
- `isFinalized`: Locked after week ends

## 🎨 Weapon System

### Forge Levels
| Days | Level | Progress |
|------|-------|----------|
| 0 | 0 | 0% (Sketch) |
| 1 | 1 | 14% |
| 2 | 2 | 28% |
| 3 | 3 | 42% |
| 4 | 4 | 57% |
| 5 | 5 | 71% |
| 6 | 6 | 85% |
| 7 | 7 | 100% (Full) |

### Rarity Pattern (per quarter)
- Week 1, 2, 5, 6, 9, 10: **Common**
- Week 3, 7, 11: **Uncommon**
- Week 4, 8, 12: **Rare**
- Week 13: **Ace** (special)

## 🔧 Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Run ESLint
npm run db:push   # Push schema to database
npm run db:studio # Open Drizzle Studio
```

## 📝 Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Database
DATABASE_URL=postgres://...

# Cron (for week finalization)
CRON_SECRET=your_secret
```

## 🎯 Philosophy

**"Just Show Up"**

The name embodies the entire philosophy:
- You don't need inspiration
- You don't need perfection
- You don't need motivation

You just need to **show up** for 2-3 minutes and write 50 words.

The weapon is proof that you did. The collection is proof that you kept going.

---

Built with ❤️ for consistent creators.
