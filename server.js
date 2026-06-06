require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

app.post('/submit', async (req, res) => {
  const { services, telegram, phone, buildNumber, androidVersion, notes } = req.body;

  if (!services || services.length === 0 || !telegram || !phone) {
    return res.status(400).json({ error: 'Please fill in all required fields.' });
  }

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

  const selectedServices = services.map(s => serviceLabels[s] || s).join('\n  • ');

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', sans-serif; background: #0a0710; color: #ede9fe; margin: 0; padding: 20px; }
    .card { background: #110d1a; border: 1px solid #2a2040; border-radius: 16px; max-width: 560px; margin: 0 auto; overflow: hidden; }
    .header { background: linear-gradient(135deg, #6d28d9, #7c3aed, #8b5cf6); padding: 28px 32px; }
    .header-top { display: flex; align-items: center; gap: 12px; margin-bottom: 4px; }
    .header h1 { margin: 0; font-size: 22px; color: #fff; font-weight: 800; letter-spacing: 0.5px; }
    .header p { margin: 4px 0 0; color: rgba(255,255,255,0.75); font-size: 13px; }
    .logo-badge { background: rgba(255,255,255,0.2); border-radius: 8px; padding: 4px 10px; font-size: 13px; font-weight: 700; color: #fff; letter-spacing: 1px; }
    .body { padding: 28px 32px; }
    .section { margin-bottom: 22px; }
    .label { font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #7c6f9e; margin-bottom: 7px; font-weight: 700; }
    .value { font-size: 15px; color: #ede9fe; line-height: 1.5; }
    .services { background: #0d0a17; border: 1px solid #2a2040; border-radius: 10px; padding: 12px 16px; }
    .service-item { padding: 6px 0; font-size: 14px; color: #c4b5fd; border-bottom: 1px solid #1a1428; }
    .service-item:last-child { border-bottom: none; }
    .footer { border-top: 1px solid #1a1428; padding: 16px 32px; font-size: 12px; color: #3a2f55; }
    .badge { display: inline-block; background: rgba(139,92,246,0.15); color: #a78bfa; border: 1px solid rgba(139,92,246,0.3); border-radius: 20px; padding: 4px 14px; font-size: 13px; font-weight: 600; margin-top: 2px; }
    .notes-box { background: #0d0a17; border: 1px solid #2a2040; border-radius: 10px; padding: 12px 16px; font-size: 14px; color: #c4b5fd; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="header-top">
        <span class="logo-badge">JEPFX</span>
      </div>
      <h1>📲 New Booking Request</h1>
      <p>Submitted via JEPFX Booking Form</p>
    </div>
    <div class="body">
      <div class="section">
        <div class="label">Requested Services</div>
        <div class="services">
          ${services.map(s => `<div class="service-item">${serviceLabels[s] || s}</div>`).join('')}
        </div>
      </div>
      <div class="section">
        <div class="label">Telegram</div>
        <div class="value"><span class="badge">@${telegram.replace('@','')}</span></div>
      </div>
      <div class="section">
        <div class="label">Phone Model</div>
        <div class="value">${phone}</div>
      </div>
      <div class="section">
        <div class="label">Build Number</div>
        <div class="value">${buildNumber || '<em style="color:#3a2f55">Not provided</em>'}</div>
      </div>
      <div class="section">
        <div class="label">Android Version</div>
        <div class="value">${androidVersion || '<em style="color:#3a2f55">Not provided</em>'}</div>
      </div>
      ${notes ? `<div class="section">
        <div class="label">Additional Notes</div>
        <div class="notes-box">${notes}</div>
      </div>` : ''}
    </div>
    <div class="footer">JEPFX Booking • ${new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila' })} PHT</div>
  </div>
</body>
</html>
  `;

  try {
    await transporter.sendMail({
      from: `"Phone Service Booking" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      subject: `📲 JEPFX Booking — ${phone} | ${services.length} service${services.length > 1 ? 's' : ''}`,
      html: htmlBody,
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Email error:', err);
    res.status(500).json({ error: 'Failed to send email. Please try again.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
