require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_PASS = process.env.GMAIL_APP_PASSWORD;

if (!GMAIL_USER || !GMAIL_PASS) {
  console.warn('WARNING: GMAIL_USER or GMAIL_APP_PASSWORD is not set.');
}

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,  // STARTTLS — port 587, works on Render free tier
  requireTLS: true,
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_PASS,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

const serviceLabels = {
  root: '🔓 Root Access',
  custom_rom: '💿 Custom ROM Installation',
  frp: '🔑 FRP Bypass / Unlock',
  flash_firmware: '⚡ Flash Firmware / Stock ROM',
  unlock_bootloader: '🔧 Unlock Bootloader',
  screen_repair: '📱 Screen Repair',
  battery_replace: '🔋 Battery Replacement',
  data_recovery: '💾 Data Recovery',
  other: '🛠️ Other / Custom Service',
};

app.post('/submit', async (req, res) => {
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      res.status(504).json({ error: 'Request timed out. Please try again.' });
    }
  }, 12000);

  try {
    const { services, telegram, phone, buildNumber, androidVersion, notes } = req.body;

    if (!services || services.length === 0 || !telegram || !phone) {
      clearTimeout(timeout);
      return res.status(400).json({ error: 'Please fill in all required fields.' });
    }

    if (!GMAIL_USER || !GMAIL_PASS) {
      clearTimeout(timeout);
      return res.status(500).json({ error: 'Email not configured on server. Contact the admin.' });
    }

    const htmlBody = `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', sans-serif; background: #0a0710; color: #ede9fe; margin: 0; padding: 20px; }
    .card { background: #110d1a; border: 1px solid #2a2040; border-radius: 16px; max-width: 560px; margin: 0 auto; overflow: hidden; }
    .header { background: linear-gradient(135deg, #6d28d9, #7c3aed, #8b5cf6); padding: 28px 32px; }
    .header h1 { margin: 0; font-size: 22px; color: #fff; font-weight: 800; }
    .header p { margin: 6px 0 0; color: rgba(255,255,255,0.75); font-size: 13px; }
    .logo-badge { display:inline-block; background: rgba(255,255,255,0.2); border-radius: 8px; padding: 4px 10px; font-size: 13px; font-weight: 700; color: #fff; letter-spacing: 1px; margin-bottom:10px; }
    .body { padding: 28px 32px; }
    .section { margin-bottom: 22px; }
    .lbl { font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #7c6f9e; margin-bottom: 7px; font-weight: 700; }
    .val { font-size: 15px; color: #ede9fe; line-height: 1.5; }
    .services-box { background: #0d0a17; border: 1px solid #2a2040; border-radius: 10px; padding: 12px 16px; }
    .svc { padding: 6px 0; font-size: 14px; color: #c4b5fd; border-bottom: 1px solid #1a1428; }
    .svc:last-child { border-bottom: none; }
    .footer { border-top: 1px solid #1a1428; padding: 16px 32px; font-size: 12px; color: #3a2f55; }
    .badge { display:inline-block; background:rgba(139,92,246,0.15); color:#a78bfa; border:1px solid rgba(139,92,246,0.3); border-radius:20px; padding:4px 14px; font-size:13px; font-weight:600; }
    .notes-box { background:#0d0a17; border:1px solid #2a2040; border-radius:10px; padding:12px 16px; font-size:14px; color:#c4b5fd; line-height:1.6; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="logo-badge">JEPFX</div>
      <h1>📲 New Booking Request</h1>
      <p>Submitted via JEPFX Booking Form</p>
    </div>
    <div class="body">
      <div class="section">
        <div class="lbl">Requested Services</div>
        <div class="services-box">
          ${services.map(s => `<div class="svc">${serviceLabels[s] || s}</div>`).join('')}
        </div>
      </div>
      <div class="section">
        <div class="lbl">Telegram</div>
        <div class="val"><span class="badge">@${telegram.replace('@','')}</span></div>
      </div>
      <div class="section">
        <div class="lbl">Phone Model</div>
        <div class="val">${phone}</div>
      </div>
      <div class="section">
        <div class="lbl">Build Number</div>
        <div class="val">${buildNumber || '<em style="color:#3a2f55">Not provided</em>'}</div>
      </div>
      <div class="section">
        <div class="lbl">Android Version</div>
        <div class="val">${androidVersion || '<em style="color:#3a2f55">Not provided</em>'}</div>
      </div>
      ${notes ? `<div class="section"><div class="lbl">Additional Notes</div><div class="notes-box">${notes}</div></div>` : ''}
    </div>
    <div class="footer">JEPFX Booking • ${new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila' })} PHT</div>
  </div>
</body>
</html>`;

    await transporter.sendMail({
      from: `"JEPFX Booking" <${GMAIL_USER}>`,
      to: GMAIL_USER,
      subject: `📲 JEPFX Booking — ${phone} | ${services.length} service${services.length > 1 ? 's' : ''}`,
      html: htmlBody,
    });

    clearTimeout(timeout);
    if (!res.headersSent) res.json({ success: true });

  } catch (err) {
    clearTimeout(timeout);

    // Detailed logs visible in Render dashboard
    console.error('=== EMAIL ERROR ===');
    console.error('Message:', err.message);
    console.error('Code:', err.code);
    console.error('Response:', err.response);
    console.error('ResponseCode:', err.responseCode);
    console.error('==================');

    let userMsg = 'Failed to send email.';
    if (err.responseCode === 535 || err.code === 'EAUTH') {
      userMsg = 'Gmail rejected credentials (535). Make sure you used an App Password, not your real password.';
    } else if (err.responseCode === 534) {
      userMsg = 'Gmail requires App Password (534). Regular passwords are not allowed.';
    } else if (err.code === 'ECONNECTION' || err.code === 'ETIMEDOUT') {
      userMsg = 'Could not reach Gmail SMTP. Try redeploying the server.';
    } else if (err.message) {
      userMsg = `Email error: ${err.message}`;
    }

    if (!res.headersSent) {
      res.status(500).json({ error: userMsg });
    }
  }
});

// Health check — ping this with UptimeRobot to prevent Render cold starts
app.get('/ping', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ JEPFX Booking running on port ${PORT}`);
  console.log(`📧 Gmail user: ${GMAIL_USER || 'NOT SET ⚠️'}`);
  console.log(`🔑 App password set: ${GMAIL_PASS ? 'YES ✅' : 'NO ⚠️'}`);

  // Test SMTP connection on startup
  if (GMAIL_USER && GMAIL_PASS) {
    transporter.verify((error) => {
      if (error) {
        console.error('❌ SMTP verify failed:', error.message, '| Code:', error.code);
      } else {
        console.log('✅ Gmail SMTP connection verified — ready to send!');
      }
    });
  }
});
