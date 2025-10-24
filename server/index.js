/* Minimal Stripe backend for custom Checkout Session flow */
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const Stripe = require('stripe');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const { promises: fsPromises } = fs;

const app = express();
const port = Number(process.env.STRIPE_SERVER_PORT || process.env.PORT || 4242);
const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : undefined;
const stripeApiVersion = process.env.STRIPE_API_VERSION;
const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
const adminPassword = process.env.ADMIN_PASSWORD || 'change-this-password';
const contentFilePath = path.resolve(__dirname, '../public/landing-content.json');
const uploadsDir = path.resolve(__dirname, '../public/uploads');
const stripeSecretsFilePath = path.resolve(__dirname, 'stripe-secrets.json');

const ensureUploadsDir = async () => {
  try {
    await fsPromises.mkdir(uploadsDir, { recursive: true });
  } catch (error) {
    console.error('Failed to ensure uploads directory:', error);
  }
};

ensureUploadsDir();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const timestamp = Date.now();
    const randomSuffix = Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '';
    const baseName = path
      .basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, '-');
    const safeName = baseName || 'upload';
    cb(null, `${safeName}-${timestamp}-${randomSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: Number(process.env.UPLOAD_MAX_BYTES || 8 * 1024 * 1024),
  },
});
const stripeClients = new Map();

const buildReturnUrl = (req) => {
  const configuredBase = process.env.CHECKOUT_RETURN_URL_BASE || process.env.CHECKOUT_RETURN_URL;
  const originHeader = req.get('origin');
  const requestHost = req.get('host');
  const fallbackBase = originHeader || (requestHost ? `${req.protocol}://${requestHost}` : 'http://localhost:3000');
  const baseUrl = (configuredBase || fallbackBase || 'http://localhost:3000').replace(/\/$/, '');
  return `${baseUrl}/complete?session_id={CHECKOUT_SESSION_ID}`;
};

const buildLineItems = (payload, defaults) => {
  if (payload.priceId) {
    return [
      {
        price: String(payload.priceId),
        quantity: defaults.quantity,
      },
    ];
  }

  return [
    {
      price_data: {
        currency: defaults.currency,
        product_data: {
          name: payload.description || defaults.description,
        },
        unit_amount: defaults.amount,
      },
      quantity: defaults.quantity,
    },
  ];
};

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: process.env.BODY_PARSER_LIMIT || '8mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

const extractBasicCredentials = (req) => {
  const header = req.get('authorization');

  if (header && header.startsWith('Basic ')) {
    const token = header.slice('Basic '.length).trim();

    try {
      const decoded = Buffer.from(token, 'base64').toString('utf8');
      const separatorIndex = decoded.indexOf(':');

      if (separatorIndex >= 0) {
        const email = decoded.slice(0, separatorIndex);
        const password = decoded.slice(separatorIndex + 1);
        return { email, password };
      }
    } catch (error) {
      console.warn('Failed to decode basic auth token:', error);
    }
  }

  if (req.body && typeof req.body === 'object') {
    const { email, password } = req.body;

    if (email && password) {
      return { email, password };
    }
  }

  return null;
};

const isValidAdminCredentials = (credentials) => {
  return (
    credentials
    && typeof credentials.email === 'string'
    && typeof credentials.password === 'string'
    && credentials.email === adminEmail
    && credentials.password === adminPassword
  );
};

const requireAdminAuth = (req, res) => {
  const credentials = extractBasicCredentials(req);

  if (!isValidAdminCredentials(credentials)) {
    res.set('WWW-Authenticate', 'Basic realm="admin"');
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }

  return true;
};

const stripBom = (text) => {
  if (typeof text === 'string' && text.charCodeAt(0) === 0xfeff) {
    return text.slice(1);
  }
  return text;
};

const loadContent = async () => {
  const fileBuffer = await fsPromises.readFile(contentFilePath);
  const rawText = fileBuffer.toString('utf8');
  return JSON.parse(stripBom(rawText));
};

const saveContent = async (content) => {
  const payload = `${JSON.stringify(content, null, 2)}\n`;
  await fsPromises.writeFile(contentFilePath, payload, 'utf8');
};

const defaultStripeSecrets = {
  testSecretKey: '',
  liveSecretKey: '',
};

const readStripeSecrets = async () => {
  try {
    const buffer = await fsPromises.readFile(stripeSecretsFilePath);
    const parsed = JSON.parse(stripBom(buffer.toString('utf8')));

    return {
      testSecretKey: typeof parsed.testSecretKey === 'string' ? parsed.testSecretKey : '',
      liveSecretKey: typeof parsed.liveSecretKey === 'string' ? parsed.liveSecretKey : '',
    };
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      return { ...defaultStripeSecrets };
    }

    console.error('Failed to read Stripe secrets file:', error);
    throw new Error('Unable to load Stripe secrets.');
  }
};

const writeStripeSecrets = async (secrets) => {
  const payload = `${JSON.stringify(secrets, null, 2)}\n`;
  await fsPromises.writeFile(stripeSecretsFilePath, payload, 'utf8');
};

const getActiveStripeSettings = async () => {
  let stripeConfig = null;

  try {
    const content = await loadContent();
    if (content && content.checkout && typeof content.checkout === 'object') {
      stripeConfig = content.checkout.stripe;
    }
  } catch (error) {
    console.error('Failed to read landing content for Stripe settings:', error);
  }

  const mode = stripeConfig && stripeConfig.mode === 'live' ? 'live' : 'test';
  const publishableKeyCandidate =
    mode === 'live'
      ? stripeConfig && typeof stripeConfig.livePublishableKey === 'string'
        ? stripeConfig.livePublishableKey.trim()
        : ''
      : stripeConfig && typeof stripeConfig.testPublishableKey === 'string'
        ? stripeConfig.testPublishableKey.trim()
        : '';

  const secrets = await readStripeSecrets();
  const secretKeyCandidate = mode === 'live' ? secrets.liveSecretKey : secrets.testSecretKey;

  return {
    mode,
    publishableKey: publishableKeyCandidate || '',
    secretKey: typeof secretKeyCandidate === 'string' ? secretKeyCandidate.trim() : '',
  };
};

const getStripeClient = async () => {
  const settings = await getActiveStripeSettings();
  const secretKey = settings.secretKey;

  if (!secretKey) {
    return { stripe: null, settings };
  }

  const cacheKey = `${secretKey}|${stripeApiVersion || 'latest'}`;

  if (stripeClients.has(cacheKey)) {
    return { stripe: stripeClients.get(cacheKey), settings };
  }

  const options = stripeApiVersion ? { apiVersion: stripeApiVersion } : {};
  const client = new Stripe(secretKey, options);
  stripeClients.clear();
  stripeClients.set(cacheKey, client);

  return { stripe: client, settings };
};

app.post('/api/login', (req, res) => {
  const credentials = extractBasicCredentials(req);

  if (!isValidAdminCredentials(credentials)) {
    res.set('WWW-Authenticate', 'Basic realm="admin"');
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  res.json({ success: true, email: credentials.email });
});

app.get('/api/content', async (_req, res) => {
  try {
    const content = await loadContent();
    res.json(content);
  } catch (error) {
    console.error('Failed to read landing content:', error);
    res.status(500).json({ error: 'Unable to load landing content.' });
  }
});

app.put('/api/content', async (req, res) => {
  if (!requireAdminAuth(req, res)) {
    return;
  }

  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({ error: 'Content payload must be an object.' });
  }

  try {
    await saveContent(req.body);
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to write landing content:', error);
    res.status(500).json({ error: 'Unable to save landing content.' });
  }
});

app.post('/api/upload-image', (req, res) => {
  if (!requireAdminAuth(req, res)) {
    return;
  }

  upload.single('file')(req, res, (error) => {
    if (error) {
      console.error('Image upload failed:', error);
      const status = error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
      res.status(status).json({ error: error.message || 'Unable to upload image.' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded.' });
      return;
    }

    const publicPath = `/uploads/${req.file.filename}`;
    res.json({ path: publicPath });
  });
});

app.get('/api/stripe-secrets', async (req, res) => {
  if (!requireAdminAuth(req, res)) {
    return;
  }

  try {
    const secrets = await readStripeSecrets();
    res.json(secrets);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Unable to load Stripe secrets.' });
  }
});

app.put('/api/stripe-secrets', async (req, res) => {
  if (!requireAdminAuth(req, res)) {
    return;
  }

  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const nextSecrets = {
    testSecretKey: typeof body.testSecretKey === 'string' ? body.testSecretKey.trim() : '',
    liveSecretKey: typeof body.liveSecretKey === 'string' ? body.liveSecretKey.trim() : '',
  };

  try {
    await writeStripeSecrets(nextSecrets);
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to write Stripe secrets file:', error);
    res.status(500).json({ error: 'Unable to save Stripe secrets.' });
  }
});

app.post('/create-checkout-session', async (req, res) => {
  let stripeClient;
  let settings;

  try {
    const result = await getStripeClient();
    stripeClient = result.stripe;
    settings = result.settings;
  } catch (error) {
    console.error('Failed to resolve Stripe client:', error);
    return res.status(500).json({ error: 'Unable to connect to Stripe.' });
  }

  if (!stripeClient) {
    const modeLabel = settings && settings.mode === 'live' ? 'live' : 'test';
    return res.status(500).json({ error: `Add a Stripe secret key for ${modeLabel} mode in the dashboard.` });
  }

  const { quantity, amount, currency, description, priceId, metadata } = req.body || {};
  const normalizedQuantity = Number.isInteger(quantity) && quantity > 0 ? quantity : 1;
  const normalizedAmount = Number.isInteger(amount) && amount > 0 ? amount : 4999;
  const normalizedCurrency = typeof currency === 'string' && currency ? currency.toLowerCase() : 'usd';

  const defaults = {
    quantity: normalizedQuantity,
    amount: normalizedAmount,
    currency: normalizedCurrency,
    description: 'Skin bundle test checkout',
  };

  try {
    const session = await stripeClient.checkout.sessions.create({
      ui_mode: 'custom',
      mode: 'payment',
      line_items: buildLineItems({ priceId, description }, defaults),
      payment_method_types: ['card'],
      return_url: buildReturnUrl(req),
      ...(metadata && typeof metadata === 'object' ? { metadata } : {}),
      ...(process.env.STRIPE_ENABLE_AUTOMATIC_TAX === 'true'
        ? { automatic_tax: { enabled: true } }
        : {}),
    });

    res.json({ clientSecret: session.client_secret, sessionId: session.id });
  } catch (error) {
    console.error('Stripe create checkout session failed:', error);
    res.status(500).json({ error: error.message || 'Unable to create checkout session.' });
  }
});

app.get('/session-status', async (req, res) => {
  let stripeClient;

  try {
    ({ stripe: stripeClient } = await getStripeClient());
  } catch (error) {
    console.error('Failed to resolve Stripe client for session status:', error);
    return res.status(500).json({ error: 'Unable to connect to Stripe.' });
  }

  if (!stripeClient) {
    return res.status(500).json({ error: 'Stripe secret key is not configured.' });
  }

  const sessionId = req.query.session_id;

  if (!sessionId) {
    return res.status(400).json({ error: 'Missing session_id query parameter.' });
  }

  try {
    const session = await stripeClient.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent'],
    });

    const paymentIntent = session.payment_intent;

    res.json({
      id: session.id,
      status: session.status,
      payment_status: session.payment_status,
      payment_intent_id: paymentIntent ? paymentIntent.id : null,
      payment_intent_status: paymentIntent ? paymentIntent.status : null,
    });
  } catch (error) {
    console.error('Stripe session status failed:', error);
    res.status(500).json({ error: error.message || 'Unable to retrieve session status.' });
  }
});

app.listen(port, () => {
  console.log(`Stripe checkout server running on port ${port}`);
});
