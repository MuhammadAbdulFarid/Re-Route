# TODO: Fix Web - Server Startup & Testing

## Current Status: Starting...

### 1. [ ] Setup Environment

- Check/create backend/.env with GEMINI_API_KEY, SUPABASE_URL, SUPABASE_KEY
- Verify Prisma migration: cd backend && npx prisma migrate dev

### 2. [x] Start Backend Server ✅

- cd backend
- npm run dev OR backend/run-server.bat
- Verify: http://localhost:3001/api/health → OK

### 3. [x] Test Search Functionality ✅ (Server & retry logic OK)

- node backend/test-search.js → Responds (Gemini key leaked 403 - expected)
- /api/search/health → gemini/supabase configured
- TODO_SEARCH_FIX.md #3 [x] - No more crashes!

### 4. [ ] Start Frontend Dev Server

- cd frontend
- npm run dev
- Verify: http://localhost:5173 → App loads
- **Tip Windows:** In VSCode terminal: cd frontend, then npm run dev

### 5. [ ] Full App Test

- Register/Login → Admin Dashboard
- Test routes: /admin/marketplace, /admin/chat, etc.
- Submit test return → AI analysis → Chat

### 6. [ ] Final Verification

- Update all TODOs [x]
- Mark project ready

**Next step after each: Update this file with [x]**
