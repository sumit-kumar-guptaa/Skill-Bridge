# 🔧 Quick Server Start Guide

## Starting the Server

### Option 1: Via Terminal
```powershell
cd C:\Users\DELL\Desktop\Mini-Proj
npm run dev
```

### Option 2: Via New PowerShell Window (Recommended)
A new PowerShell window should have opened automatically with the server running.

## Checking Connection

1. **Wait 10-20 seconds** for Next.js to compile
2. Look for this message in the terminal:
   ```
   > Ready on http://localhost:3000
   ```

3. Open your browser to: `http://localhost:3000/collaborate`

4. Look for the **green "Connected"** badge at the top

## Troubleshooting

### If showing "Disconnected":

**Step 1**: Check if server is running
- Look for the PowerShell window that opened
- Should show "Ready on http://localhost:3000"

**Step 2**: Check for errors in terminal
- Look for red error messages
- Common issues:
  - Port 3000 already in use
  - Permission errors
  - Missing dependencies

**Step 3**: Restart the server
```powershell
# Close the running server (Ctrl+C)
# Delete .next folder
Remove-Item -Path ".next" -Recurse -Force

# Restart
npm run dev
```

**Step 4**: Check browser console
- Press F12 in browser
- Go to Console tab
- Look for Socket.IO connection errors

### If Port 3000 is already in use:

```powershell
# Find and kill the process using port 3000
$process = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
if ($process) { Stop-Process -Id $process -Force }

# Then restart server
npm run dev
```

### If dependencies are missing:

```powershell
npm install --legacy-peer-deps
npm run dev
```

## Expected Server Output

You should see:
```
> skill-bridge-pro@0.1.0 dev
> node server.js

  ▲ Next.js 14.2.15
  - Local:        http://localhost:3000

 ✓ Ready in 3.5s
```

## Testing the Connection

### Method 1: Use the test page
1. Open `test-socket.html` in your browser
2. Should show "Status: Connected ✅"
3. Try clicking "Create Room"

### Method 2: Browser Console
1. Go to `http://localhost:3000/collaborate`
2. Press F12 → Console tab
3. Should see: `✅ Connected to server, Socket ID: xxxxx`

## Common Issues

### Issue: "Disconnected" badge stays red
**Solution**: 
- Wait 10-20 seconds for server to fully start
- Refresh the page (Ctrl+R)
- Check server terminal for errors

### Issue: "Create Competition" button is gray
**Cause**: Socket.IO not connected
**Solution**: 
- Check the connection badge (should be green)
- Verify server is running
- Check browser console for errors

### Issue: Server crashes on start
**Solution**:
```powershell
# Clean install
Remove-Item -Path "node_modules" -Recurse -Force
Remove-Item -Path ".next" -Recurse -Force
npm install --legacy-peer-deps
npm run dev
```

## Environment Variables

Make sure `.env.local` exists with:
```bash
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
JDOODLE_CLIENT_ID=your_client_id
JDOODLE_CLIENT_SECRET=your_client_secret
GEMINI=your_gemini_key
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
TAVILY_API_KEY=your_tavily_key
```

## Still Not Working?

1. **Close ALL PowerShell windows**
2. **Restart VS Code**
3. **Open new terminal in VS Code**
4. **Run**:
```powershell
cd C:\Users\DELL\Desktop\Mini-Proj
npm run dev
```
5. **Wait for "Ready on http://localhost:3000"**
6. **Open browser**: `http://localhost:3000/collaborate`
7. **Check for green "Connected" badge**

## Success Indicators

✅ Server terminal shows "Ready on http://localhost:3000"
✅ Green "Connected" badge in browser
✅ Browser console shows "✅ Connected to server"
✅ "Create Competition" button is orange (not gray)
✅ No error messages in console

---

**Server is running in a separate PowerShell window. Check that window for logs!**
