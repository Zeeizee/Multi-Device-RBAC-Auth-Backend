# Multi-Device RBAC Auth Backend

A production-grade authentication backend built with Node.js, Express, TypeScript, and MongoDB. Implements multi-device session management, refresh token rotation with reuse detection, role-based access control (RBAC), rate limiting, and immutable audit logging.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Setup](#setup)
- [Scripts](#scripts)
- [API Reference](#api-reference)
  - [Auth Routes](#auth-routes)
  - [User Routes](#user-routes)
  - [Device Routes](#device-routes)
  - [Audit Routes](#audit-routes)
- [Authentication Flow](#authentication-flow)
- [Security Features](#security-features)
- [Deployment](#deployment)

---

## Features

### Authentication
- User signup with role assignment (admin / manager / user)
- Login with short-lived access token (15 min) + long-lived refresh token (7 days)
- Logout from current device (clears cookies + deletes device session)
- Logout from all devices (deletes all device sessions for a user)
- Password change with old password verification

### Multi-Device Session Management
- Each login creates a unique device session record (`deviceId`, `IP`, `userAgent`, `lastActive`)
- A single user can be logged in from multiple devices simultaneously
- Independent session lifecycle per device
- View all active devices for the logged-in user

### Refresh Token Rotation + Reuse Detection
- Every successful refresh issues a new refresh token and invalidates the old one in the database
- If an already-used (rotated) refresh token is presented again, the system treats it as a token theft attempt and **logs the user out from all devices** automatically
- Cookies cleared and `logoutRequired: true` flag returned to the client

### Role-Based Access Control (RBAC)
- Three roles: `admin`, `manager`, `user`
- Role-aware middleware (`accessRolesMiddleware`) for granular endpoint protection
- Test endpoints: `/admin/test`, `/manager/test`, `/profile` (via `/`)

### Rate Limiting
- Global rate limiter applied at the app level
- Default: 100 requests per 15 minutes per IP
- Configurable per route via `rateLimiterMiddleware({ time, max })`
- Returns standardized `429 Too Many Requests` response

### Audit Logging
- Immutable log of 4 critical actions: `login`, `logout`, `refresh_token`, `password_change`
- Captures `userId`, `action`, `IP`, `deviceId`, `userAgent`, `timestamp`
- Device details preserved in the audit log even after the device session is deleted
- User-facing endpoint to view own history
- Admin endpoint with filters (action, userId, date range) and pagination

### Validation
- Zod-based request body validation via `validate(schema)` middleware
- Field-level error messages returned with HTTP `400`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js (>= 18) |
| Language | TypeScript |
| Framework | Express 5 |
| Database | MongoDB (Mongoose) |
| Auth | JSON Web Tokens (JWT) |
| Password Hashing | bcrypt |
| Validation | Zod |
| Rate Limiting | express-rate-limit |
| Cookies | cookie-parser |
| CORS | cors |
| Dev Runtime | tsx (production runtime via `tsx src/server.ts`) |

---

## Project Structure

```
src/
├── app.ts                          # Express app + middlewares + route mounting
├── server.ts                       # Bootstrap: DB connect + app.listen
├── dotenvConfig.ts                 # Centralized env config
├── database/
│   └── db.ts                       # Mongoose connection
├── modules/
│   ├── auth/                       # Signup, login, logout, refresh
│   ├── user/                       # Profile, change password, RBAC test routes
│   ├── device/                     # Device sessions, list, logout one/all
│   └── audit/                      # Immutable audit log + history endpoints
└── shared/
    ├── constants/
    │   └── userRoles.ts            # USER_ROLES enum
    ├── middlewares/
    │   ├── authMiddleware.ts       # verifyAuth (JWT + device session check)
    │   ├── accessRolesMiddleware.ts# RBAC role gate
    │   ├── validateMiddleware.ts   # Zod validator factory
    │   └── rateLimit.ts            # Rate limiter factory
    └── utils/
        ├── auth.ts                 # bcrypt hashPassword
        └── jwt.ts                  # access/refresh token sign + verify
```

---

## Environment Variables

Create a `.env` file in the project root with the following variables:

| Key | Required | Description | Example |
|---|---|---|---|
| `PORT` | No | Port the server listens on | `3000` |
| `MONGODB_URI` | Yes | MongoDB connection string (include database name) | `mongodb+srv://user:pass@cluster0.xxx.mongodb.net/authapp?retryWrites=true&w=majority` |
| `JWT_ACCESS_SECRET` | Yes | Secret used to sign access tokens | `<strong-random-string>` |
| `JWT_REFRESH_SECRET` | Yes | Secret used to sign refresh tokens (must differ from access secret) | `<another-strong-random-string>` |
| `JWT_ACCESS_EXPIRES_IN` | No | Access token expiry (currently hardcoded to `15m` in `jwt.ts`) | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | No | Refresh token expiry (currently hardcoded to `7d` in `jwt.ts`) | `7d` |
| `FRONTEND_URL` | No | CORS-allowed origin | `https://your-frontend.com` |
| `NODE_ENV` | No | Environment mode (controls cookie `secure` flag) | `production` |

### Example `.env`

```env
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/authapp?retryWrites=true&w=majority
JWT_ACCESS_SECRET=replace-with-strong-random-string
JWT_REFRESH_SECRET=replace-with-different-strong-random-string
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

---

## Setup

### Prerequisites

- Node.js 18 or higher
- MongoDB instance (local or Atlas)

### Installation

```bash
git clone <repo-url>
cd Multi-Device-RBAC-Auth-Backend
npm install
```

### Running locally

```bash
# Development (with watch mode)
npm run dev

# Production-style start (also uses tsx)
npm start

# Type-check only (no JS emit)
npm run build
```

Server runs at `http://localhost:3000` by default.

---

## Scripts

| Script | Command | Purpose |
|---|---|---|
| `dev` | `tsx watch src/server.ts` | Hot-reload development server |
| `start` | `tsx src/server.ts` | Production runtime |
| `build` | `tsc --noEmit` | Type-check the project |
| `test` | (placeholder) | No tests configured yet |

---

## API Reference

**Base URL:** `http://localhost:3000`

### Common Headers

| Header | When required | Example |
|---|---|---|
| `Content-Type: application/json` | All requests with a JSON body | `application/json` |
| `Authorization: Bearer <accessToken>` | All protected routes | `Bearer eyJhbGciOiJIUzI1NiIsInR...` |

### Cookies (set by the server)

| Cookie | Set on | Used by | Properties |
|---|---|---|---|
| `refreshToken` | Login, Refresh | Refresh, Logout | `httpOnly`, `sameSite: strict`, 7 days |
| `deviceId` | Login | All protected routes (validates device session) | `httpOnly`, `sameSite: strict`, 7 days |

> Both cookies are sent automatically by the browser / Postman cookie jar — no manual handling needed in the client.

### Common Response Shape

**Success:**
```json
{ "success": true, "message": "...", "...": "..." }
```

**Error:**
```json
{ "success": false, "message": "...", "errors": [ { "field": "email", "message": "Invalid email address" } ] }
```

---

## Auth Routes

Mounted at `/api/auth`.

### 1. Health check

```
GET /api/auth/
```

**Response 200:** `Auth routes` (plain text)

---

### 2. Signup

```
POST /api/auth/signup
```

**Headers:**

| Key | Value |
|---|---|
| Content-Type | application/json |

**Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123",
  "role": "user"
}
```

| Field | Type | Rules |
|---|---|---|
| `name` | string | min 6 chars |
| `email` | string | valid email format |
| `password` | string | min 6 chars |
| `role` | enum | `"admin"` \| `"manager"` \| `"user"` |

**Response 200:**
```json
{ "message": "User registered successfully" }
```

**Response 400:** validation error or missing fields

---

### 3. Login

```
POST /api/auth/login
```

**Headers:**

| Key | Value |
|---|---|
| Content-Type | application/json |

**Body:**

```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```

| Field | Type | Rules |
|---|---|---|
| `email` | string | valid email format |
| `password` | string | min 6 chars |

**Response 200:**
```json
{
  "success": true,
  "message": "User logged in successfully",
  "user": {
    "_id": "65f1234abcd...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "createdAt": "2026-05-10T12:00:00.000Z",
    "updatedAt": "2026-05-10T12:00:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "deviceId": "8e1f7a2c-5c4f-4f3e-9b8d-1a2b3c4d5e6f"
}
```

**Cookies set:** `refreshToken`, `deviceId` (both `httpOnly`)

**Response 401:** `{"success": false, "message": "Invalid password"}` or `User not found`

---

### 4. Refresh Token

```
POST /api/auth/refresh
```

**Headers:**

| Key | Value |
|---|---|
| Cookie | `refreshToken=<token>; deviceId=<id>` (sent automatically) |

**Body:** none

**Response 200:**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Cookie updated:** new `refreshToken` set in cookie.

**Response 401 (refresh token reuse detected — security alert):**
```json
{
  "success": false,
  "message": "Security alert: Invalid device session. You have been logged out from all devices for security reasons.",
  "logoutRequired": true
}
```
All device sessions for the user are deleted; cookies are cleared.

**Response 401 (other errors):** `Refresh token or device ID not found` / `Invalid or expired refresh token`

---

### 5. Logout (current device)

```
POST /api/auth/logout
```

**Headers:**

| Key | Value |
|---|---|
| Cookie | `deviceId=<id>` (sent automatically) |

**Body:** none

**Response 200:**
```json
{ "success": true, "message": "Logged out successfully" }
```

**Cookies cleared:** `refreshToken`, `deviceId`. Device session deleted from DB. Audit log entry created.

---

### 6. Logout from all devices

```
POST /api/auth/logout-all
```

**Headers:**

| Key | Value |
|---|---|
| Authorization | `Bearer <accessToken>` |

**Body:** none

**Response 200:**
```json
{ "success": true, "message": "Logged out from all devices successfully" }
```

All device sessions for the user are deleted. Cookies cleared.

---

## User Routes

Mounted at `/api/user`. All routes require `verifyAuth()` + `accessRolesMiddleware`.

### 1. Get current user (Profile)

```
GET /api/user/
```

**Headers:**

| Key | Value |
|---|---|
| Authorization | `Bearer <accessToken>` |
| Cookie | `deviceId=<id>` |

**Allowed roles:** `admin`, `manager`, `user`

**Response 200:**
```json
{
  "success": true,
  "message": "User fetched successfully",
  "user": {
    "_id": "65f1234abcd...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "createdAt": "2026-05-10T12:00:00.000Z",
    "updatedAt": "2026-05-10T12:00:00.000Z"
  }
}
```

---

### 2. Manager test route

```
GET /api/user/manager/test
```

**Allowed roles:** `admin`, `manager`

**Response 200:**
```json
{ "success": true, "message": "Manager area" }
```

**Response 403:** `{"success": false, "message": "You are not authorized to access this resource"}`

---

### 3. Admin test route

```
GET /api/user/admin/test
```

**Allowed roles:** `admin`

**Response 200:**
```json
{ "success": true, "message": "Admin area" }
```

**Response 403:** `{"success": false, "message": "You are not authorized to access this resource"}`

---

### 4. Change password

```
PUT /api/user/change-password
```

**Headers:**

| Key | Value |
|---|---|
| Authorization | `Bearer <accessToken>` |
| Content-Type | application/json |
| Cookie | `deviceId=<id>` |

**Allowed roles:** `admin`, `manager`, `user`

**Body:**

```json
{
  "oldPassword": "secret123",
  "newPassword": "newSecret456"
}
```

| Field | Type | Rules |
|---|---|---|
| `oldPassword` | string | min 6 chars, must match current password |
| `newPassword` | string | min 6 chars |

**Response 200:**
```json
{ "success": true, "message": "Password changed successfully" }
```

**Response 400:** `{"success": false, "message": "Old password is incorrect"}`

Audit log entry created on success.

---

## Device Routes

Mounted at `/api/devices`. All routes require `verifyAuth()`.

### 1. List active devices

```
GET /api/devices/all
```

**Headers:**

| Key | Value |
|---|---|
| Authorization | `Bearer <accessToken>` |
| Cookie | `deviceId=<id>` |

**Response 200:**
```json
{
  "success": true,
  "devices": [
    {
      "deviceId": "8e1f7a2c-5c4f-4f3e-9b8d-1a2b3c4d5e6f",
      "IP": "203.0.113.42",
      "userAgent": "Mozilla/5.0 ... Chrome/120.0",
      "lastActive": "2026-05-10T12:30:00.000Z",
      "createdAt": "2026-05-10T11:00:00.000Z"
    }
  ]
}
```

---

### 2. Logout current device

```
POST /api/devices/logout/current
```

**Headers:**

| Key | Value |
|---|---|
| Authorization | `Bearer <accessToken>` |
| Cookie | `deviceId=<id>` |

**Body (optional):**
```json
{ "deviceId": "<deviceId>" }
```
If body is empty, the cookie `deviceId` is used.

**Response 200:**
```json
{ "success": true, "message": "Logged out from current device successfully" }
```

Cookies cleared.

---

### 3. Logout all devices

```
POST /api/devices/logout/all
```

**Headers:**

| Key | Value |
|---|---|
| Authorization | `Bearer <accessToken>` |

**Body:** none

**Response 200:**
```json
{ "success": true, "message": "Logged out from all devices successfully" }
```

All device sessions for the user are deleted. Cookies cleared.

---

## Audit Routes

Mounted at `/api/audit`.

### 1. My audit history

```
GET /api/audit/me
```

**Headers:**

| Key | Value |
|---|---|
| Authorization | `Bearer <accessToken>` |

**Query parameters:**

| Param | Type | Default | Description |
|---|---|---|---|
| `page` | number | 1 | Page number (1-indexed) |
| `limit` | number | 50 | Items per page (max 100) |

**Example:**
```
GET /api/audit/me?page=1&limit=20
```

**Response 200:**
```json
{
  "success": true,
  "logs": [
    {
      "_id": "65f5678efgh...",
      "userId": "65f1234abcd...",
      "action": "login",
      "IP": "203.0.113.42",
      "deviceId": "8e1f7a2c-...",
      "userAgent": "Mozilla/5.0 ...",
      "createdAt": "2026-05-10T12:00:00.000Z",
      "updatedAt": "2026-05-10T12:00:00.000Z"
    }
  ],
  "total": 12,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

---

### 2. All audit logs (Admin only)

```
GET /api/audit/
```

**Headers:**

| Key | Value |
|---|---|
| Authorization | `Bearer <accessToken>` |

**Allowed roles:** `admin`

**Query parameters:**

| Param | Type | Description | Example |
|---|---|---|---|
| `action` | enum | Filter by action: `login` \| `logout` \| `refresh_token` \| `password_change` | `login` |
| `userId` | string | Filter by user ID | `65f1234abcd...` |
| `from` | ISO date | Start date (inclusive) | `2026-05-01` |
| `to` | ISO date | End date (inclusive) | `2026-05-10` |
| `page` | number | Page number (default 1) | `1` |
| `limit` | number | Items per page (default 50, max 100) | `50` |

**Example:**
```
GET /api/audit/?action=login&from=2026-05-01&to=2026-05-10&page=1&limit=50
```

**Response 200:**
```json
{
  "success": true,
  "logs": [
    {
      "_id": "65f5678efgh...",
      "userId": {
        "_id": "65f1234abcd...",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "user"
      },
      "action": "login",
      "IP": "203.0.113.42",
      "deviceId": "8e1f7a2c-...",
      "userAgent": "Mozilla/5.0 ...",
      "createdAt": "2026-05-10T12:00:00.000Z"
    }
  ],
  "total": 234,
  "page": 1,
  "limit": 50,
  "totalPages": 5
}
```

**Response 400:** `Invalid action filter` / `Invalid 'from' date` / `Invalid 'to' date`

**Response 403:** non-admin users

---

## Authentication Flow

### Signup → Login → Protected Request

```
1. POST /api/auth/signup           → user document created (password bcrypt-hashed)
2. POST /api/auth/login            → device session created, accessToken (body) + refreshToken & deviceId (httpOnly cookies)
3. GET /api/user/                  → Bearer accessToken + deviceId cookie verified
4. AccessToken expires (15 min)
5. POST /api/auth/refresh          → new accessToken returned, refreshToken rotated in DB and cookie
6. POST /api/auth/logout           → device session deleted, cookies cleared, audit log written
```

### Refresh Token Reuse Detection

```
1. Login              → DB stores refreshToken R1 against deviceId D1
2. Refresh #1         → DB stores R2; old R1 is gone from DB
3. Attacker tries R1  → DB lookup (D1, R1) returns null → reuse detected
                     → logoutAllDevices(userId) deletes ALL device sessions
                     → response: { logoutRequired: true }
```

---

## Security Features

| Feature | Implementation |
|---|---|
| Password hashing | bcrypt with `pre('save')` Mongoose hook |
| Password not returned in responses | `select: false` in schema; explicit unset in service responses |
| HTTP-only cookies | `refreshToken` and `deviceId` cookies are `httpOnly`, `sameSite: strict` |
| Refresh token rotation | New token issued on every refresh; old token invalidated in DB |
| Token reuse detection | Old refresh token presented again → all device sessions deleted |
| Instant token invalidation on logout | `verifyAuth` checks DB device session existence on every request |
| RBAC | Role-based middleware factory |
| Rate limiting | 100 req / 15 min per IP (configurable per route) |
| CORS | Strict origin via `FRONTEND_URL` env var |
| Trust proxy | Enabled (correct IP detection behind proxies) |
| Audit logs | Immutable log of login, logout, refresh_token, password_change |
| Audit failures non-blocking | `writeAuditLog` swallows errors so main flow never fails |

---

## Deployment

### Render

1. **Build Command:** `npm install`
2. **Start Command:** `npm start`
3. **Environment variables:** add all from the [Environment Variables](#environment-variables) section
4. **MongoDB Atlas:** Network Access → IP Whitelist → `0.0.0.0/0` (Render IPs are dynamic)
5. Push code → Render auto-deploys

### Vercel

Vercel is serverless-first. The current `server.ts` (which calls `app.listen`) does not fit the serverless model. Recommended approach:

1. Create `api/index.ts` exporting a serverless handler that wraps the Express `app`
2. Add `vercel.json` routing all requests to `api/index.ts`
3. Set environment variables in the Vercel dashboard

(Render is the easier fit for this codebase.)

### MongoDB

Use MongoDB Atlas for production. Local MongoDB is fine for development:

```bash
# Local
MONGODB_URI=mongodb://localhost:27017/authapp

# Atlas
MONGODB_URI=mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/authapp?retryWrites=true&w=majority
```

---

## License

ISC
