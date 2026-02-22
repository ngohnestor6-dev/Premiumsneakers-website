# Quick Start Guide

## 1) Start Backend
```bash
cd backend
npm install
npm start
```
Backend runs on `http://localhost:5000`.

## 2) Start Frontend
Use either app entry:
- `sneakers-ecommerce.html` (single-page storefront)
- `frontend/index.html` (legacy frontend folder)

For local serving:
```bash
# from project root
npx http-server -p 3000
# or
python -m http.server 3000
```
Open `http://localhost:3000`.

## 3) Verify API Health
```bash
curl http://localhost:5000/api/health
```
Expected: `{ "status": "ok", ... }`

## 3.1) Run Automated Smoke Test
```bash
cd backend
npm run smoke
```
This validates health, register, login, products, cart, and checkout.

## 3.2) Run Environment Preflight
```bash
cd backend
npm run preflight
```
This validates required env settings and warns about risky defaults.

## 4) Auth / Admin Access
- Admin username: `Machala`
- Admin password: `MACHALA#2024`

Customer flow:
- Click `Sign In`
- Use `Create Account` to register
- Then login and shop/checkout

## 5) Core API Endpoints
```bash
# Auth
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me

# Products
GET  /api/products
GET  /api/products/:id

# Cart (auth required)
GET    /api/cart
POST   /api/cart
PUT    /api/cart/:itemId
DELETE /api/cart/:itemId

# Checkout / Orders
POST /api/checkout
GET  /api/orders

# Admin
POST   /api/admin/products
PUT    /api/admin/products/:id
DELETE /api/admin/products/:id
GET    /api/admin/orders
PATCH  /api/admin/orders/:id/status
```

## 6) Common Issues
- `EADDRINUSE` on backend start: port `5000` already used.
- Frontend loads but actions fail: check `API_BASE` in `sneakers-ecommerce.html` is `http://localhost:5000/api`.
- Login works but admin page not opening: ensure account role is `admin`.

## 7) Production Notes
Before hosting:
- Set `TOKEN_SECRET` and `FRONTEND_ORIGIN` in backend environment.
- Configure `PAYMENT_PROVIDER` and `EMAIL_PROVIDER`.
- Use HTTPS + secure cookie/session strategy.
- Replace JSON file storage with a real database.
- Integrate real payment and email providers (current implementation is placeholder/mock).
