# Deployment Guide

## 1. Prepare Environment
1. Copy `backend/.env.example` to `backend/.env`.
2. Set secure values:
- `NODE_ENV=production`
- `TOKEN_SECRET` to a long random value
- `FRONTEND_ORIGIN` to your real frontend URL (no `*` in production)
- `PAYMENT_PROVIDER` (`mock` for now, replace with real provider integration)
- `EMAIL_PROVIDER` (`log` for now, replace with real provider integration)

## 2. Start Backend
```bash
cd backend
npm install --omit=dev
npm run preflight
npm start
```

## 3. Serve Frontend
- Host `sneakers-ecommerce.html` and related assets on your static host.
- Ensure frontend uses:
```js
window.SNEAKERS_API_BASE = "https://your-api-domain.com/api"
```
or set the default `API_BASE` in `sneakers-ecommerce.html`.

## 4. Pre-Go-Live Checklist
- HTTPS enabled on frontend and backend.
- `TOKEN_SECRET` is not default.
- `FRONTEND_ORIGIN` matches exact frontend domain.
- Admin credentials changed from defaults.
- Health endpoint responds: `GET /api/health`.
- Automated smoke test passes: `cd backend && npm run smoke`.
- Preflight env checks pass: `cd backend && npm run preflight`.
- Login, cart, checkout, admin order status tested once in production.

## 5. Current Limitations Before Scale
- Data is stored in `backend/store.json` (single-node only).
- No real payment gateway integration yet.
- No email notifications yet.
- No automated test suite yet.
