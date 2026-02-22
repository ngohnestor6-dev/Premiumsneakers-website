# Backend Setup (Phase 1)

## Environment
Copy `.env.example` to `.env` and update values for production.

Required for production:
- `TOKEN_SECRET` (long random string)
- `FRONTEND_ORIGIN` (your hosted frontend URL)
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`

## Run
```bash
cd backend
npm install
npm start
```

## New API Highlights
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/products`
- `POST /api/admin/products` (admin)
- `GET /api/cart` (auth)
- `POST /api/checkout` (auth)
- `GET /api/orders` (auth)
- `GET /api/admin/orders` (admin)

Data persists in `backend/store.json`.
