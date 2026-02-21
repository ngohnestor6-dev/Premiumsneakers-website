# Quick Start Guide

## 5-Minute Setup

### Step 1: Start Backend (Terminal 1)
```bash
cd backend
npm install
npm start
```
Wait for: "Shoe Store Backend running on http://localhost:5000"

### Step 2: Start Frontend (Terminal 2)
```bash
cd frontend
python -m http.server 3000
# OR
npx http-server -p 3000
```

### Step 3: Open Browser
Visit: http://localhost:3000

## Testing the Application

1. **Shop Page** - Browse shoes (auto-loads from backend)
2. **View Details** - Click any shoe to see full details
3. **Add to Cart** - Select size, quantity, click "Add to Cart"
4. **Go to Cart** - Click cart icon in header
5. **Checkout** - Click "Proceed to Checkout"
6. **Place Order** - Fill form and place order
7. **Confirmation** - See order confirmation page

## Key Endpoints to Test

```bash
# Get all shoes
curl http://localhost:5000/api/shoes

# Get specific shoe
curl http://localhost:5000/api/shoes/1

# Get cart
curl http://localhost:5000/api/cart

# Health check
curl http://localhost:5000/api/health
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Backend fails to start | Port 5000 in use. Change PORT in server.js or close other app |
| CORS errors | Backend not running. Make sure it's on port 5000 |
| No shoes loading | Check backend console for errors. Verify API is running |
| Can't find frontend | Make sure you're on http://localhost:3000 |

## File Structure

```
tupac project/
├── README.md                 # Full documentation
├── QUICKSTART.md            # This file
├── backend/
│   ├── server.js            # All backend logic
│   ├── package.json         # Dependencies
│   └── node_modules/        # Created by npm install
└── frontend/
    ├── index.html           # HTML page
    ├── app.js               # React components
    └── styles.css           # Styling
```

## What's Included

### Backend Features
✅ 6 demo shoes with ratings  
✅ Shopping cart management  
✅ Order processing  
✅ REST API endpoints  
✅ CORS enabled  

### Frontend Features
✅ Modern UI with animations  
✅ Product browsing  
✅ Shopping cart  
✅ Checkout form  
✅ Order confirmation  
✅ Responsive design  
✅ Real-time cart updates  

## Next Steps

After getting it working, you can:
- Add more shoes to `backend/server.js`
- Customize styling in `frontend/styles.css`
- Add database (MongoDB, PostgreSQL)
- Add authentication
- Deploy to production

Enjoy building! 🚀
