# API Testing & Debugging Plan

## Current Status
- ✅ Working: `/health`, `/api/auth/login`
- ❌ Failing: All other endpoints (14 endpoints timing out)

## Root Cause
Database queries in repositories are using callback-based sqlite3 API wrapped in Promises, which may cause connection issues. The login endpoint works because it uses `await db.get()` directly from the `sqlite` library.

## Fix Plan

### Step 1: Fix Database Connection (database.ts)
- Ensure proper singleton pattern
- Add connection timeout handling
- Add verbose logging for debugging

### Step 2: Update Repositories to Use Async API
- Replace callback-based `database.all()` / `database.get()` with `await db.all()` / `await db.get()`
- Remove unnecessary Promise wrappers
- Add proper error handling

### Step 3: Test Fixed Endpoints
- Run comprehensive test to verify all endpoints work

## Files to Modify
1. `backend/src/infrastructure/database/database.ts`
2. `backend/src/infrastructure/repositories/ProductRepositoryImpl.ts`
3. `backend/src/infrastructure/repositories/CategoryRepositoryImpl.ts`
4. `backend/src/infrastructure/repositories/OrderRepositoryImpl.ts`

## Success Criteria
All 16 API endpoints should return 200 status within reasonable time (< 5000ms)

