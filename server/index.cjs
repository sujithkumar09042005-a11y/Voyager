/**
 * Local development proxy server for Gemini API calls.
 * Mirrors the Vercel serverless functions at /api/chat and /api/itinerary.
 * Run with: node server/index.cjs
 * 
 * In production, use the Vercel serverless functions in /api/
 */

const express   = require('express');
const cors      = require('cors');
require('dotenv').config();

const app  = express();
const PORT = 3001;

// Vite's default dev port, plus any extra origins from DEV_ORIGINS (comma separated),
// e.g. DEV_ORIGINS=http://localhost:8123 when the frontend runs on another port.
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  ...(process.env.DEV_ORIGINS ? process.env.DEV_ORIGINS.split(',').map((o) => o.trim()) : []),
];
app.use(cors({ origin: ALLOWED_ORIGINS }));
app.use(express.json({ limit: '10mb' }));

// ─── Chat handler ─────────────────────────────────────────────────────────────

// Ordered by measured reliability and speed (4 calls each, one session): the first two answered
// every time; gemini-flash-latest failed or timed out on every call. Re-check this order
// occasionally, because model availability changes.
const CANDIDATE_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-flash-latest',
];

/** Give up on one model after `ms` so a hung request cannot use the whole client timeout. */
function withTimeout(promise, ms, label) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms / 1000}s`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

/** Longest trip the planner accepts. Keep in sync with api/itinerary.ts and src/lib/tripLimits.ts. */
const MAX_TRIP_DAYS = 60;
const MAX_DAYS_PER_SECTION = 7;
const SECTION_CONCURRENCY = 4;
const TOTAL_BUDGET_MS = 50000;

/** Split a trip into balanced sections, e.g. 8 days -> 4 + 4 and 60 days -> 9 sections of 6 or 7. */
function planSections(totalDays) {
  const count = Math.ceil(totalDays / MAX_DAYS_PER_SECTION);
  const size = Math.ceil(totalDays / count);
  const sections = [];
  for (let start = 1; start <= totalDays; start += size) {
    sections.push({ start, end: Math.min(start + size - 1, totalDays) });
  }
  return sections;
}

/** Run fn over items with at most `limit` in flight, and stop starting new work after a failure. */
async function mapWithLimit(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  let failed = false;
  async function worker() {
    while (!failed && next < items.length) {
      const index = next++;
      try {
        results[index] = await fn(items[index]);
      } catch (err) {
        failed = true;
        throw err;
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

app.post('/api/chat', async (req, res) => {
  const { GoogleGenerativeAI } = require('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  try {
    const { messages, destinationContext } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY not set in .env' });
    }
    if (!messages?.length) {
      return res.status(400).json({ error: 'Messages are required' });
    }

    const SYSTEM_PROMPT = `You are Voyager AI, an expert, friendly travel assistant with deep knowledge of world destinations, authentic cuisine, local transit, and logistics.
Provide comprehensive, structured answers formatted in clean markdown.
IMPORTANT: Whenever quoting prices, budgets, meal costs, or ticket estimates, ALWAYS state amounts in Indian Rupees (₹ INR). Never cut off mid-thought.`;

    let contextPrompt = SYSTEM_PROMPT;
    if (destinationContext) {
      contextPrompt += `\n\nCurrent destination: ${destinationContext.name}, ${destinationContext.country}. Key places: ${destinationContext.places.join(', ')}.`;
    }

    // Ensure history starts with a user message
    const historyMessages = messages.slice(0, -1);
    const firstUserIndex = historyMessages.findIndex((m) => m.role === 'user');
    const validHistory = firstUserIndex !== -1 ? historyMessages.slice(firstUserIndex) : [];

    const history = validHistory.map((m) => ({
      role:  m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const lastMessage = messages[messages.length - 1];

    for (const modelName of CANDIDATE_MODELS) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: contextPrompt,
        });

        const chat = model.startChat({
          history,
          generationConfig: { maxOutputTokens: 8192, temperature: 0.7 },
        });

        const result = await withTimeout(chat.sendMessage(lastMessage.content), 10000, modelName);
        const text = result.response.text();
        if (text && text.trim().length > 0) {
          return res.json({ content: text });
        }
      } catch (e) {
        console.warn(`[Proxy Fallback] Model ${modelName} failed, trying next:`, e.message);
        continue;
      }
    }

    // Fallback if all rate limited
    const destName = destinationContext?.name || 'your chosen destination';
    const budgetNote = destinationContext?.avgDailyBudget || '₹4,500 – ₹12,000 per day';
    const fallbackResponse = `### 🧭 Voyager Travel Guidance for ${destName}

- **Estimated Budget**: Plan for approximately **${budgetNote}** including boutique stays, authentic meals, and local transit.
- **Top Highlights**: Allocate time for cultural landmarks, morning walking tours, and scenic sunset viewpoints.
- **Dining Recommendations**: Seek out local, highly-rated family-run eateries where meals typically range from **₹400 to ₹1,200 (INR)** per person.
- **Logistics Tip**: Purchase local transit day passes to save up to 40% on travel.`;

    res.json({ content: fallbackResponse, degraded: true });
  } catch (err) {
    console.error('[proxy /api/chat]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── Itinerary handler ────────────────────────────────────────────────────────

app.post('/api/itinerary', async (req, res) => {
  const { GoogleGenerativeAI } = require('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not set in .env' });
  }

  try {
    const { formValues, destinationData } = req.body;

    const requestedDays = Math.floor(Number(formValues.days));
    if (!Number.isFinite(requestedDays) || requestedDays < 1 || requestedDays > MAX_TRIP_DAYS) {
      return res.status(400).json({ error: `Trip length must be between 1 and ${MAX_TRIP_DAYS} days` });
    }

    const placesText = destinationData.places
      .map((p) => `- ${p.name} (${p.category}): ${p.description}`)
      .join('\n');
    const interests = Array.isArray(formValues.interests) ? formValues.interests : [];

    const buildPrompt = (section) => {
      const sectionDays = section.end - section.start + 1;
      const sectionNote = sectionDays < requestedDays
        ? ` THIS REQUEST COVERS ONLY DAYS ${section.start} TO ${section.end}. Return exactly ${sectionDays} entries in "days", numbered ${section.start} to ${section.end}. Do not write a farewell or departure day unless day ${requestedDays} is included.`
        : '';
      const longTripNote = requestedDays > 7
        ? ' This is a long trip: vary the days, include day trips to nearby towns, add a lighter rest day each week, and never repeat the same place on different days.'
        : '';
      return `You are Voyager AI, an expert travel planner. Generate a detailed ${requestedDays}-day itinerary for ${destinationData.name}, ${destinationData.country}.${sectionNote}${longTripNote}

Places: ${placesText}
Pace: ${formValues.pace}
Interests: ${interests.join(', ') || 'general sightseeing'}
Currency Requirement: Quote any estimated costs, fees, or food recommendations strictly in Indian Rupees (INR).

Structure:
{"destinationName":"string","totalDays":number,"pace":"string","interests":[],"days":[{"dayNumber":1,"title":"string","theme":"string","stops":[{"time":"HH:MM","place":"string","category":"string","notes":"string (include realistic INR costs)","durationMinutes":number}],"tips":"string"}]}

Include 3-6 stops per day depending on pace. Respond with JSON only.`;
    };

    const deadline = Date.now() + TOTAL_BUDGET_MS;

    // 503 and friends clear within a second or two. 429 (quota) does not, so it moves on to the next model.
    const isTransient = (e) => /\[(500|502|503|504) /.test(e.message || '');
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const draftSection = async (section) => {
      const expectedDays = section.end - section.start + 1;
      const prompt = buildPrompt(section);
      let lastError = null;
      for (const modelName of CANDIDATE_MODELS) {
        // One quick retry on the same model when Google reports a brief capacity error
        for (let attempt = 1; attempt <= 2; attempt++) {
          try {
            const remaining = deadline - Date.now();
            if (remaining < 3000) throw new Error('out of time budget');
            const model = genAI.getGenerativeModel({
              model: modelName,
              generationConfig: {
                responseMimeType: 'application/json',
                maxOutputTokens: Math.min(8192, 1200 + expectedDays * 900),
                temperature: 0.5,
              },
            });
            const perCall = Math.min(25000, remaining, 8000 + expectedDays * 2500);
            const result = await withTimeout(model.generateContent(prompt), perCall, modelName);
            const parsed = JSON.parse(result.response.text().trim());
            if (!parsed.days || !Array.isArray(parsed.days)) throw new Error('missing days array');
            if (parsed.days.length !== expectedDays) throw new Error(`expected ${expectedDays} days, got ${parsed.days.length}`);
            // Never trust the model's own numbering: renumber so sections join up exactly
            parsed.days = parsed.days.map((day, i) => ({ ...day, dayNumber: section.start + i }));
            return parsed;
          } catch (e) {
            lastError = e;
            console.warn(`[Proxy Itinerary] ${modelName} failed for days ${section.start}-${section.end} (attempt ${attempt}):`, e.message);
            if (attempt === 1 && isTransient(e) && deadline - Date.now() > 8000) {
              await sleep(900);
              continue;
            }
            break;
          }
        }
      }
      throw lastError || new Error('no model produced a valid section');
    };

    let parts;
    try {
      parts = await mapWithLimit(planSections(requestedDays), SECTION_CONCURRENCY, draftSection);
    } catch (e) {
      return res.status(503).json({ error: 'The AI is busy right now. Please try again in a moment.' });
    }

    res.json({
      ...parts[0],
      totalDays: requestedDays,
      days: parts.flatMap((part) => part.days),
      destinationId: formValues.destinationId,
      generatedAt: new Date(),
    });
  } catch (err) {
    console.error('[proxy /api/itinerary]', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🛠️  Dev proxy running at http://localhost:${PORT}`);
  console.log(`   Gemini key: ${process.env.GEMINI_API_KEY ? '✅ loaded' : '❌ missing'}`);
});
