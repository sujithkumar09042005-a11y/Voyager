/**
 * Local development proxy server for Gemini API calls.
 * Mirrors the Vercel serverless functions at /api/chat and /api/itinerary.
 * Run with: node server/index.cjs
 * 
 * In production, use the Vercel serverless functions in /api/
 */

const express   = require('express');
const cors      = require('cors');
const fs        = require('fs');
const path      = require('path');
require('dotenv').config();

const app  = express();
const PORT = 3001;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json({ limit: '10mb' }));

// ─── Favicon generator endpoint ───────────────────────────────────────────────

app.post('/api/save-favicon', (req, res) => {
  try {
    const { dataUrl, filename } = req.body;
    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
    const targetPath = path.join(__dirname, '..', 'public', filename || 'favicon.png');
    fs.writeFileSync(targetPath, base64Data, 'base64');
    console.log('Saved round favicon to:', targetPath);
    res.json({ success: true, path: targetPath });
  } catch (err) {
    console.error('Error saving favicon:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── Chat handler ─────────────────────────────────────────────────────────────

const CANDIDATE_MODELS = [
  'gemini-flash-latest',
  'gemini-flash-lite-latest',
  'gemini-3.5-flash-lite',
  'gemini-3.6-flash',
  'gemini-3.5-flash',
];

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

        const result = await chat.sendMessage(lastMessage.content);
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

    res.json({ content: fallbackResponse });
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

    const placesText = destinationData.places
      .map((p) => `- ${p.name} (${p.category}): ${p.description}`)
      .join('\n');

    const prompt = `You are Voyager AI, an expert travel planner. Generate a detailed ${formValues.days}-day itinerary for ${destinationData.name}, ${destinationData.country}.

Places: ${placesText}
Pace: ${formValues.pace}
Interests: ${formValues.interests.join(', ') || 'general sightseeing'}
Currency Requirement: Quote any estimated costs, fees, or food recommendations strictly in Indian Rupees (₹ INR).

Structure:
{"destinationName":"string","totalDays":number,"pace":"string","interests":[],"days":[{"dayNumber":1,"title":"string","theme":"string","stops":[{"time":"HH:MM","place":"string","category":"string","notes":"string (include realistic ₹ price estimates if applicable)","durationMinutes":number}],"tips":"string (include ₹ budget tips)"}]}`;

    const model  = genAI.getGenerativeModel({
      model: 'gemini-3.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.5,
      },
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const itinerary = JSON.parse(text);

    res.json({ ...itinerary, destinationId: formValues.destinationId, generatedAt: new Date() });
  } catch (err) {
    console.error('[proxy /api/itinerary]', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🛠️  Dev proxy running at http://localhost:${PORT}`);
  console.log(`   Gemini key: ${process.env.GEMINI_API_KEY ? '✅ loaded' : '❌ missing'}`);
});
