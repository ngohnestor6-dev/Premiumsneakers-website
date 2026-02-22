/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

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

loadEnvFile(path.join(__dirname, '..', '.env'));

const mode = String(process.env.NODE_ENV || 'development').toLowerCase();
const tokenSecret = String(process.env.TOKEN_SECRET || '');
const frontendOrigin = String(process.env.FRONTEND_ORIGIN || '');
const paymentProvider = String(process.env.PAYMENT_PROVIDER || 'mock').toLowerCase();
const emailProvider = String(process.env.EMAIL_PROVIDER || 'log').toLowerCase();
const adminUsername = String(process.env.ADMIN_USERNAME || 'Machala');
const adminPassword = String(process.env.ADMIN_PASSWORD || 'MACHALA#2024');

const failures = [];
const warnings = [];

if (!frontendOrigin) failures.push('FRONTEND_ORIGIN is required.');
if (mode === 'production' && frontendOrigin.includes('*')) {
  failures.push('FRONTEND_ORIGIN cannot contain wildcard in production.');
}
if (!tokenSecret || tokenSecret === 'dev-only-change-this-secret' || tokenSecret === 'change-this-secret-in-production') {
  failures.push('TOKEN_SECRET must be set to a strong non-default value.');
}
if (tokenSecret.length < 32) {
  warnings.push('TOKEN_SECRET should be at least 32 characters.');
}
if (mode === 'production' && adminUsername.toLowerCase() === 'machala') {
  warnings.push('Default admin username is still configured.');
}
if (mode === 'production' && adminPassword === 'MACHALA#2024') {
  warnings.push('Default admin password is still configured.');
}
if (!['mock', 'stripe', 'disabled'].includes(paymentProvider)) {
  warnings.push(`Unknown PAYMENT_PROVIDER "${paymentProvider}".`);
}
if (!['log', 'sendgrid', 'disabled'].includes(emailProvider)) {
  warnings.push(`Unknown EMAIL_PROVIDER "${emailProvider}".`);
}

console.log(`[preflight] mode=${mode}`);
console.log(`[preflight] frontend_origin=${frontendOrigin || '(empty)'}`);
console.log(`[preflight] payment_provider=${paymentProvider}`);
console.log(`[preflight] email_provider=${emailProvider}`);

for (const warning of warnings) {
  console.log(`[preflight][warn] ${warning}`);
}

if (failures.length) {
  for (const failure of failures) {
    console.error(`[preflight][error] ${failure}`);
  }
  process.exit(1);
}

console.log('[preflight] checks passed');
