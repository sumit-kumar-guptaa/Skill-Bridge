# 🚀 Real-Time Competitive Coding Deployment Guide

## Overview
Your SkillBridge application now has **real-time competitive coding** where multiple users compete simultaneously. The first person to solve correctly wins credits, and others automatically receive the winning solution.

---

## ✅ What's Been Implemented

### 1. **Socket.IO WebSocket Server** (`server.js`)
- Custom Next.js server with Socket.IO integration
- Real-time room management
- Competition state tracking
- Winner detection & credit awarding
- Automatic solution distribution

### 2. **Competitive Collaborate Page** (`app/collaborate/page.tsx`)
- **Room Creation**: Random problem selection from problem bank
- **Real-Time Code Sync**: All participants see code changes instantly
- **Competition Logic**: First correct submission wins +20 credits
- **Winner Announcement**: Trophy banner and time-to-complete stats
- **Solution Provision**: Non-winners automatically receive winning solution
- **Live Chat**: Real-time messaging between competitors
- **Participant Tracking**: See who's in the room and who completed

### 3. **Solution Generation API** (`app/api/generate-solution/route.ts`)
- Uses Gemini AI to generate solutions
- Clean code output without markdown formatting
- Language-specific optimization

### 4. **Competition Features**
- ✅ 4 coding problems built-in (Two Sum, Reverse String, FizzBuzz, Palindrome)
- ✅ JDoodle API integration for code execution
- ✅ Real-time code synchronization
- ✅ First-solver gets +20 credits
- ✅ Others receive solution from winner
- ✅ Live participant list
- ✅ Chat system
- ✅ Problem description panel
- ✅ Test case validation

---

## 🔧 Current Configuration

### Environment Variables (`.env.local`)
```bash
# JDoodle API (Code Execution)
JDOODLE_CLIENT_ID=8d2e734bf1a3efe6fde196d3d7706593
JDOODLE_CLIENT_SECRET=62ea356be71da2bf306e894ed15e2280e8cea024c15dc2ff2b7d39f9614351e7

# Gemini API (Code Review & Solutions)
GEMINI=AIzaSyCrRzD9h3XKGrkE_C33gGVksj0zwl4QL4Q
NEXT_PUBLIC_GEMINI_API_KEY=AIzaSyCrRzD9h3XKGrkE_C33gGVksj0zwl4QL4Q

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_cHJlbWl1bS1wZW5ndWluLTM1LmNsZXJrLmFjY291bnRzLmRldiQ
CLERK_SECRET_KEY=sk_test_W6NuIj1wQ3WNakUwtH7ifbydj3GlAaE318hVvpYcGy

# MCP (Tavily Search)
TAVILY_API_KEY=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
```

### Package.json Scripts
```json
{
  "scripts": {
    "dev": "node server.js",
    "start": "node server.js",
    "build": "next build"
  }
}
```

---

## 🎮 How to Use

### Running Locally
```bash
# Install dependencies (if not already done)
npm install

# Start development server with Socket.IO
npm run dev
```

Server runs on: `http://localhost:3000`

### Testing Real-Time Competition

1. **Open 2 Browser Windows**:
   - Window 1: `http://localhost:3000/collaborate`
   - Window 2: `http://localhost:3000/collaborate` (incognito or different profile)

2. **Create Competition** (Window 1):
   - Click "Start Competition"
   - Copy the Room ID (e.g., `ABC123`)
   - Problem is randomly selected

3. **Join Competition** (Window 2):
   - Click "Join Competition"
   - Enter the Room ID from Window 1
   - Click "Join Competition"

4. **Compete**:
   - Both windows show same problem
   - Type code in editor (syncs real-time)
   - Click "Run & Submit"
   - First correct solution wins +20 credits
   - Loser automatically receives winner's solution

---

## 🌐 Deployment Options

### Option 1: Vercel (Recommended for Static Parts)
⚠️ **Issue**: Vercel doesn't support WebSocket servers on hobby plan

**Workaround**: Use separate WebSocket service
1. Deploy Next.js to Vercel (frontend + API routes)
2. Deploy Socket.IO server to Railway/Render/Heroku
3. Update Socket.IO connection URL in `collaborate/page.tsx`:
   ```typescript
   socketRef.current = io('https://your-socket-server.com', {
     transports: ['websocket'],
   });
   ```

### Option 2: Railway (Supports WebSockets)
✅ **Best for full-stack with WebSockets**

**Steps**:
1. Create account at [railway.app](https://railway.app)
2. Install Railway CLI:
   ```bash
   npm i -g @railway/cli
   ```
3. Login and deploy:
   ```bash
   railway login
   railway init
   railway up
   ```
4. Add environment variables in Railway dashboard
5. Configure PORT environment variable:
   ```bash
   railway variables set PORT=3000
   ```

### Option 3: Render (Free Tier Available)
✅ **Free with WebSocket support**

**Steps**:
1. Create account at [render.com](https://render.com)
2. Create new "Web Service"
3. Connect GitHub repository
4. Configure:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Add environment variables from `.env.local`
6. Deploy

### Option 4: DigitalOcean App Platform
✅ **Full control, scalable**

**Steps**:
1. Create App from GitHub repo
2. Set build/start commands
3. Add environment variables
4. Configure health checks
5. Deploy

### Option 5: Custom VPS (AWS EC2, DigitalOcean Droplet)
✅ **Maximum control**

**Steps**:
1. Setup Ubuntu server
2. Install Node.js 20+:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```
3. Clone repository
4. Install dependencies:
   ```bash
   npm install --production
   ```
5. Create `.env.local` with credentials
6. Install PM2 for process management:
   ```bash
   npm install -g pm2
   pm2 start server.js --name skillbridge
   pm2 save
   pm2 startup
   ```
7. Configure Nginx reverse proxy (optional)
8. Setup SSL with Let's Encrypt

---

## 🔒 Production Considerations

### 1. **Database Integration** (REQUIRED for Scale)
Current limitation: Room state is in-memory (lost on restart)

**Recommended**: Use Redis for session storage
```bash
npm install redis ioredis
```

Update `server.js`:
```javascript
const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL);

// Store rooms in Redis
await redis.set(`room:${roomId}`, JSON.stringify(room));
```

### 2. **WebSocket URL Configuration**
For production, update Socket.IO connection:
```typescript
// app/collaborate/page.tsx
const SOCKET_URL = process.env.NODE_ENV === 'production' 
  ? process.env.NEXT_PUBLIC_SOCKET_URL 
  : 'http://localhost:3000';

socketRef.current = io(SOCKET_URL, {
  transports: ['websocket', 'polling'], // Fallback to polling
});
```

Add to `.env.local`:
```bash
NEXT_PUBLIC_SOCKET_URL=https://your-production-url.com
```

### 3. **Rate Limiting**
Protect API routes:
```bash
npm install express-rate-limit
```

### 4. **CORS Configuration**
Update `server.js`:
```javascript
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: [
      'https://your-domain.com',
      'https://www.your-domain.com'
    ],
    methods: ['GET', 'POST'],
    credentials: true
  }
});
```

### 5. **Monitoring**
- Use Railway/Render built-in logs
- Add error tracking (Sentry):
  ```bash
  npm install @sentry/node
  ```

---

## 🧪 Testing Checklist

### Local Testing
- [ ] Start server: `npm run dev`
- [ ] Create room in browser 1
- [ ] Join room in browser 2
- [ ] Type code in browser 1, see it sync in browser 2
- [ ] Submit correct solution in browser 1
- [ ] Verify winner banner appears
- [ ] Verify +20 credits awarded (check localStorage)
- [ ] Verify browser 2 receives solution
- [ ] Test chat messages
- [ ] Test leave room functionality

### Production Testing
- [ ] Deploy to chosen platform
- [ ] Test with 2+ users from different networks
- [ ] Verify WebSocket connection works
- [ ] Check environment variables loaded correctly
- [ ] Test JDoodle API calls work
- [ ] Test Gemini API calls work
- [ ] Verify credits persist
- [ ] Test room cleanup on disconnect

---

## 🐛 Troubleshooting

### WebSocket Connection Failed
**Error**: `WebSocket connection to 'ws://localhost:3000' failed`

**Solutions**:
1. Ensure server started with `npm run dev` (not `next dev`)
2. Check firewall allows port 3000
3. Verify Socket.IO version matches client/server
4. Check browser console for CORS errors

### Credits Not Saving
**Issue**: Credits reset on page reload

**Cause**: Currently uses localStorage (client-side only)

**Solution**: Implement database storage
```javascript
// Update progressTracker.ts to call API
await fetch('/api/progress/update', {
  method: 'POST',
  body: JSON.stringify({ credits: newCredits })
});
```

### Code Not Syncing
**Check**:
1. Socket connection established (console logs)
2. Both users in same room ID
3. `handleCodeChange` function called on typing
4. Network tab shows WebSocket frames

### Room Not Found
**Issue**: User can't join room

**Solutions**:
1. Verify room ID entered correctly (case-sensitive)
2. Check room creator didn't leave (room deleted)
3. Check server logs for room creation event

---

## 📊 MCP Server Status

### Current Configuration
- **Status**: ✅ Properly configured
- **Transport**: stdio
- **Port**: N/A (uses stdin/stdout)
- **Credentials**: All set in `.env.local`

### MCP Tools Available
1. `get_user_progress` - Retrieve user stats
2. `get_problem_details` - Get problem info
3. `search_problems` - Find problems by criteria
4. `execute_code` - Run code via JDoodle
5. `analyze_code_patterns` - Code analysis
6. `get_learning_path` - Personalized recommendations
7. `track_submission` - Record submissions
8. `get_best_practices` - Language-specific tips

### Testing MCP
```bash
# Run MCP server
npm run mcp:server

# Test MCP (separate terminal)
npm run mcp:test
```

### MCP Integration with Compete
MCP can be used for:
- Analyzing winner's solution quality
- Providing personalized problem recommendations
- Tracking competition performance
- Generating AI hints during competition

---

## 🎯 Next Steps (Optional Enhancements)

### Short-Term
- [ ] Add more coding problems (current: 4, goal: 20+)
- [ ] Implement Redis for persistent room state
- [ ] Add countdown timer for competitions
- [ ] Show real-time typing indicators
- [ ] Add problem difficulty selection

### Medium-Term
- [ ] Leaderboard for competition wins
- [ ] Tournament mode (bracket-style)
- [ ] Video chat integration (WebRTC)
- [ ] Screen sharing for debugging
- [ ] Private rooms with passwords

### Long-Term
- [ ] Database migration (PostgreSQL/MongoDB)
- [ ] Email notifications for competition invites
- [ ] Mobile app (React Native)
- [ ] AI-powered hint system during competition
- [ ] Analytics dashboard for teachers

---

## 📞 Support

### If Issues Arise During Deployment:

1. **Check Logs**:
   - Railway: `railway logs`
   - Render: Dashboard > Logs tab
   - PM2: `pm2 logs skillbridge`

2. **Verify Environment Variables**:
   ```bash
   # In production environment
   echo $JDOODLE_CLIENT_ID
   echo $GEMINI
   ```

3. **Test API Routes**:
   ```bash
   curl https://your-domain.com/api/judge0
   curl https://your-domain.com/api/generate-solution
   ```

4. **WebSocket Health Check**:
   Open browser console and check Socket.IO connection:
   ```javascript
   socket.connected // Should be true
   socket.id // Should show socket ID
   ```

---

## 🎉 Success Metrics

Your deployment is successful when:
- ✅ 2+ users can join same room
- ✅ Code syncs between all participants in real-time
- ✅ First correct submission triggers winner event
- ✅ Credits awarded to winner
- ✅ Solution provided to others
- ✅ Chat works between participants
- ✅ Room persists until all users leave
- ✅ No crashes under normal load

---

**Ready to Deploy?** Choose a platform from Deployment Options and follow the steps!

**Testing Locally First?** Run `npm run dev` and open two browser windows to `http://localhost:3000/collaborate`
