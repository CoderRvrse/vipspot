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
const CONTACT_TO = process.env.CONTACT_TO || 'contact@vipspot.net';   // goes to Gmail via Cloudflare Routing
const CONTACT_FROM = process.env.CONTACT_FROM || 'VIPSpot <noreply@vipspot.net>';
const COMPANY = process.env.COMPANY_NAME || 'VIPSpot';
const BOOKING_URL = process.env.BOOKING_URL || 'mailto:contact@vipspot.net';
const CONTACT_REPLY_TO = process.env.CONTACT_REPLY_TO || null; // keep Reply-To = visitor if present

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

// helper: simple ticket id
function makeTicketId() {
  const n = Math.random().toString(36).slice(2, 6).toUpperCase();
  const t = Date.now().toString().slice(-4);
  return `VIP-${t}${n}`;
}

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

    const ticketId = makeTicketId();
    const isoTime = new Date().toISOString();
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || 'N/A';

    // Owner notification
    const ownerSubject = `${COMPANY} contact — ${name}`;
    const ownerText = [
      `New inquiry (ticket ${ticketId})`,
      ``,
      `Name: ${name}`,
      `Email: ${email}`,
      `When: ${isoTime}`,
      `IP: ${ip}`,
      ``,
      `Message:`,
      message
    ].join('\n');

    // Visitor confirmation
    const visitorSubject = `Thanks, ${name} — we got your message at ${COMPANY}`;
    const messageSnippet = (message || '').slice(0, 260);
    const html = `
<div style="font-family:Inter,Segoe UI,Arial,sans-serif;max-width:620px;margin:0 auto;padding:24px;color:#e6f6ff;background:#0b1220;">
  <h2 style="margin:0 0 12px;color:#73e6ff;">Thanks, ${esc(name)} — we got your message ✅</h2>
  <p style="margin:0 0 16px;opacity:.9;">Ticket <strong>${ticketId}</strong></p>
  <h3 style="margin:20px 0 8px;color:#a9ff68;">What happens next</h3>
  <ul style="margin:0 0 16px;padding-left:18px;opacity:.9;">
    <li>We'll reply within 1–2 business days.</li>
    <li>Urgent? Reply to this email and include "URGENT".</li>
    <li>Prefer a quick call? <a href="${esc(BOOKING_URL)}" style="color:#73e6ff;text-decoration:none;">Book a 15-min intro</a>.</li>
  </ul>
  <h3 style="margin:20px 0 8px;color:#a9ff68;">Your message</h3>
  <blockquote style="margin:0;padding:12px 14px;border-left:3px solid #73e6ff;background:#0f1830;opacity:.95;">
    ${esc(messageSnippet)}
  </blockquote>
  <p style="margin:22px 0 0;opacity:.7;">— ${COMPANY} • noreply@vipspot.net</p>
</div>`.trim();

    const text = [
      `Hi ${name},`,
      ``,
      `Thanks for reaching out to ${COMPANY} — we received your message and created ticket ${ticketId}.`,
      ``,
      `What happens next`,
      `• We'll reply within 1–2 business days.`,
      `• If it's urgent, reply to this email and include "URGENT".`,
      `• Optional: book a quick 15-minute intro call here: ${BOOKING_URL}`,
      ``,
      `Your message`,
      `"${messageSnippet}"`,
      ``,
      `— ${COMPANY}`,
      `noreply@vipspot.net`
    ].join('\n');

    // Send owner notification
    await resend.emails.send({
      from: CONTACT_FROM,
      to: CONTACT_TO,
      reply_to: email,
      subject: ownerSubject,
      text: ownerText,
      headers: { 'X-Ticket-ID': ticketId }
    });

    // Send visitor confirmation (only if email validated)
    await resend.emails.send({
      from: CONTACT_FROM,
      to: email,
      reply_to: CONTACT_REPLY_TO,
      subject: visitorSubject,
      html,
      text,
      headers: { 'X-Ticket-ID': ticketId }
    });

    res.json({ ok: true, ticketId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Email failed' });
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log('API up on ' + port));