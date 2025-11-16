# 🚀 Quick Start Guide - Real-Time Competitive Coding

## ⚡ Get Started in 5 Minutes

### Step 1: Install Dependencies
```bash
cd c:\Users\DELL\Desktop\Mini-Proj
npm install
```

### Step 2: Start the Server
```bash
npm run dev
```

You'll see:
```
> Ready on http://localhost:3000
✅ Client connected: [socket-id]
```

### Step 3: Test Competition (2 Browsers)

#### Browser 1 (Chrome):
1. Open `http://localhost:3000/collaborate`
2. Click **"Start Competition"**
3. Copy the Room ID (e.g., `ABC123`)

#### Browser 2 (Incognito/Firefox):
1. Open `http://localhost:3000/collaborate`
2. Click **"Join Competition"**
3. Enter Room ID: `ABC123`
4. Click **"Join Competition"**

### Step 4: Compete!

Both browsers now show the same problem (randomly selected).

**Browser 1**:
```javascript
// Type solution
function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}
```

**Browser 2**: Sees the code update in real-time! ✨

**Browser 1**: Click **"Run & Submit"**

**Result**:
- ✅ Tests pass
- 🏆 Winner banner appears in both browsers
- 💰 Browser 1 gets +20 credits
- 💡 Browser 2 receives the solution automatically

---

## 🎯 What You Just Learned

### Real-Time Features
- ✅ Socket.IO WebSocket connection
- ✅ Room creation with unique ID
- ✅ Multi-user synchronization
- ✅ Code sync between participants
- ✅ Winner detection (first correct)
- ✅ Auto-solution provision to losers
- ✅ Credit system integration

### Technical Stack
- **Frontend**: Next.js + Socket.IO Client
- **Backend**: Custom Node.js server + Socket.IO Server
- **Code Execution**: JDoodle API
- **AI**: Gemini API (for solution generation)
- **Auth**: Clerk

---

## 🔥 Try These Features

### 1. Live Chat
Type messages in the chat panel → Appears instantly in all browsers

### 2. Multiple Participants
Open 3+ browsers, all join the same room → Everyone sees the same code

### 3. Leave and Rejoin
Click back arrow to leave → Room persists for others

### 4. Different Problems
Create new room → Different problem selected randomly

---

## 🐛 Common Issues

### "WebSocket connection failed"
**Problem**: Server not running with Socket.IO

**Solution**:
```bash
# Stop any running process
# Press Ctrl+C

# Restart with correct command
npm run dev  # NOT `next dev`
```

### "Room not found"
**Problem**: Room ID typo or creator left

**Solution**:
- Double-check Room ID (case-sensitive)
- Creator must stay in room
- Create new room if old one expired

### "Code not syncing"
**Problem**: Socket.IO disconnected

**Solution**:
- Check browser console for Socket.IO logs
- Look for "✅ Client connected" message
- Refresh page if disconnected

---

## 📊 Check Your Progress

### View Credits
```javascript
// Open browser console
JSON.parse(localStorage.getItem('progress'))
// Should show: { credits: 20, ... }
```

### Socket Status
```javascript
// In browser console
window._socket?.connected  // Should be true
window._socket?.id         // Your socket ID
```

### Active Rooms
Check server console:
```
🏠 Room ABC123 created by John
👤 Jane joined room ABC123
🏆 John won room ABC123
```

---

## 🎓 Next Steps

### Add More Problems
Edit `app/collaborate/page.tsx`:
```javascript
const competitionProblems = [
  // ... existing problems
  {
    id: 5,
    title: "Your Problem",
    description: "Problem description",
    examples: [...],
    testCases: [...]
  }
];
```

### Deploy to Production
See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

### Customize Credits
Edit credit rewards:
```javascript
// server.js, line ~120
io.to(roomId).emit('winner-declared', {
  winner: {
    // Change credit amount here
    credits: 50  // Was 20
  }
});
```

---

## 🔧 Advanced Configuration

### Change Socket.IO Port
```javascript
// server.js
const port = parseInt(process.env.PORT || '3001', 10);
```

Update `.env.local`:
```bash
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

### Add Redis (Persistent Rooms)
```bash
npm install redis ioredis
```

Update `server.js`:
```javascript
const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL);

// Save room to Redis
redis.set(`room:${roomId}`, JSON.stringify(room));
```

### Enable Debug Logs
```bash
# Windows PowerShell
$env:DEBUG="socket.io*"; npm run dev

# Linux/Mac
DEBUG=socket.io* npm run dev
```

---

## 📚 Documentation

- **Full Deployment Guide**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **Socket.IO Events**: [SOCKETIO_REFERENCE.md](./SOCKETIO_REFERENCE.md)
- **Project README**: [COMPETITIVE_README.md](./COMPETITIVE_README.md)
- **MCP Integration**: [MCP_DOCUMENTATION.md](./MCP_DOCUMENTATION.md)

---

## ✅ Verification Checklist

Test everything works:

- [ ] Server starts with `npm run dev`
- [ ] No TypeScript errors
- [ ] Browser 1 can create room
- [ ] Browser 2 can join room
- [ ] Code syncs between browsers
- [ ] Run & Submit executes code
- [ ] Winner declared correctly
- [ ] Credits awarded (+20)
- [ ] Solution provided to loser
- [ ] Chat messages work
- [ ] Leave room works
- [ ] Server logs show events

---

## 🎉 Success!

You now have a **production-ready real-time competitive coding platform**!

### What's Working:
✅ WebSocket server with Socket.IO
✅ Real-time code synchronization
✅ Competition logic (first solver wins)
✅ Credit system (+20 for winners)
✅ Auto-solution for losers
✅ Live chat
✅ Room management
✅ Multi-language support
✅ JDoodle API integration
✅ Gemini AI integration
✅ Clerk authentication
✅ MCP server
✅ All credentials configured

### Ready to Deploy?
Follow [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for:
- Railway deployment (recommended)
- Render deployment (free tier)
- Vercel + separate WebSocket
- Custom VPS setup

---

**Happy Coding! 🚀**

Need help? Check the troubleshooting section or open an issue.
