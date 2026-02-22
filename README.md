# Sneakers E-Commerce

Full-stack sneakers storefront with:
- Static frontend (`sneakers-ecommerce.html`)
- Node/Express backend API (`backend/server.js`)
- Token auth (customer + admin)
- Product, cart, checkout, and admin order/product management

## Project Layout
- `sneakers-ecommerce.html`: main storefront app
- `backend/server.js`: API server
- `backend/store.json`: local JSON datastore
- `backend/.env.example`: environment template
- `QUICKSTART.md`: fast local setup
- `DEPLOYMENT.md`: production deployment checklist

## Quick Start
1. Start backend:
```bash
cd backend
npm install
npm start
```
2. Serve frontend (from project root):
```bash
npx http-server -p 3000
```
3. Open `http://localhost:3000`.

Optional validation:
```bash
cd backend
npm run smoke
```

## Default Admin
- Username: `Machala`
- Password: `MACHALA#2024`

Change these before production.

## API Overview
- Auth: `/api/auth/register`, `/api/auth/login`, `/api/auth/me`
- Products: `/api/products`, `/api/products/:id`
- Cart: `/api/cart`
- Checkout/Orders: `/api/checkout`, `/api/orders`
- Admin: `/api/admin/products`, `/api/admin/orders`, `/api/admin/orders/:id/status`

## Production Notes
- Set `NODE_ENV=production`
- Set strong `TOKEN_SECRET`
- Set strict `FRONTEND_ORIGIN` (no wildcard in production)
- Set `PAYMENT_PROVIDER` and `EMAIL_PROVIDER` (current defaults are placeholders)
- Use HTTPS on frontend and backend
- Move from JSON storage to a database for reliability/scaling
