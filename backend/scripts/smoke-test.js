/* eslint-disable no-console */
const API_BASE = (process.env.API_BASE || 'http://localhost:5000/api').replace(/\/$/, '');

async function request(path, options = {}, token = '') {
  const headers = { ...(options.headers || {}) };
  if (options.body && !headers['Content-Type']) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  let data = null;
  try {
    data = await res.json();
  } catch (err) {
    data = null;
  }

  if (!res.ok) {
    throw new Error(`${path} -> ${res.status} ${(data && data.message) || res.statusText}`);
  }
  return data;
}

async function main() {
  const suffix = Math.floor(Math.random() * 100000);
  const username = `smoke${suffix}`;
  const email = `${username}@example.com`;
  const password = 'Pass#12345';

  console.log(`[smoke] API base: ${API_BASE}`);

  const health = await request('/health');
  console.log(`[smoke] health ok (${health.status})`);

  await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password })
  });
  console.log('[smoke] register ok');

  const login = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
  const token = login.token;
  console.log('[smoke] login ok');

  const products = await request('/products');
  if (!products.products || !products.products.length) {
    throw new Error('No products found');
  }
  const firstProduct = products.products[0];
  console.log(`[smoke] products ok (${products.total})`);

  await request(
    '/cart',
    {
      method: 'POST',
      body: JSON.stringify({ productId: firstProduct.id, quantity: 1, size: '10' })
    },
    token
  );
  console.log('[smoke] cart add ok');

  const checkout = await request(
    '/checkout',
    {
      method: 'POST',
      body: JSON.stringify({
        customerName: 'Smoke Test User',
        email,
        address: '123 Smoke Street, Test City',
        paymentMethod: 'card'
      })
    },
    token
  );
  console.log(`[smoke] checkout ok (${checkout.order.id})`);
  console.log('[smoke] all checks passed');
}

main().catch((err) => {
  console.error(`[smoke] failed: ${err.message}`);
  process.exit(1);
});
