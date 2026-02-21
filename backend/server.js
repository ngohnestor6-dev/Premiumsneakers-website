const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Sample shoe data
const shoes = [
  {
    id: 1,
    name: 'Air Runner Pro',
    price: 129.99,
    description: 'High-performance running shoes with advanced cushioning',
    image: '/images/shoe1.jpg',
    category: 'running',
    size: [6, 7, 8, 9, 10, 11, 12],
    rating: 4.5
  },
  {
    id: 2,
    name: 'Urban Basketball',
    price: 149.99,
    description: 'Classic basketball shoes for court performance',
    image: '/images/shoe2.jpg',
    category: 'basketball',
    size: [7, 8, 9, 10, 11, 12, 13],
    rating: 4.7
  },
  {
    id: 3,
    name: 'Casual Canvas',
    price: 59.99,
    description: 'Comfortable everyday casual shoes',
    image: '/images/shoe3.jpg',
    category: 'casual',
    size: [5, 6, 7, 8, 9, 10, 11, 12],
    rating: 4.3
  },
  {
    id: 4,
    name: 'Trail Blazer',
    price: 139.99,
    description: 'Rugged hiking shoes for outdoor adventures',
    image: '/images/shoe4.jpg',
    category: 'hiking',
    size: [6, 7, 8, 9, 10, 11, 12, 13],
    rating: 4.6
  },
  {
    id: 5,
    name: 'Soccer Striker',
    price: 119.99,
    description: 'Lightweight soccer cleats for optimal ball control',
    image: '/images/shoe5.jpg',
    category: 'sports',
    size: [6, 7, 8, 9, 10, 11, 12],
    rating: 4.8
  },
  {
    id: 6,
    name: 'Elegant Formal',
    price: 199.99,
    description: 'Premium formal shoes for special occasions',
    image: '/images/shoe6.jpg',
    category: 'formal',
    size: [7, 8, 9, 10, 11, 12],
    rating: 4.4
  }
];

// Cart storage (in-memory for this demo)
let cartItems = [];

// ============ ROUTES ============

// Get all shoes
app.get('/api/shoes', (req, res) => {
  res.json({ shoes, total: shoes.length });
});

// Get a specific shoe by ID
app.get('/api/shoes/:id', (req, res) => {
  const shoe = shoes.find(s => s.id === parseInt(req.params.id));
  if (!shoe) {
    return res.status(404).json({ message: 'Shoe not found' });
  }
  res.json(shoe);
});

// Get shoes by category
app.get('/api/shoes/category/:category', (req, res) => {
  const filtered = shoes.filter(s => s.category === req.params.category);
  res.json({ shoes: filtered, total: filtered.length });
});

// Add to cart
app.post('/api/cart', (req, res) => {
  const { shoeId, quantity, size } = req.body;
  const shoe = shoes.find(s => s.id === shoeId);
  
  if (!shoe) {
    return res.status(404).json({ message: 'Shoe not found' });
  }

  const existingItem = cartItems.find(item => item.id === shoeId && item.size === size);
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cartItems.push({
      id: shoeId,
      name: shoe.name,
      price: shoe.price,
      image: shoe.image,
      quantity,
      size
    });
  }

  res.json({ message: 'Item added to cart', cartItems });
});

// Get cart
app.get('/api/cart', (req, res) => {
  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  res.json({ cartItems, total: total.toFixed(2), itemCount: cartItems.length });
});

// Remove from cart
app.delete('/api/cart/:shoeId/:size', (req, res) => {
  const { shoeId, size } = req.params;
  cartItems = cartItems.filter(item => !(item.id === parseInt(shoeId) && item.size === size));
  res.json({ message: 'Item removed from cart', cartItems });
});

// Update cart item quantity
app.put('/api/cart/:shoeId/:size', (req, res) => {
  const { shoeId, size } = req.params;
  const { quantity } = req.body;
  const item = cartItems.find(item => item.id === parseInt(shoeId) && item.size === size);
  
  if (!item) {
    return res.status(404).json({ message: 'Item not found in cart' });
  }

  item.quantity = quantity;
  res.json({ message: 'Cart updated', cartItems });
});

// Checkout
app.post('/api/checkout', (req, res) => {
  const { customerName, email, address, paymentMethod } = req.body;
  
  if (!customerName || !email || !address || !paymentMethod) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  if (cartItems.length === 0) {
    return res.status(400).json({ message: 'Cart is empty' });
  }

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const orderId = Math.floor(Math.random() * 1000000);

  const order = {
    orderId,
    customerName,
    email,
    address,
    paymentMethod,
    items: cartItems,
    total: total.toFixed(2),
    status: 'Confirmed',
    date: new Date().toISOString()
  };

  console.log('Order placed:', order);
  cartItems = []; // Clear cart after checkout

  res.json({
    message: 'Order placed successfully',
    order
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Shoe Store Backend running on http://localhost:${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api/`);
});
