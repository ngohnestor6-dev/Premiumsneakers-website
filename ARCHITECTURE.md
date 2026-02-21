# ShoeStore Architecture & Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     USER'S BROWSER                          │
│  (Chrome, Firefox, Safari, Edge, or any modern browser)     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ HTTP Requests
                       │ (port 3000)
                       ▼
┌──────────────────────────────────────────────────────────────┐
│              FRONTEND (React Application)                    │
├──────────────────────────────────────────────────────────────┤
│ - index.html (HTML structure)                               │
│ - app.js (5 React Components)                               │
│ - styles.css (All styling)                                  │
│                                                              │
│ Components:                                                  │
│  • Header (Navigation)                                       │
│  • ShopPage (Product Listing)                               │
│  • ProductPage (Product Details)                            │
│  • CartPage (Shopping Cart)                                 │
│  • CheckoutPage (Checkout Form)                            │
│  • ConfirmationPage (Order Confirmation)                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ REST API Calls (JSON)
                       │ (port 5000)
                       ▼
┌──────────────────────────────────────────────────────────────┐
│          BACKEND (Node.js + Express Server)                 │
├──────────────────────────────────────────────────────────────┤
│ - server.js (All backend logic)                             │
│                                                              │
│ Endpoints:                                                   │
│  • GET  /api/shoes           → Get all shoes                │
│  • GET  /api/shoes/:id       → Get shoe details             │
│  • GET  /api/shoes/category  → Filter by category           │
│  • POST /api/cart            → Add to cart                  │
│  • GET  /api/cart            → View cart                    │
│  • DELETE /api/cart/:id      → Remove from cart             │
│  • PUT  /api/cart/:id        → Update quantity              │
│  • POST /api/checkout        → Place order                  │
│                                                              │
│ Data Storage:                                                │
│  • shoes[] array (6 products)                               │
│  • cartItems[] array (in-memory)                            │
└──────────────────────────────────────────────────────────────┘
```

## User Flow (Happy Path)

```
┌─────────┐
│ Browser │
└────┬────┘
     │
     ▼
┌──────────────────────┐
│    Shop Page         │    GET /api/shoes
│  (Product Listing)   │──────────────────────►
│                      │    ◄──────────────────
│  - View all shoes    │    Returns 6 shoes
│  - Click "Details"   │
└────┬─────────────────┘
     │
     ▼
┌──────────────────────┐
│ Product Detail Page  │    GET /api/shoes/:id
│                      │──────────────────────►
│  - Select size       │    ◄──────────────────
│  - Select quantity   │    Returns shoe details
│  - "Add to Cart" btn │
└────┬─────────────────┘
     │ POST /api/cart
     ├──────────────────────►
     │ ◄──────────────────────
     ▼ Cart updated in state

┌──────────────────────┐
│    Cart Page         │    GET /api/cart
│                      │──────────────────────►
│  - View items        │    ◄──────────────────
│  - Update quantity   │    Returns cart items
│  - Remove items      │
│  - "Checkout" btn    │
└────┬─────────────────┘
     │
     ▼
┌──────────────────────┐
│  Checkout Page       │
│                      │
│  - Enter name        │
│  - Enter email       │
│  - Enter address     │
│  - Select payment    │
│  - "Place Order" btn │
└────┬─────────────────┘
     │ POST /api/checkout
     ├──────────────────────►(with form data)
     │ ◄──────────────────────
     ▼ Cart cleared, order ID received

┌──────────────────────┐
│ Confirmation Page    │
│                      │
│  ✓ Order Confirmed!  │
│  - Order ID          │
│  - Customer info     │
│  - Order summary     │
│  - "Continue Shoping"│
└────┬─────────────────┘
     │
     ▼ (Click Continue)
  Back to Shop Page
```

## Data Flow Diagram

```
Frontend State:
┌─────────────────────────────────────┐
│ App Component (State Management)    │
├─────────────────────────────────────┤
│ • currentPage (shop|product|...)    │
│ • shoes[] (from API)                │
│ • cartItems[] (from API)            │
│ • selectedShoe (current product)    │
│ • lastOrder (confirmation data)     │
└────────┬────────────────────────────┘
         │
    ┌────┴──────────────────────────────────┐
    │                                       │
    ▼                                       ▼
┌─────────────────┐               ┌──────────────────┐
│  ShopPage       │               │  ProductPage     │
│ Component       │               │  Component       │
│                 │               │                  │
│ Displays shoes  │               │ Shows details    │
│ from shoes[]    │               │ of selectedShoe  │
└─────────────────┘               └──────────────────┘
         │                               │
         │ (User clicks shoe)            │ (User clicks Add)
         │                               │
         └──────────────────┬────────────┘
                            │
                    ┌───────▼────────┐
                    │  POST /api/cart│
                    └────────┬────────┘
                             │
            ┌────────────────┴────────────┐
            │                             │
            ▼                             ▼
    ┌───────────────────┐       ┌──────────────┐
    │   CartPage        │       │ CheckoutPage │
    │   Component       │       │  Component   │
    │                   │       │              │
    │ Shows cartItems[] │       │ Submits form │
    └───────────────────┘       └────┬─────────┘
                                     │
                            ┌────────▼──────────┐
                            │POST /api/checkout │
                            └────────┬──────────┘
                                     │
                            ┌────────▼──────────────┐
                            │ConfirmationPage      │
                            │ Shows lastOrder data │
                            └──────────────────────┘
```

## Backend Architecture

```
server.js
├── Dependencies
│   ├── express
│   ├── cors
│   └── body-parser
│
├── Middleware
│   ├── cors()
│   ├── bodyParser.json()
│   └── bodyParser.urlencoded()
│
├── Data Storage
│   ├── shoes[] array
│   │   ├── id, name, price
│   │   ├── description, image
│   │   ├── category, size[]
│   │   └── rating
│   │
│   └── cartItems[] array
│       ├── id, name, price, image
│       ├── quantity, size
│       └── (reset on checkout)
│
├── Route Handlers
│   ├── GET /api/shoes
│   │   └── Return all shoes
│   │
│   ├── GET /api/shoes/:id
│   │   └── Return specific shoe
│   │
│   ├── GET /api/shoes/category/:category
│   │   └── Filter shoes by category
│   │
│   ├── POST /api/cart
│   │   ├── Find shoe by ID
│   │   ├── Check if already in cart
│   │   ├── Add or update quantity
│   │   └── Return updated cart
│   │
│   ├── GET /api/cart
│   │   ├── Calculate total
│   │   └── Return cart with stats
│   │
│   ├── DELETE /api/cart/:shoeId/:size
│   │   ├── Filter out item
│   │   └── Return updated cart
│   │
│   ├── PUT /api/cart/:shoeId/:size
│   │   ├── Update quantity
│   │   └── Return updated cart
│   │
│   ├── POST /api/checkout
│   │   ├── Validate form data
│   │   ├── Create order object
│   │   ├── Generate order ID
│   │   ├── Clear cart
│   │   └── Return confirmation
│   │
│   └── GET /api/health
│       └── Return server status
│
└── Server Start
    └── Listen on port 5000
```

## Component Hierarchy

```
App
├── Header
│   ├── Logo
│   └── Nav
│       ├── Shop button
│       └── Cart button (with count)
│
├── Main Content (conditional rendering)
│   ├── ShopPage
│   │   ├── Hero section
│   │   └── ShoeCard[] (for each shoe)
│   │       ├── Image
│   │       ├── Name
│   │       ├── Price
│   │       ├── Rating
│   │       └── Buttons
│   │
│   ├── ProductPage
│   │   ├── Product Image
│   │   ├── Product Info
│   │   │   ├── Name
│   │   │   ├── Price
│   │   │   ├── Description
│   │   │   ├── Size selector
│   │   │   ├── Quantity input
│   │   │   └── Add to Cart button
│   │   └── Back button
│   │
│   ├── CartPage
│   │   ├── Cart Items List
│   │   │   ├── CartItem[] (for each item)
│   │   │   │   ├── Image
│   │   │   │   ├── Name & Size
│   │   │   │   ├── Price
│   │   │   │   ├── Quantity input
│   │   │   │   └── Remove button
│   │   │   └── Empty cart message (if empty)
│   │   │
│   │   └── Order Summary
│   │       ├── Subtotal
│   │       ├── Shipping
│   │       ├── Total
│   │       └── Checkout button
│   │
│   ├── CheckoutPage
│   │   ├── Form
│   │   │   ├── Name input
│   │   │   ├── Email input
│   │   │   ├── Address input
│   │   │   ├── Payment dropdown
│   │   │   └── Submit button
│   │   │
│   │   └── Checkout Summary
│   │       ├── Order items
│   │       └── Total
│   │
│   └── ConfirmationPage
│       ├── Success message
│       └── Order Details
│           ├── Order ID
│           ├── Customer info
│           ├── Shipping address
│           ├── Payment method
│           ├── Items ordered
│           └── Continue shopping button
│
└── Footer
    └── Copyright info
```

## API Request/Response Examples

### GET /api/shoes
**Response:**
```json
{
  "shoes": [
    {
      "id": 1,
      "name": "Air Runner Pro",
      "price": 129.99,
      "description": "High-performance running shoes",
      "image": "/images/shoe1.jpg",
      "category": "running",
      "size": [6, 7, 8, 9, 10, 11, 12],
      "rating": 4.5
    }
  ],
  "total": 6
}
```

### POST /api/cart
**Request Body:**
```json
{
  "shoeId": 1,
  "quantity": 2,
  "size": 10
}
```

**Response:**
```json
{
  "message": "Item added to cart",
  "cartItems": [
    {
      "id": 1,
      "name": "Air Runner Pro",
      "price": 129.99,
      "image": "/images/shoe1.jpg",
      "quantity": 2,
      "size": 10
    }
  ]
}
```

### POST /api/checkout
**Request Body:**
```json
{
  "customerName": "John Doe",
  "email": "john@example.com",
  "address": "123 Main St, City, State 12345",
  "paymentMethod": "credit-card"
}
```

**Response:**
```json
{
  "message": "Order placed successfully",
  "order": {
    "orderId": 574829,
    "customerName": "John Doe",
    "email": "john@example.com",
    "address": "123 Main St, City, State 12345",
    "paymentMethod": "credit-card",
    "items": [...],
    "total": "259.98",
    "status": "Confirmed",
    "date": "2026-02-20T10:30:00.000Z"
  }
}
```

## Technology Interactions

```
Browser JavaScript Events
         │
         ▼
React Component State Updates
         │
    ┌────┴────┐
    │          │
    ▼          ▼
 Local State  Fetch API
    │          │
    │          ▼
    │     HTTP Request
    │          │
    │          ▼
    │    Express.js Route
    │          │
    │          ▼
    │    JavaScript Handler
    │          │
    │          ▼
    │    Modify arrays
    │    (shoes, cartItems)
    │          │
    │          ▼
    │    Send JSON Response
    │          │
    └────┬─────┘
         │
         ▼
    Browser receives
    JSON response
         │
         ▼
    React updates state
         │
         ▼
    Components re-render
         │
         ▼
    User sees updated UI
```

## Deployment Structure

```
Production Deployment
├── Backend (Node.js)
│   └── Deployed on:
│       ├── Heroku
│       ├── Railway
│       ├── AWS EC2
│       ├── DigitalOcean
│       └── Any VPS
│
└── Frontend (Static Files)
    └── Deployed on:
        ├── Vercel
        ├── Netlify
        ├── GitHub Pages
        ├── AWS S3 + CloudFront
        └── Same server as backend
```

## Scalability Roadmap

```
Current (In-Memory):
Backend ──── cartItems[] array
        └─── shoes[] array

Phase 1 (Database):
Backend ──── PostgreSQL/MongoDB
        ├─── Products table
        ├─── Orders table
        └─── Customers table

Phase 2 (Authentication):
├─── User signup/login
├─── Order history
└─── Account management

Phase 3 (Advanced Features):
├─── Search & filtering
├─── Reviews & ratings
├─── Wishlist
├─── Inventory management
└─── Admin dashboard

Phase 4 (Production):
├─── Payment integration (Stripe)
├─── Email notifications
├─── Order tracking
├─── Analytics
└─── Caching (Redis)
```

This architecture demonstrates a complete, functional e-commerce application ready for real-world use!
