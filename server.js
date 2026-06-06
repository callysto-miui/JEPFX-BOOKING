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
    body { font-family: 'Segoe UI', sans-serif; background: #0f0f0f; color: #e0e0e0; margin: 0; padding: 20px; }
    .card { background: #1a1a1a; border: 1px solid #333; border-radius: 12px; max-width: 560px; margin: 0 auto; overflow: hidden; }
    .header { background: linear-gradient(135deg, #00c6ff, #0072ff); padding: 28px 32px; }
    .header h1 { margin: 0; font-size: 22px; color: #fff; letter-spacing: 1px; }
    .header p { margin: 4px 0 0; color: rgba(255,255,255,0.8); font-size: 13px; }
    .body { padding: 28px 32px; }
    .section { margin-bottom: 22px; }
    .label { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #666; margin-bottom: 6px; }
    .value { font-size: 15px; color: #e0e0e0; line-height: 1.5; }
    .services { background: #111; border: 1px solid #2a2a2a; border-radius: 8px; padding: 14px 18px; }
    .service-item { display: flex; align-items: center; gap: 8px; padding: 5px 0; font-size: 14px; color: #c0f0ff; }
    .footer { border-top: 1px solid #222; padding: 18px 32px; font-size: 12px; color: #555; }
    .badge { display: inline-block; background: #0072ff22; color: #00c6ff; border: 1px solid #0072ff55; border-radius: 20px; padding: 3px 12px; font-size: 12px; margin-top: 4px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>📲 New Service Request</h1>
      <p>Submitted via your booking form</p>
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
        <div class="value">${buildNumber || '<em style="color:#555">Not provided</em>'}</div>
      </div>
      <div class="section">
        <div class="label">Android Version</div>
        <div class="value">${androidVersion || '<em style="color:#555">Not provided</em>'}</div>
      </div>
      ${notes ? `<div class="section">
        <div class="label">Additional Notes</div>
        <div class="value" style="background:#111;border:1px solid #2a2a2a;border-radius:8px;padding:12px 16px;">${notes}</div>
      </div>` : ''}
    </div>
    <div class="footer">Sent from your Phone Service Booking Form • ${new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila' })} PHT</div>
  </div>
</body>
</html>
  `;

  try {
    await transporter.sendMail({
      from: `"Phone Service Booking" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      subject: `📲 New Service Request — ${phone} (${services.length} service${services.length > 1 ? 's' : ''})`,
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
