const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const idx = line.indexOf('=');
    if (idx <= 0) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (!key || process.env[key] !== undefined) continue;
    process.env[key] = value;
  }
}

loadEnvFile(path.join(__dirname, '.env'));

const app = express();
const PORT = Number(process.env.PORT || 5000);
const NODE_ENV = (process.env.NODE_ENV || 'development').toLowerCase();
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || '*';
const TOKEN_SECRET = process.env.TOKEN_SECRET || 'dev-only-change-this-secret';
const TOKEN_TTL_SECONDS = 60 * 60 * 8;
const DATA_PATH = path.join(__dirname, 'store.json');
const PAYMENT_PROVIDER = (process.env.PAYMENT_PROVIDER || 'mock').toLowerCase();
const EMAIL_PROVIDER = (process.env.EMAIL_PROVIDER || 'log').toLowerCase();
const isProduction = NODE_ENV === 'production';
const allowedOrigins = FRONTEND_ORIGIN
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

if (!allowedOrigins.length) {
  throw new Error('FRONTEND_ORIGIN must be set');
}
if (isProduction && allowedOrigins.includes('*')) {
  throw new Error('FRONTEND_ORIGIN cannot be "*" in production');
}
if (!TOKEN_SECRET || TOKEN_SECRET === 'change-this-secret-in-production' || TOKEN_SECRET === 'dev-only-change-this-secret') {
  if (isProduction) {
    throw new Error('TOKEN_SECRET must be set to a strong secret in production');
  }
  console.warn('[warn] TOKEN_SECRET is using a development default');
}

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error('Not allowed by CORS'));
    }
  })
);
app.use(express.json({ limit: '250kb' }));

// Basic hardening headers without extra dependencies.
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'same-origin');
  res.setHeader('X-XSS-Protection', '0');
  next();
});

const LOGIN_RATE_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_RATE_LIMIT = 20;
const loginAttempts = new Map();
const ORDER_STATUSES = ['PendingPayment', 'Paid', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'];
const ALLOWED_STATUS_TRANSITIONS = {
  PendingPayment: ['Paid', 'Cancelled'],
  Paid: ['Processing', 'Cancelled', 'Refunded'],
  Processing: ['Shipped', 'Cancelled', 'Refunded'],
  Shipped: ['Delivered', 'Refunded'],
  Delivered: ['Refunded'],
  Cancelled: [],
  Refunded: []
};

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function validateRequiredString(value, field, max = 200) {
  const v = String(value || '').trim();
  if (!v) throw new Error(`${field} is required`);
  if (v.length > max) throw new Error(`${field} is too long`);
  return v;
}

function validatePositiveInt(value, field) {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) throw new Error(`${field} must be a positive integer`);
  return n;
}

function validatePrice(value, field) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) throw new Error(`${field} must be a non-negative number`);
  return Number(n.toFixed(2));
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const digest = crypto.pbkdf2Sync(password, salt, 120000, 64, 'sha512').toString('hex');
  return `${salt}:${digest}`;
}

function verifyPassword(password, stored) {
  const [salt, digest] = String(stored || '').split(':');
  if (!salt || !digest) return false;
  const check = crypto.pbkdf2Sync(password, salt, 120000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(check, 'hex'), Buffer.from(digest, 'hex'));
}

function signToken(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', TOKEN_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

function verifyToken(token) {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, body, signature] = parts;
  const expected = crypto.createHmac('sha256', TOKEN_SECRET).update(`${header}.${body}`).digest('base64url');
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
  return payload;
}

function loadStore() {
  if (!fs.existsSync(DATA_PATH)) {
    const adminUsername = process.env.ADMIN_USERNAME || 'Machala';
    const adminPassword = process.env.ADMIN_PASSWORD || 'MACHALA#2024';
    const seeded = {
      nextIds: { user: 2, product: 7, order: 1 },
      users: [
        {
          id: 1,
          username: adminUsername,
          email: 'admin@sneakers.local',
          role: 'admin',
          passwordHash: hashPassword(adminPassword),
          createdAt: new Date().toISOString()
        }
      ],
      products: [
        { id: 1, name: 'Air Runner Pro', price: 129.99, description: 'High-performance running shoes with advanced cushioning', image: '/images/shoe1.jpg', category: 'running', sizes: [6, 7, 8, 9, 10, 11, 12], rating: 4.5, brand: 'Generic', inStock: true },
        { id: 2, name: 'Urban Basketball', price: 149.99, description: 'Classic basketball shoes for court performance', image: '/images/shoe2.jpg', category: 'basketball', sizes: [7, 8, 9, 10, 11, 12, 13], rating: 4.7, brand: 'Generic', inStock: true },
        { id: 3, name: 'Casual Canvas', price: 59.99, description: 'Comfortable everyday casual shoes', image: '/images/shoe3.jpg', category: 'casual', sizes: [5, 6, 7, 8, 9, 10, 11, 12], rating: 4.3, brand: 'Generic', inStock: true },
        { id: 4, name: 'Trail Blazer', price: 139.99, description: 'Rugged hiking shoes for outdoor adventures', image: '/images/shoe4.jpg', category: 'hiking', sizes: [6, 7, 8, 9, 10, 11, 12, 13], rating: 4.6, brand: 'Generic', inStock: true },
        { id: 5, name: 'Soccer Striker', price: 119.99, description: 'Lightweight soccer cleats for optimal ball control', image: '/images/shoe5.jpg', category: 'sports', sizes: [6, 7, 8, 9, 10, 11, 12], rating: 4.8, brand: 'Generic', inStock: true },
        { id: 6, name: 'Elegant Formal', price: 199.99, description: 'Premium formal shoes for special occasions', image: '/images/shoe6.jpg', category: 'formal', sizes: [7, 8, 9, 10, 11, 12], rating: 4.4, brand: 'Generic', inStock: true }
      ],
      carts: {},
      orders: []
    };
    fs.writeFileSync(DATA_PATH, JSON.stringify(seeded, null, 2), 'utf8');
  }

  const parsed = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
  if (!parsed.nextIds) parsed.nextIds = { user: 1, product: 1, order: 1 };
  if (!parsed.users) parsed.users = [];
  if (!parsed.products) parsed.products = [];
  if (!parsed.carts) parsed.carts = {};
  if (!parsed.orders) parsed.orders = [];
  return parsed;
}

function saveStore(store) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(store, null, 2), 'utf8');
}

let store = loadStore();

function getAuthUser(req) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  const payload = verifyToken(token);
  if (!payload) return null;
  return store.users.find((u) => u.id === payload.sub) || null;
}

function requireAuth(req, res, next) {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ message: 'Unauthorized' });
  req.user = user;
  next();
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
}

function loginRateLimited(ip) {
  const now = Date.now();
  const rec = loginAttempts.get(ip) || [];
  const pruned = rec.filter((t) => now - t < LOGIN_RATE_WINDOW_MS);
  if (pruned.length >= LOGIN_RATE_LIMIT) return true;
  pruned.push(now);
  loginAttempts.set(ip, pruned);
  return false;
}

function cartForUser(userId) {
  const key = String(userId);
  if (!store.carts[key]) store.carts[key] = [];
  return store.carts[key];
}

function cartTotals(items) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = Number((subtotal * 0.1).toFixed(2));
  return {
    subtotal: Number(subtotal.toFixed(2)),
    tax,
    total: Number((subtotal + tax).toFixed(2))
  };
}

function validateOrderStatus(status) {
  const value = String(status || '').trim();
  if (!ORDER_STATUSES.includes(value)) {
    throw new Error(`status must be one of: ${ORDER_STATUSES.join(', ')}`);
  }
  return value;
}

function canTransitionStatus(currentStatus, nextStatus) {
  if (currentStatus === nextStatus) return true;
  return (ALLOWED_STATUS_TRANSITIONS[currentStatus] || []).includes(nextStatus);
}

function processPayment({ amount, paymentMethod, orderId, userId }) {
  const reference = `PAY-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  if (PAYMENT_PROVIDER === 'disabled') {
    return { provider: 'disabled', status: 'PendingPayment', reference, amount };
  }
  const method = String(paymentMethod || '').toLowerCase();
  const status = method.includes('cod') || method.includes('cash') ? 'PendingPayment' : 'Paid';
  return {
    provider: PAYMENT_PROVIDER,
    status,
    reference,
    amount,
    orderId,
    userId,
    createdAt: new Date().toISOString()
  };
}

function sendOrderEmail(event, order) {
  if (EMAIL_PROVIDER === 'disabled') return;
  const payload = {
    event,
    orderId: order.id,
    to: order.email,
    customerName: order.customerName,
    status: order.status,
    total: order.total,
    provider: EMAIL_PROVIDER,
    sentAt: new Date().toISOString()
  };
  if (EMAIL_PROVIDER === 'log') {
    console.log('[email]', JSON.stringify(payload));
    return;
  }
  console.log('[email-provider-placeholder]', JSON.stringify(payload));
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/healthz', (req, res) => {
  res.json({
    status: 'ok',
    mode: NODE_ENV,
    uptimeSeconds: Math.floor(process.uptime()),
    dataFile: DATA_PATH,
    paymentProvider: PAYMENT_PROVIDER,
    emailProvider: EMAIL_PROVIDER,
    timestamp: new Date().toISOString()
  });
});

// Auth
app.post('/api/auth/register', (req, res) => {
  try {
    const username = validateRequiredString(req.body.username, 'username', 60);
    const email = normalizeEmail(validateRequiredString(req.body.email, 'email', 200));
    const password = validateRequiredString(req.body.password, 'password', 200);

    if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters' });
    if (store.users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
      return res.status(409).json({ message: 'Username already exists' });
    }
    if (store.users.some((u) => u.email === email)) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    const user = {
      id: store.nextIds.user++,
      username,
      email,
      role: 'customer',
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString()
    };
    store.users.push(user);
    saveStore(store);

    res.status(201).json({ message: 'Registered successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.post('/api/auth/login', (req, res) => {
  if (loginRateLimited(req.ip || 'unknown')) {
    return res.status(429).json({ message: 'Too many login attempts. Try again later.' });
  }
  const username = String(req.body.username || '').trim();
  const password = String(req.body.password || '');

  const user = store.users.find((u) => u.username.toLowerCase() === username.toLowerCase());
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const now = Math.floor(Date.now() / 1000);
  const token = signToken({ sub: user.id, role: user.role, iat: now, exp: now + TOKEN_TTL_SECONDS });
  res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({ id: req.user.id, username: req.user.username, email: req.user.email, role: req.user.role });
});

// Products
app.get('/api/products', (req, res) => {
  const q = String(req.query.q || '').trim().toLowerCase();
  const category = String(req.query.category || '').trim().toLowerCase();
  const brand = String(req.query.brand || '').trim().toLowerCase();

  let products = store.products;
  if (q) products = products.filter((p) => `${p.name} ${p.description} ${p.brand}`.toLowerCase().includes(q));
  if (category) products = products.filter((p) => String(p.category).toLowerCase() === category);
  if (brand) products = products.filter((p) => String(p.brand).toLowerCase() === brand);

  res.json({ products, total: products.length });
});

app.get('/api/products/:id', (req, res) => {
  const product = store.products.find((p) => p.id === Number(req.params.id));
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
});

app.post('/api/admin/products', requireAuth, requireAdmin, (req, res) => {
  try {
    const name = validateRequiredString(req.body.name, 'name', 200);
    const description = validateRequiredString(req.body.description, 'description', 1000);
    const category = validateRequiredString(req.body.category, 'category', 100);
    const brand = validateRequiredString(req.body.brand, 'brand', 100);
    const image = validateRequiredString(req.body.image, 'image', 500);
    const price = validatePrice(req.body.price, 'price');
    const rating = Number(req.body.rating || 0);

    const product = {
      id: store.nextIds.product++,
      name,
      description,
      category,
      brand,
      image,
      price,
      rating: Number.isFinite(rating) ? rating : 0,
      sizes: Array.isArray(req.body.sizes) ? req.body.sizes.slice(0, 20) : [],
      inStock: req.body.inStock !== false,
      createdAt: new Date().toISOString()
    };

    store.products.push(product);
    saveStore(store);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.put('/api/admin/products/:id', requireAuth, requireAdmin, (req, res) => {
  try {
    const product = store.products.find((p) => p.id === Number(req.params.id));
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (req.body.name !== undefined) product.name = validateRequiredString(req.body.name, 'name', 200);
    if (req.body.description !== undefined) product.description = validateRequiredString(req.body.description, 'description', 1000);
    if (req.body.category !== undefined) product.category = validateRequiredString(req.body.category, 'category', 100);
    if (req.body.brand !== undefined) product.brand = validateRequiredString(req.body.brand, 'brand', 100);
    if (req.body.image !== undefined) product.image = validateRequiredString(req.body.image, 'image', 500);
    if (req.body.price !== undefined) product.price = validatePrice(req.body.price, 'price');
    if (req.body.rating !== undefined) product.rating = Number(req.body.rating);
    if (req.body.sizes !== undefined && Array.isArray(req.body.sizes)) product.sizes = req.body.sizes.slice(0, 20);
    if (req.body.inStock !== undefined) product.inStock = Boolean(req.body.inStock);

    product.updatedAt = new Date().toISOString();
    saveStore(store);
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/admin/products/:id', requireAuth, requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const index = store.products.findIndex((p) => p.id === id);
  if (index === -1) return res.status(404).json({ message: 'Product not found' });

  store.products.splice(index, 1);
  saveStore(store);
  res.json({ message: 'Product deleted' });
});

// Cart + Orders
app.get('/api/cart', requireAuth, (req, res) => {
  const items = cartForUser(req.user.id);
  res.json({ items, ...cartTotals(items) });
});

app.post('/api/cart', requireAuth, (req, res) => {
  try {
    const productId = validatePositiveInt(req.body.productId, 'productId');
    const quantity = validatePositiveInt(req.body.quantity || 1, 'quantity');
    const size = String(req.body.size || '').trim();

    const product = store.products.find((p) => p.id === productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const items = cartForUser(req.user.id);
    const existing = items.find((i) => i.productId === productId && i.size === size);
    if (existing) {
      existing.quantity += quantity;
    } else {
      items.push({
        id: crypto.randomUUID(),
        productId,
        name: product.name,
        price: product.price,
        image: product.image,
        size,
        quantity
      });
    }

    saveStore(store);
    res.status(201).json({ message: 'Cart updated', items, ...cartTotals(items) });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.put('/api/cart/:itemId', requireAuth, (req, res) => {
  try {
    const quantity = validatePositiveInt(req.body.quantity, 'quantity');
    const items = cartForUser(req.user.id);
    const item = items.find((i) => i.id === req.params.itemId);
    if (!item) return res.status(404).json({ message: 'Cart item not found' });

    item.quantity = quantity;
    saveStore(store);
    res.json({ message: 'Cart updated', items, ...cartTotals(items) });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/cart/:itemId', requireAuth, (req, res) => {
  const items = cartForUser(req.user.id);
  const before = items.length;
  store.carts[String(req.user.id)] = items.filter((i) => i.id !== req.params.itemId);
  if (store.carts[String(req.user.id)].length === before) {
    return res.status(404).json({ message: 'Cart item not found' });
  }
  saveStore(store);
  const nextItems = cartForUser(req.user.id);
  res.json({ message: 'Item removed', items: nextItems, ...cartTotals(nextItems) });
});

app.post('/api/checkout', requireAuth, (req, res) => {
  try {
    const customerName = validateRequiredString(req.body.customerName, 'customerName', 120);
    const email = normalizeEmail(validateRequiredString(req.body.email, 'email', 200));
    const address = validateRequiredString(req.body.address, 'address', 500);
    const paymentMethod = validateRequiredString(req.body.paymentMethod, 'paymentMethod', 60);

    const items = cartForUser(req.user.id);
    if (!items.length) return res.status(400).json({ message: 'Cart is empty' });

    const totals = cartTotals(items);
    const payment = processPayment({
      amount: totals.total,
      paymentMethod,
      orderId: `ORD-${String(store.nextIds.order).padStart(6, '0')}`,
      userId: req.user.id
    });
    const order = {
      id: `ORD-${String(store.nextIds.order++).padStart(6, '0')}`,
      userId: req.user.id,
      customerName,
      email,
      address,
      paymentMethod,
      status: payment.status,
      payment,
      items,
      subtotal: totals.subtotal,
      tax: totals.tax,
      total: totals.total,
      createdAt: new Date().toISOString()
    };

    store.orders.push(order);
    store.carts[String(req.user.id)] = [];
    saveStore(store);
    sendOrderEmail('order_created', order);

    res.status(201).json({ message: 'Order created', order });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get('/api/orders', requireAuth, (req, res) => {
  const orders = store.orders.filter((o) => o.userId === req.user.id);
  res.json({ orders, total: orders.length });
});

app.get('/api/admin/orders', requireAuth, requireAdmin, (req, res) => {
  res.json({ orders: store.orders, total: store.orders.length });
});

app.patch('/api/admin/orders/:id/status', requireAuth, requireAdmin, (req, res) => {
  const order = store.orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  let nextStatus;
  try {
    nextStatus = validateOrderStatus(req.body.status);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
  if (!canTransitionStatus(order.status, nextStatus)) {
    return res.status(400).json({ message: `Cannot change status from ${order.status} to ${nextStatus}` });
  }
  order.status = nextStatus;
  order.updatedAt = new Date().toISOString();
  saveStore(store);
  sendOrderEmail('order_status_updated', order);
  res.json({ message: 'Order status updated', order });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
  console.log(`Data file: ${DATA_PATH}`);
  console.log(`Mode: ${NODE_ENV}`);
  console.log(`CORS origins: ${allowedOrigins.join(', ')}`);
  console.log(`Payment provider: ${PAYMENT_PROVIDER}`);
  console.log(`Email provider: ${EMAIL_PROVIDER}`);
});
