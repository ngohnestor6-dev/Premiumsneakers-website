# ShoeStore - E-Commerce Website

A full-stack shoe e-commerce application built with Node.js/Express backend and React frontend.

## Project Structure

```
tupac project/
├── backend/                 # Node.js/Express backend
│   ├── server.js           # Main server file with all endpoints
│   ├── package.json        # Backend dependencies
│   └── node_modules/       # Dependencies (created after npm install)
│
└── frontend/               # React frontend
    ├── index.html          # HTML entry point
    ├── app.js              # React application with all components
    ├── styles.css          # All styling
    └── (no build needed - runs directly in browser)
```

## Features

### Frontend
- **Shop Page**: Browse all available shoes with product details
- **Product Detail Page**: View full shoe information with size and quantity selection
- **Shopping Cart**: Review cart items, update quantities, remove items
- **Checkout Page**: Enter shipping and payment information
- **Order Confirmation**: View order details after successful purchase
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Gradient designs and smooth interactions

### Backend
- **Product API**: Get all shoes or specific shoe by ID
- **Category Filter**: Filter shoes by category
- **Cart Management**: Add, remove, and update cart items
- **Checkout**: Process orders with customer information
- **In-Memory Storage**: Cart and order data stored in memory (for demo)

## Getting Started

### Prerequisites
- Node.js and npm installed
- A web browser (Chrome, Firefox, Edge, Safari)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd tupac project/backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the backend server:
```bash
npm start
```

You should see:
```
Shoe Store Backend running on http://localhost:5000
API endpoints available at http://localhost:5000/api/
```

The backend will be running on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd tupac project/frontend
```

2. **Option A - Using a local server (recommended):**
   - Use Python (if installed):
   ```bash
   python -m http.server 3000
   ```
   
   - Or use Node.js http-server:
   ```bash
   npx http-server -p 3000
   ```
   
   - Or use VS Code Live Server extension

3. **Option B - Open directly in browser:**
   - Right-click `index.html` → Open with Live Server
   - Or open the file directly with your browser

Visit: `http://localhost:3000` (or whatever port you're using)

## Available API Endpoints

### Products
- `GET /api/shoes` - Get all shoes
- `GET /api/shoes/:id` - Get specific shoe details
- `GET /api/shoes/category/:category` - Filter shoes by category

### Cart
- `POST /api/cart` - Add item to cart
- `GET /api/cart` - Get cart items
- `DELETE /api/cart/:shoeId/:size` - Remove item from cart
- `PUT /api/cart/:shoeId/:size` - Update quantity

### Checkout
- `POST /api/checkout` - Place order

### Health Check
- `GET /api/health` - Server status

## Sample Data

The backend includes 6 pre-loaded shoes:
1. **Air Runner Pro** - Running shoes ($129.99)
2. **Urban Basketball** - Basketball shoes ($149.99)
3. **Casual Canvas** - Casual everyday shoes ($59.99)
4. **Trail Blazer** - Hiking shoes ($139.99)
5. **Soccer Striker** - Sports cleats ($119.99)
6. **Elegant Formal** - Formal shoes ($199.99)

## How to Use

1. **Browse**: Click on shoes to see details
2. **Select**: Choose a size and quantity
3. **Add to Cart**: Click "Add to Cart" button
4. **View Cart**: Click the cart icon in the header
5. **Checkout**: Review items and proceed to checkout
6. **Complete Order**: Fill in shipping information and place order
7. **Confirmation**: View your order confirmation

## Technologies Used

### Frontend
- **HTML5**: Page structure
- **CSS3**: Styling with gradients, grid, flexbox, responsive design
- **JavaScript (ES6+)**: Interactivity
- **React 18**: UI library with hooks (useState, useEffect)
- **Fetch API**: API communication

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **CORS**: Cross-Origin Resource Sharing
- **Body-Parser**: JSON parsing middleware

## Customization

### Add More Shoes
Edit `backend/server.js` and add items to the `shoes` array:
```javascript
{
  id: 7,
  name: 'Product Name',
  price: 99.99,
  description: 'Description',
  image: '/images/shoe7.jpg',
  category: 'category-name',
  size: [6, 7, 8, 9, 10, 11, 12],
  rating: 4.5
}
```

### Change Styling
Edit `frontend/styles.css` to customize colors, fonts, and layouts

### Add Database
Replace the in-memory arrays in `server.js` with a database like MongoDB or PostgreSQL

## Troubleshooting

### Backend won't start
- Make sure port 5000 is not in use
- Check if Node.js is installed: `node -v`
- Try: `npm install` again

### Frontend can't connect to backend
- Verify backend is running on http://localhost:5000
- Check browser console for CORS errors
- Make sure both servers are running

### Cart not persisting
- This is normal! The cart is stored in memory only
- It resets when the backend restarts
- For persistence, implement a database

## Future Enhancements

- Add database integration
- User authentication and accounts
- Payment gateway integration (Stripe, PayPal)
- Product search and advanced filtering
- User reviews and ratings
- Wishlist functionality
- Admin dashboard for managing products
- Order history and tracking
- Email notifications
- Image uploads

## License

This project is open source and available under the MIT License.

## Notes

- This is a demo application with simplified architecture
- Cart data is stored in memory and lost on server restart
- No real payments are processed
- For production, add validation, error handling, and database persistence
