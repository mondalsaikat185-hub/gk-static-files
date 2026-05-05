# PDF → Text Converter — Setup Guide

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
   - Value: আপনার Gemini API key (step 1 থেকে)
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
const WORKER_URL = 'https://YOUR_WORKER.YOUR_SUBDOMAIN.workers.dev';
```
এটা বদলান:
```
const WORKER_URL = 'https://pdf-ocr-proxy.YOURNAME.workers.dev';
```
(ধাপ ২.৫-এ পাওয়া আপনার actual URL দিন)

### ৩.২ GitHub Repository তৈরি
1. https://github.com → New repository
2. Repository name: `pdf-to-text` (বা যেকোনো নাম)
3. **Public** রাখুন
4. **Create repository** click করুন

### ৩.৩ ফাইল upload করুন
এই তিনটি ফাইল upload করুন:
- `index.html`
- `manifest.json`
- `worker.js` (reference এর জন্য, app-এ লাগবে না)

### ৩.৪ GitHub Pages চালু করুন
1. Repository-র **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: **main**, folder: **/ (root)**
4. **Save** click করুন
5. কিছুক্ষণ পর URL পাবেন: `https://YOURUSERNAME.github.io/pdf-to-text/`

---

## Mobile-এ Home Screen Icon যোগ করুন

### Android (Chrome)
1. App-এর link Chrome-এ খুলুন
2. মেনু (⋮) → **Add to Home screen**
3. **Add** click করুন

### iPhone (Safari)
1. App-এর link Safari-তে খুলুন
2. Share button (□↑) → **Add to Home Screen**
3. **Add** click করুন

---

## ব্যবহার

1. Icon click করে app খুলুন
2. PDF ফাইল select করুন বা drag করুন
3. নিজের extra API key থাকলে ⚙️ click করে দিন (optional)
4. **শুরু করুন** click করুন
5. Progress দেখুন — প্রতিটি পেজ শেষে update হবে
6. সম্পূর্ণ হলে **Download** click করুন

---

## Rate Limit সম্পর্কে

| Situation | App কী করবে |
|---|---|
| একটি key-এর limit শেষ | পরের key-তে চলে যাবে |
| সব key-এর limit শেষ | ৬০ সেকেন্ড অপেক্ষা করবে |
| Network সমস্যা | ৩ বার retry করবে |
| পেজ ৪৫ সেকেন্ড আটকে থাকলে | warning দেখাবে |

---

## খরচ

| সার্ভিস | খরচ |
|---|---|
| GitHub Pages | সম্পূর্ণ বিনামূল্যে |
| Cloudflare Workers | বিনামূল্যে (১ লক্ষ request/দিন) |
| Gemini API free tier | বিনামূল্যে (১০০০ পেজ/দিন) |
| Gemini API paid | ~₹২-৩ প্রতি ১০০ পেজ |
