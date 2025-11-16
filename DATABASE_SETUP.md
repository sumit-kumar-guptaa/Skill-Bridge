# 🚀 Database Setup Guide

## Overview
This project now uses **Neon PostgreSQL** for persistent data storage with **Stack Auth** for authentication.

## ✅ What's Configured
- **Neon PostgreSQL** database connection
- **Stack Auth** authentication credentials
- Database schema with 10 tables
- API routes for database operations
- Server-side database integration for rooms
- Progress tracking with database sync

---

## 📋 Quick Setup (5 minutes)

### Step 1: Initialize Database
Run this command to create all tables in your Neon database:

```bash
# Initialize database schema
npx tsx scripts/init-db.ts
```

Or visit this URL after starting your server:
```
POST http://localhost:3000/api/db/init
```

### Step 2: Verify Database Connection
```bash
# Check if database is accessible
curl http://localhost:3000/api/db/leaderboard
```

### Step 3: Start the Server
```bash
npm run dev
```

---

## 🗄️ Database Schema

### Tables Created:

#### 1. **users** - User profiles
- `id` (VARCHAR) - Primary key (Stack Auth user ID)
- `email` (VARCHAR) - Unique email
- `username` (VARCHAR) - Display username
- `display_name` (VARCHAR) - Full name
- `avatar_url` (TEXT) - Profile picture
- `total_solved` (INTEGER) - Problems solved count
- `success_rate` (DECIMAL) - % of successful attempts
- `current_streak` (INTEGER) - Current daily streak
- `max_streak` (INTEGER) - Longest streak achieved
- `credits` (INTEGER) - Gamification points
- `total_competitions` (INTEGER) - Competitions joined
- `competitions_won` (INTEGER) - Competitions won

#### 2. **problems** - Coding problems
- `id` (SERIAL) - Auto-incrementing primary key
- `title`, `slug`, `difficulty`, `description`
- `examples`, `constraints`, `test_cases` (JSONB)
- `topics`, `hints` (TEXT[])
- `solution_template` (JSONB)

#### 3. **submissions** - User code submissions
- Links to `users` and `problems`
- Stores `code`, `language`, `status`, `test_results`
- Tracks `runtime`, `memory`, `is_accepted`

#### 4. **competition_rooms** - Active competitions
- `id` (VARCHAR) - Room code
- Links to `problems`, `creator_id`, `winner_id`
- Tracks `status`, `start_time`, `end_time`, `participant_count`

#### 5. **room_participants** - Competition participants
- Links to `competition_rooms` and `users`
- Tracks `joined_at`, `completed`, `is_winner`, `final_code`

#### 6. **user_progress** - Solved problems tracking
- Links to `users` and `problems`
- Tracks `solved_at`, `language`, `credits_earned`

#### 7. **achievements** - Achievement definitions
- `name`, `description`, `badge_icon`
- `criteria` (JSONB), `credits_reward`

#### 8. **user_achievements** - Earned achievements
- Junction table linking `users` and `achievements`

#### 9. **room_messages** - Competition chat
- Links to `competition_rooms` and `users`
- Stores `message`, `is_system`, `created_at`

#### 10. **leaderboard_cache** - Leaderboard rankings
- Materialized view for performance
- Ranks users by `total_credits`, `problems_solved`, etc.

---

## 🔌 API Routes

### User Management
```bash
# Get user
GET /api/db/users?userId=<user_id>

# Create/update user
POST /api/db/users
{
  "id": "user_123",
  "email": "user@example.com",
  "username": "john_doe"
}

# Update progress
PATCH /api/db/users
{
  "userId": "user_123",
  "total_solved": 10,
  "credits": 150
}
```

### Submissions
```bash
# Get user submissions
GET /api/db/submissions?userId=<user_id>&limit=10

# Save submission
POST /api/db/submissions
{
  "user_id": "user_123",
  "problem_id": 1,
  "code": "function solve() {...}",
  "language": "javascript",
  "status": "accepted",
  "is_accepted": true
}
```

### Leaderboard
```bash
# Get top users
GET /api/db/leaderboard?limit=100
```

---

## 🔄 Data Flow

### Competition Room Lifecycle:
1. **Create Room** → Saves to `competition_rooms` + `room_participants`
2. **Join Room** → Adds to `room_participants`, updates participant count
3. **Submit Solution** → Saves to `submissions`, checks for winner
4. **Winner Declared** → Updates `competition_rooms.winner_id`, awards credits
5. **Chat Messages** → Saved to `room_messages` in real-time

### Progress Tracking:
1. **Solve Problem** → `saveProblemAttempt()` called
2. **Check Database** → Tries to save to Neon via `/api/db/users`
3. **Fallback** → If database fails, uses localStorage
4. **Sync** → Call `syncLocalToDatabase()` to migrate localStorage → DB

---

## 🔐 Stack Auth Integration

### Environment Variables (Already Configured):
```bash
NEXT_PUBLIC_STACK_PROJECT_ID=b23a036a-3503-4ef8-84c3-5c08481f1d3b
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=pck_m3022psv2t68tmnxtj3pn521d69ggh4jgtsafhyj5swnr
STACK_SECRET_SERVER_KEY=ssk_828c0848mmb4bmhk6f430q5wecm9bbrdpdbbb9yve58mr
STACK_JWKS_URL=https://api.stack-auth.com/api/v1/projects/b23a036a-3503-4ef8-84c3-5c08481f1d3b/.well-known/jwks.json
```

### Next Steps (Optional):
- Replace Clerk imports with Stack Auth in `app/collaborate/page.tsx`
- Update `useAuth()` and `useUser()` hooks
- Stack Auth docs: https://docs.stack-auth.com/

---

## ✨ Features Now Persistent:

### ✅ Before Database:
- ❌ Room state lost on server restart (Map)
- ❌ Credits only in localStorage (device-specific)
- ❌ No competition history
- ❌ No leaderboards
- ❌ Can't scale to multiple servers

### ✅ After Database:
- ✅ Rooms persist across restarts
- ✅ Credits synced across devices
- ✅ Full competition history
- ✅ Global leaderboards
- ✅ Multi-instance ready
- ✅ Chat history saved
- ✅ Achievements tracking

---

## 🧪 Testing

### 1. Test Database Connection:
```bash
npx tsx -e "import {sql} from '@neondatabase/serverless'; const db = sql(process.env.DATABASE_URL); db\`SELECT NOW()\`.then(console.log)"
```

### 2. Test User Creation:
```bash
curl -X POST http://localhost:3000/api/db/users \
  -H "Content-Type: application/json" \
  -d '{"id":"test_user","email":"test@example.com","username":"tester"}'
```

### 3. Test Room Persistence:
1. Create a competition room in `/collaborate`
2. Restart the server (`Ctrl+C`, then `npm run dev`)
3. Check database: Room should still exist in `competition_rooms` table

---

## 🚨 Troubleshooting

### "Database connection failed"
- Check `DATABASE_URL` in `.env.local`
- Verify Neon database is active
- Test connection: `psql $DATABASE_URL`

### "Tables not created"
- Run: `npx tsx scripts/init-db.ts`
- Or visit: `POST http://localhost:3000/api/db/init`

### "API routes return 500"
- Check server logs for detailed errors
- Verify all environment variables are set
- Restart server after `.env.local` changes

### "Progress not syncing"
- Call `progressTracker.syncLocalToDatabase(userId)` manually
- Check browser console for API errors
- Verify user exists in database

---

## 📊 Database Indexes

Performance optimizations already created:
- `idx_submissions_user_id` - Fast user submission queries
- `idx_submissions_problem_id` - Fast problem stats
- `idx_room_participants_room_id` - Fast room member lists
- `idx_user_progress_user_id` - Fast progress lookups
- `idx_room_messages_room_id` - Fast chat history
- `idx_competition_rooms_status` - Fast active room queries

---

## 🔮 Next Steps

1. **Replace Clerk with Stack Auth** (Optional)
   - Update `app/collaborate/page.tsx`
   - Update `app/layout.tsx`
   - Update `app/progress/page.tsx`

2. **Add More Features**
   - Leaderboard page (`/leaderboard`)
   - User profiles (`/profile/[userId]`)
   - Competition history (`/history`)
   - Achievement badges display

3. **Deploy to Production**
   - Railway: Automatic DATABASE_URL injection
   - Vercel: Add DATABASE_URL to environment variables
   - Render: PostgreSQL addon available

---

## 📝 Summary

Your database is now configured with:
- ✅ 10 tables for users, problems, competitions, chat
- ✅ 4 API routes for CRUD operations
- ✅ Server.js integrated with database
- ✅ Progress tracker with database sync
- ✅ Migration script for localStorage → DB
- ✅ Stack Auth credentials configured

**To start using:** Just run `npx tsx scripts/init-db.ts` and then `npm run dev`! 🎉
