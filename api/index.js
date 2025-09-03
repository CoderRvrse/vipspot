import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Resend } from 'resend';

const app = express();

// Trust Heroku proxy for rate limiting
app.set('trust proxy', 1);

// ----- Config -----
const ALLOWED = (process.env.ALLOWED_ORIGINS || '')
  .split(',').map(s => s.trim()).filter(Boolean);
const resend = new Resend(process.env.RESEND_API_KEY);
const CONTACT_TO = process.env.CONTACT_TO;             // e.g. you@vipspot.net
const CONTACT_FROM = process.env.CONTACT_FROM || 'VIPSpot <noreply@vipspot.net>';

// ----- Middleware -----
app.use(helmet({ contentSecurityPolicy: false })); // API-only
app.use(express.json({ limit: '20kb' }));
app.use(cors({
  origin(origin, cb) {
    if (!origin) return cb(null, true); // curl/Postman
    return ALLOWED.includes(origin) ? cb(null, true) : cb(new Error('CORS'));
  },
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  maxAge: 86400
}));
const limiter = rateLimit({ windowMs: 60_000, max: 5 });
app.use('/contact', limiter);

// ----- Utils -----
const esc = s => String(s || '').replace(/[&<>"']/g, c =>
  ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// ----- Health -----
app.get('/healthz', (req, res) => res.json({ ok: true }));

// ----- Contact -----
app.post('/contact', async (req, res) => {
  try {
    const { name='', email='', message='', company='', timestamp } = req.body || {};

    // Honeypot + timing guard (≥3s)
    if (company) return res.status(200).json({ ok: true });
    if (typeof timestamp === 'number' && Date.now() - timestamp < 3000)
      return res.status(429).json({ ok: false, error: 'Too fast' });

    // Validation
    if (!name || !email || !message)
      return res.status(400).json({ ok: false, error: 'Missing fields' });
    if (name.length > 120 || message.length > 4000)
      return res.status(400).json({ ok: false, error: 'Too long' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return res.status(400).json({ ok: false, error: 'Invalid email' });

    const html = `
      <div style="font-family:ui-sans-serif,system-ui,Segoe UI,Roboto;line-height:1.6">
        <h2>New VIPSpot contact</h2>
        <p><strong>Name:</strong> ${esc(name)}</p>
        <p><strong>Email:</strong> ${esc(email)}</p>
        <p><strong>Message:</strong></p>
        <pre style="white-space:pre-wrap;background:#0f1320;color:#e8f3ff;padding:12px;border-radius:8px">${esc(message)}</pre>
      </div>`;

    const r = await resend.emails.send({
      to: CONTACT_TO,
      from: CONTACT_FROM,
      reply_to: email,
      subject: `VIPSpot contact — ${name}`,
      html
    });

    res.json({ ok: true, id: r.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Email failed' });
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log('API up on ' + port));