# PDF Scanner — Setup Guide

তিনটি ধাপ। একবার করলেই হবে।

---

## ধাপ ১ — Gemini API Key নিন (Free)

1. এই লিংকে যান: https://aistudio.google.com/app/apikey
2. Google account দিয়ে login করুন
3. **"Create API key"** click করুন
4. Key টি copy করে notepad-এ রাখুন

> এটাই আপনার free key। প্রতিদিন ১০০০ পেজ বিনামূল্যে।

---

## ধাপ ২ — Cloudflare Worker Deploy করুন (Free)

### ২.১ Account তৈরি
1. https://cloudflare.com → Sign up (বিনামূল্যে)
2. Dashboard-এ যান

### ২.২ Worker তৈরি
1. বাম দিকে **Workers & Pages** click করুন
2. **Create** → **Create Worker** click করুন
3. যেকোনো নাম দিন (যেমন: `pdf-ocr-proxy`)
4. **Deploy** click করুন

### ২.৩ Worker code দিন
1. Worker-এর page-এ **Edit code** click করুন
2. সব default code মুছে দিন
3. `worker.js` ফাইলের সম্পূর্ণ content paste করুন
4. **Deploy** click করুন

### ২.৪ API Key সেট করুন
1. Worker-এর **Settings** tab-এ যান
2. **Variables and Secrets** section-এ যান
3. **Add variable** click করুন:
   - Variable name: `GEMINI_API_KEY`
   - Value: আপনার Gemini API key
   - **Encrypt** check করুন
4. **Save** click করুন

### ২.৫ Worker URL নিন
- Worker-এর overview page-এ URL দেখবেন
- Format: `https://pdf-ocr-proxy.YOURNAME.workers.dev`
- এটা copy করে রাখুন

---

## ধাপ ৩ — GitHub Pages-এ Deploy করুন (Free)

### ৩.১ index.html আপডেট করুন
`index.html` ফাইল খুলুন। এই লাইনটি খুঁজুন:
```
const WORKER_URL = 'https://pdf-ocr-proxy.mondal-saikat185.workers.dev';
```
এটা বদলান:
```
const WORKER_URL = 'https://pdf-ocr-proxy.YOURNAME.workers.dev';
```
(ধাপ ২.৫-এ পাওয়া আপনার actual URL দিন)

### ৩.২ GitHub Repository তৈরি
1. https://github.com → New repository
2. Repository name: `pdf-scanner` (বা যেকোনো নাম)
3. **Public** রাখুন
4. **Create repository** click করুন

### ৩.৩ এই ফাইলগুলো upload করুন (সবগুলো লাগবে)
- `index.html`
- `manifest.json`
- `sw.js`
- `icon-192.png`
- `icon-512.png`
- `apple-touch-icon.png`
- `worker.js` (reference এর জন্য)

### ৩.৪ GitHub Pages চালু করুন
1. Repository-র **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: **main**, folder: **/ (root)**
4. **Save** click করুন
5. কিছুক্ষণ পর URL পাবেন: `https://YOURUSERNAME.github.io/pdf-scanner/`

---

## Mobile / Desktop-এ Install করুন

### Android (Chrome) — Automatic
App-এর link Chrome-এ খুললেই নিচে **"Install"** banner আসবে।
Banner-এ **Install** click করলেই home screen-এ icon যাবে।

### iPhone (Safari)
1. App-এর link Safari-তে খুলুন
2. App নিজেই instruction দেখাবে
3. Share button (□↑) → **Add to Home Screen** → **Add**

### Desktop (Chrome / Edge)
Address bar-এ ডানদিকে install icon দেখবেন, অথবা app-এর নিচে Install banner আসবে।

---

## ব্যবহার

1. App খুলুন
2. PDF ফাইল select করুন বা drag করুন
3. নিজের API key থাকলে ⚙️ click করে যোগ করুন (unlimited keys support)
4. **শুরু করুন** click করুন
5. Progress দেখুন — প্রতিটি পেজ শেষে update হবে
6. সম্পূর্ণ হলে **Download** click করুন
7. কোনো পেজ ব্যর্থ হলে **"ব্যর্থ পেজগুলো আবার চেষ্টা"** button আসবে

---

## Rate Limit সম্পর্কে

| Situation | App কী করবে |
|---|---|
| একটি key-এর limit শেষ | পরের key-তে চলে যাবে |
| সব key-এর limit শেষ | ৬০ সেকেন্ড অপেক্ষা করবে |
| Network সমস্যা | ৪ বার retry করবে |
| ঘোরানো (rotated) page | স্বয়ংক্রিয়ভাবে ঠিক করবে |
| পেজ ৫০ সেকেন্ড আটকে থাকলে | warning দেখাবে |

---

## খরচ

| সার্ভিস | খরচ |
|---|---|
| GitHub Pages | সম্পূর্ণ বিনামূল্যে |
| Cloudflare Workers | বিনামূল্যে (১ লক্ষ request/দিন) |
| Gemini API free tier | বিনামূল্যে (১০০০ পেজ/দিন) |
| Gemini API paid | ~₹২-৩ প্রতি ১০০ পেজ |
