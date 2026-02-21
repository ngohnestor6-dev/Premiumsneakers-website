const { useState, useEffect } = React;

const DEMO_SHOES = [
  { id: 1, name: 'Air Runner Pro', price: 129.99, description: 'High-performance running shoes', emoji: '🏃', bgColor: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E72 100%)', size: [6, 7, 8, 9, 10, 11, 12], rating: 4.5 },
  { id: 2, name: 'Urban Basketball', price: 149.99, description: 'Classic basketball shoes', emoji: '🏀', bgColor: 'linear-gradient(135deg, #FFA348 0%, #FF7A59 100%)', size: [7, 8, 9, 10, 11, 12, 13], rating: 4.7 },
  { id: 3, name: 'Casual Canvas', price: 59.99, description: 'Comfortable everyday shoes', emoji: '👟', bgColor: 'linear-gradient(135deg, #4ECDC4 0%, #44A5AA 100%)', size: [5, 6, 7, 8, 9, 10, 11, 12], rating: 4.3 },
  { id: 4, name: 'Trail Blazer', price: 139.99, description: 'Rugged hiking shoes', emoji: '🥾', bgColor: 'linear-gradient(135deg, #95E77D 0%, #7AC74F 100%)', size: [6, 7, 8, 9, 10, 11, 12, 13], rating: 4.6 },
  { id: 5, name: 'Soccer Striker', price: 119.99, description: 'Lightweight soccer cleats', emoji: '⚽', bgColor: 'linear-gradient(135deg, #9B59B6 0%, #8E44AD 100%)', size: [6, 7, 8, 9, 10, 11, 12], rating: 4.8 },
  { id: 6, name: 'Elegant Formal', price: 199.99, description: 'Premium formal shoes', emoji: '👞', bgColor: 'linear-gradient(135deg, #2C3E50 0%, #34495E 100%)', size: [7, 8, 9, 10, 11, 12], rating: 4.4 }
];

function Header({ currentPage, setCurrentPage, cartCount }) {
  return (
    <header>
      <div className="container">
        <div className="logo" onClick={() => setCurrentPage('shop')} style={{ cursor: 'pointer' }}>
          👟 ShoeStore
        </div>
        <nav>
          <button onClick={() => setCurrentPage('shop')}>Shop</button>
          <button onClick={() => setCurrentPage('cart')} className="cart-icon">
            🛒 Cart {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </button>
        </nav>
      </div>
    </header>
  );
}

function ShopPage({ setCurrentPage, setSelectedShoe }) {
  return (
    <div className="container">
      <div className="hero">
        <h1>Welcome to ShoeStore</h1>
        <p>Find premium quality shoes for every occasion</p>
      </div>
      <h2 className="mb-20">Available Shoes</h2>
      <div className="shop-container">
        {DEMO_SHOES.map(shoe => (
          <div key={shoe.id} className="shoe-card">
            <div className="shoe-image" style={{ background: shoe.bgColor }}>
              <div style={{ fontSize: '60px' }}>{shoe.emoji}</div>
            </div>
            <div className="shoe-info">
              <div className="shoe-name">{shoe.name}</div>
              <div className="shoe-description">{shoe.description}</div>
              <div className="shoe-price">${shoe.price}</div>
              <div className="shoe-rating">⭐ {shoe.rating}</div>
              <button className="btn btn-primary" onClick={() => { setSelectedShoe(shoe); setCurrentPage('product'); }} style={{ width: '100%' }}>
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductPage({ selectedShoe, setCurrentPage, addToCart }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null);
  const [message, setMessage] = useState('');

  if (!selectedShoe) return <div className="loading">No product selected</div>;

  const handleAdd = () => {
    if (!selectedSize) { alert('Please select a size'); return; }
    addToCart(selectedShoe.id, quantity, selectedSize);
    setMessage('✓ Added to cart!');
    setTimeout(() => setMessage(''), 2000);
  };

  return (
    <div className="container">
      <button className="btn btn-secondary mb-20" onClick={() => setCurrentPage('shop')}>← Back</button>
      <div className="product-detail">
        <div className="product-image" style={{ background: selectedShoe.bgColor }}>
          <div style={{ fontSize: '120px' }}>{selectedShoe.emoji}</div>
        </div>
        <div className="product-info">
          <h1>{selectedShoe.name}</h1>
          <div className="product-price">${selectedShoe.price}</div>
          <div className="shoe-rating">⭐ {selectedShoe.rating}</div>
          <p>{selectedShoe.description}</p>
          <div className="size-selector">
            <label>Select Size:</label>
            <div className="size-options">
              {selectedShoe.size.map(size => (
                <button key={size} className={`size-option ${selectedSize === size ? 'selected' : ''}`} onClick={() => setSelectedSize(size)}>
                  {size}
                </button>
              ))}
            </div>
          </div>
          <div className="quantity-selector">
            <label>Quantity: </label>
            <input type="number" min="1" max="10" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value))} className="quantity-input" />
          </div>
          <button className="btn btn-primary" style={{ width: '100%', padding: '15px', fontSize: '16px' }} onClick={handleAdd}>
            Add to Cart
          </button>
          {message && <div className="success mt-20">{message}</div>}
        </div>
      </div>
    </div>
  );
}

function CartPage({ cartItems, setCurrentPage, removeFromCart, updateQuantity }) {
  if (cartItems.length === 0) {
    return (
      <div className="container">
        <div className="empty-cart">
          <h2>Your cart is empty</h2>
          <button className="btn btn-primary mt-20" onClick={() => setCurrentPage('shop')}>Continue Shopping</button>
        </div>
      </div>
    );
  }

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);

  return (
    <div className="container">
      <h1 className="mb-20">Shopping Cart</h1>
      <div className="cart-container">
        <div className="cart-items">
          {cartItems.map((item, i) => (
            <div key={i} className="cart-item">
              <div className="cart-item-image" style={{ background: item.bgColor }}>
                <div style={{ fontSize: '40px' }}>{item.emoji}</div>
              </div>
              <div className="cart-item-info">
                <div className="cart-item-name">{item.name}</div>
                <div className="cart-item-size">Size: {item.size}</div>
                <div className="cart-item-price">${item.price}</div>
                <input type="number" min="1" value={item.quantity} onChange={(e) => updateQuantity(item.id, item.size, parseInt(e.target.value))} style={{ width: '60px', padding: '5px' }} />
                <button className="btn btn-secondary" onClick={() => removeFromCart(item.id, item.size)}>Remove</button>
              </div>
              <div style={{ textAlign: 'right', fontWeight: 'bold', color: '#667eea' }}>${(item.price * item.quantity).toFixed(2)}</div>
            </div>
          ))}
        </div>
        <div className="cart-summary">
          <h3>Order Summary</h3>
          <div className="summary-row"><span>Total:</span><span>${total}</span></div>
          <button className="btn btn-primary" style={{ width: '100%', padding: '12px', marginTop: '20px' }} onClick={() => setCurrentPage('checkout')}>Checkout</button>
        </div>
      </div>
    </div>
  );
}

function CheckoutPage({ cartItems, setCurrentPage, handleCheckout }) {
  const [form, setForm] = useState({ customerName: '', email: '', address: '', paymentMethod: 'credit-card' });
  const [loading, setLoading] = useState(false);

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await handleCheckout(form);
    setCurrentPage('confirmation');
  };

  return (
    <div className="container">
      <button className="btn btn-secondary mb-20" onClick={() => setCurrentPage('cart')}>← Back</button>
      <h1 className="mb-20">Checkout</h1>
      <div className="checkout-container">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <h2>Shipping Information</h2>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" required placeholder="John Doe" value={form.customerName} onChange={(e) => setForm({...form, customerName: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" required placeholder="john@example.com" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Address</label>
            <input type="text" required placeholder="123 Main St" value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Payment</label>
            <select value={form.paymentMethod} onChange={(e) => setForm({...form, paymentMethod: e.target.value})}>
              <option value="credit-card">Credit Card</option>
              <option value="debit-card">Debit Card</option>
              <option value="paypal">PayPal</option>
            </select>
          </div>
          <button type="submit" className="btn-submit" disabled={loading}>{loading ? 'Processing...' : `Place Order - $${total}`}</button>
        </form>
        <div className="checkout-summary">
          <h3>Order Summary</h3>
          {cartItems.map((item, i) => (
            <div key={i} className="checkout-item">
              <span>{item.name} x {item.quantity}</span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="checkout-total"><span>Total:</span><span>${total}</span></div>
        </div>
      </div>
    </div>
  );
}

function ConfirmationPage({ lastOrder, setCurrentPage }) {
  return (
    <div className="container">
      <div className="order-confirmation">
        <h2>✓ Order Confirmed!</h2>
        {lastOrder && (
          <>
            <p style={{ marginBottom: '20px' }}>Order ID: <strong>#{lastOrder.orderId}</strong></p>
            <div className="order-details">
              <div className="order-detail-row"><span>Name:</span><strong>{lastOrder.customerName}</strong></div>
              <div className="order-detail-row"><span>Email:</span><strong>{lastOrder.email}</strong></div>
              <div className="order-detail-row"><span>Address:</span><strong>{lastOrder.address}</strong></div>
              <div className="order-detail-row"><span>Total:</span><strong style={{ color: '#667eea' }}>${lastOrder.total}</strong></div>
            </div>
          </>
        )}
        <button className="btn btn-primary mt-20" onClick={() => setCurrentPage('shop')}>Continue Shopping</button>
      </div>
    </div>
  );
}

function App() {
  const [page, setPage] = useState('shop');
  const [cart, setCart] = useState([]);
  const [selectedShoe, setSelectedShoe] = useState(null);
  const [lastOrder, setLastOrder] = useState(null);

  const addToCart = (id, qty, size) => {
    const shoe = DEMO_SHOES.find(s => s.id === id);
    const existing = cart.find(item => item.id === id && item.size === size);
    if (existing) {
      existing.quantity += qty;
    } else {
      cart.push({ ...shoe, quantity: qty, size });
    }
    setCart([...cart]);
  };

  const removeFromCart = (id, size) => {
    setCart(cart.filter(item => !(item.id === id && item.size === size)));
  };

  const updateQuantity = (id, size, qty) => {
    const item = cart.find(item => item.id === id && item.size === size);
    if (item) item.quantity = qty;
    setCart([...cart]);
  };

  const handleCheckout = async (formData) => {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setLastOrder({ orderId: Math.floor(Math.random() * 1000000), ...formData, items: cart, total: total.toFixed(2), status: 'Confirmed' });
    setCart([]);
  };

  return (
    <>
      <Header currentPage={page} setCurrentPage={setPage} cartCount={cart.length} />
      <main className="main-content">
        {page === 'shop' && <ShopPage setCurrentPage={setPage} setSelectedShoe={setSelectedShoe} />}
        {page === 'product' && <ProductPage selectedShoe={selectedShoe} setCurrentPage={setPage} addToCart={addToCart} />}
        {page === 'cart' && <CartPage cartItems={cart} setCurrentPage={setPage} removeFromCart={removeFromCart} updateQuantity={updateQuantity} />}
        {page === 'checkout' && <CheckoutPage cartItems={cart} setCurrentPage={setPage} handleCheckout={handleCheckout} />}
        {page === 'confirmation' && <ConfirmationPage lastOrder={lastOrder} setCurrentPage={setPage} />}
      </main>
      <footer><p>&copy; 2026 ShoeStore. All rights reserved.</p></footer>
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
