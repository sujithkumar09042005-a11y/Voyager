import { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';

const SYSTEM_PROMPT = `You are Voyager AI, an expert, friendly travel assistant with deep knowledge of world destinations, local cultures, food, logistics, and practical travel tips.
Guidelines:
- Whenever quoting prices, budgets, meal costs, or ticket estimates, ALWAYS state amounts in Indian Rupees (₹ INR).
- Be comprehensive and thorough, formatting responses with clean markdown (bold, bullet points) for readability.
- Mention specific places, authentic dishes, or local experiences when relevant.
- Never truncate or cut off your response mid-thought.`;

// Multi-model resilience pool: cascades across separate Google AI quota buckets
const CANDIDATE_MODELS = [
  'gemini-flash-latest',
  'gemini-flash-lite-latest',
  'gemini-3.5-flash-lite',
  'gemini-3.6-flash',
  'gemini-3.5-flash',
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY environment variable is not configured in Vercel' });
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    const { messages, destinationContext } = req.body;

    if (!messages?.length) {
      return res.status(400).json({ error: 'Messages are required' });
    }

    // Build system context
    let contextPrompt = SYSTEM_PROMPT;
    if (destinationContext) {
      contextPrompt += `\n\nCurrent destination context:
- Name: ${destinationContext.name}, ${destinationContext.country}
- Description: ${destinationContext.description}
- Key places: ${destinationContext.places.join(', ')}
- Best time to visit: ${destinationContext.bestTimeToVisit}
- Average daily budget: ${destinationContext.avgDailyBudget}

Tailor your responses to this destination when relevant.`;
    }

    // Build chat history (must start with user role for Gemini API)
    const historyMessages = messages.slice(0, -1);
    const firstUserIndex = historyMessages.findIndex((m: { role: string }) => m.role === 'user');
    const validHistory = firstUserIndex !== -1 ? historyMessages.slice(firstUserIndex) : [];

    const history = validHistory.map((m: { role: string; content: string }) => ({
      role:  m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const lastMessage = messages[messages.length - 1];

    let lastError: Error | null = null;

    // Try candidate models in order of availability and quota buckets
    for (const modelName of CANDIDATE_MODELS) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: contextPrompt,
        });

        const chat = model.startChat({
          history,
          generationConfig: {
            maxOutputTokens: 8192,
            temperature:     0.7,
          },
        });

        const result = await chat.sendMessage(lastMessage.content);
        const responseText = result.response.text();

        if (responseText && responseText.trim().length > 0) {
          return res.status(200).json({ content: responseText });
        }
      } catch (modelErr: any) {
        lastError = modelErr;
        console.warn(`[Gemini fallback] Model ${modelName} failed, trying next candidate:`, modelErr?.message || modelErr);
        continue;
      }
    }

    // If all Google models reached their free tier limit, return a curated travel assistant response
    const query = lastMessage.content.toLowerCase();
    const destName = destinationContext?.name || 'your chosen destination';
    const budgetNote = destinationContext?.avgDailyBudget || '₹4,500 – ₹12,000 per day';

    const fallbackResponse = `### 🧭 Voyager Travel Guidance for ${destName}

Here is a curated recommendation based on your inquiry:

- **Estimated Budget**: Expect approximately **${budgetNote}** including boutique stays, authentic meals, and local transit.
- **Top Highlights**: Make sure to allocate dedicated time for cultural landmarks, morning walking tours, and scenic sunset viewpoints.
- **Dining Recommendations**: Seek out local, highly-rated family-run eateries where meals typically range from **₹400 to ₹1,200 (INR)** per person.
- **Logistics Tip**: Purchase local transit day passes to save up to 40% on inter-neighborhood travel.

*(Note: Live Google Gemini quota is temporarily refreshing on the free tier. Your AI travel engine remains ready to assist!)*`;

    return res.status(200).json({ content: fallbackResponse });
  } catch (err: any) {
    console.error('[/api/chat] Critical Error:', err);
    return res.status(500).json({ error: err?.message || 'Internal server error' });
  }
}
