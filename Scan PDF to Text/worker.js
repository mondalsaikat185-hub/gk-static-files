// ─────────────────────────────────────────────────────────────
//  Cloudflare Worker — PDF OCR Proxy
//
//  Environment Variables (set in Cloudflare dashboard):
//    GEMINI_API_KEY  →  আপনার free-tier Gemini API key
//
//  এই worker টি:
//  1. Frontend থেকে image (base64) পায়
//  2. আপনার stored API key দিয়ে Gemini API call করে
//  3. Extracted text ফেরত দেয়
//  4. Optional: user-provided custom key ও support করে
// ─────────────────────────────────────────────────────────────

const GEMINI_MODEL = 'gemini-2.0-flash';

const PROMPT = `You are a precise OCR system. Extract ALL text from this document page image.

Follow these rules exactly:
- Extract every word, number, and symbol visible on the page
- Preserve the document structure: headings become # ## ###, paragraphs stay as paragraphs
- Bullet points and numbered lists must be preserved as Markdown lists
- Tables must be formatted as proper Markdown tables with | separators
- Mathematical equations: write inline math as $equation$ and block math as $$equation$$
- For Hindi (Devanagari script): extract exactly as written, do not transliterate
- For English: extract exactly as written
- Do NOT add any explanation, commentary, or preamble
- Do NOT say "The image shows..." or similar
- Output ONLY the extracted text in Markdown format
- If a page appears blank or unreadable, output: [Page could not be read]`;

export default {
  async fetch(request, env) {

    // ── CORS preflight ──
    if (request.method === 'OPTIONS') {
      return respond(null, 204);
    }

    // ── Only POST allowed ──
    if (request.method !== 'POST') {
      return respond({ error: 'Only POST requests allowed' }, 405);
    }

    // ── Parse request body ──
    let body;
    try {
      body = await request.json();
    } catch {
      return respond({ error: 'Invalid JSON in request body' }, 400);
    }

    const { imageBase64, customApiKey } = body;

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return respond({ error: 'imageBase64 field is required' }, 400);
    }

    // ── Choose API key: custom key > env key ──
    const apiKey = (customApiKey && customApiKey.trim()) || env.GEMINI_API_KEY;

    if (!apiKey) {
      return respond({
        error: 'No API key available. Set GEMINI_API_KEY in Cloudflare Worker environment variables.'
      }, 500);
    }

    // ── Call Gemini API ──
    const geminiUrl =
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

    let geminiRes;
    try {
      geminiRes = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                inline_data: {
                  mime_type: 'image/jpeg',
                  data: imageBase64
                }
              },
              { text: PROMPT }
            ]
          }],
          generationConfig: {
            temperature: 0,
            maxOutputTokens: 8192
          }
        })
      });
    } catch (err) {
      return respond({ error: `Network error calling Gemini: ${err.message}` }, 502);
    }

    // ── Handle rate limit ──
    if (geminiRes.status === 429) {
      return respond({ error: 'RATE_LIMIT' }, 429);
    }

    // ── Parse Gemini response ──
    let geminiData;
    try {
      geminiData = await geminiRes.json();
    } catch {
      return respond({ error: 'Invalid response from Gemini API' }, 502);
    }

    // ── API-level error ──
    if (geminiData.error) {
      const msg = geminiData.error.message || 'Unknown Gemini API error';
      const code = geminiData.error.code || 400;
      return respond({ error: msg }, code);
    }

    // ── Extract text ──
    const text =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    if (!text) {
      return respond({ error: 'Gemini returned empty response' }, 500);
    }

    return respond({ text }, 200);
  }
};

// ── Helper: JSON response with CORS headers ──
function respond(body, status = 200) {
  return new Response(
    body !== null ? JSON.stringify(body) : null,
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    }
  );
}
