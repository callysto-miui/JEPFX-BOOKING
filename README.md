# 📱 Phone Service Booking Form

A sleek booking form for phone tech services. Submits to your Gmail via email.

## Services Offered
- 🔓 Root Access
- 💿 Custom ROM
- 🔑 FRP Bypass
- ⚡ Flash Firmware
- 🔧 Unlock Bootloader
- 💾 Data Recovery
- 📱 Screen Repair
- 🛠️ Other / Custom

---

## ⚙️ Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Create Gmail App Password
1. Go to https://myaccount.google.com/security
2. Enable **2-Step Verification** (required)
3. Go to **App Passwords** (search "App passwords" in the search bar)
4. Create a new app password → Name it "Phone Service Bot"
5. Copy the 16-character password shown

### 3. Configure environment variables
```bash
cp .env.example .env
```
Edit `.env`:
```
GMAIL_USER=youremail@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
```

### 4. Run locally
```bash
npm start
```
Visit http://localhost:3000

---

## 🚀 Deploy to Render

1. Push this folder to a **GitHub repo**
2. Go to https://render.com → New → **Web Service**
3. Connect your GitHub repo
4. Set:
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Under **Environment Variables**, add:
   - `GMAIL_USER` = your Gmail address
   - `GMAIL_APP_PASSWORD` = your 16-char app password
6. Click **Deploy** ✅

Your site will be live at `https://your-app-name.onrender.com`

---

## 📧 Email Format
Each submission sends a beautifully formatted HTML email to your Gmail with:
- Selected services
- Telegram username
- Phone model
- Build number & Android version
- Any additional notes
- Timestamp (Philippine Time)
