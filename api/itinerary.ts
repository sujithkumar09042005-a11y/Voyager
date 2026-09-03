import { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Itinerary, ItineraryDay } from '../src/types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '');

function buildItineraryPrompt(
  destinationData: { name: string; country: string; description: string; tags: string[]; places: { name: string; category: string; description: string }[]; bestTimeToVisit: string; avgDailyBudget: string; },
  days: number,
  pace: string,
  interests: string[],
): string {
  const placesText = destinationData.places
    .map((p) => `- ${p.name} (${p.category}): ${p.description}`)
    .join('\n');

  return `You are an expert travel itinerary planner. Generate a detailed ${days}-day travel itinerary for ${destinationData.name}, ${destinationData.country}.

Destination info:
${destinationData.description}

Known places to visit:
${placesText}

Best time to visit: ${destinationData.bestTimeToVisit}
Average daily budget: ${destinationData.avgDailyBudget}
Travel pace: ${pace} (${pace === 'relaxed' ? 'fewer stops, more leisure time' : pace === 'balanced' ? 'mix of activities and downtime' : 'maximum coverage, efficient schedule'})
Traveler interests: ${interests.length > 0 ? interests.join(', ') : 'general sightseeing'}

CRITICAL: Respond ONLY with valid JSON, no markdown, no explanation, no code fences. The response must be parseable by JSON.parse().

Required JSON structure:
{
  "destinationName": "string",
  "totalDays": number,
  "pace": "string",
  "interests": ["string"],
  "days": [
    {
      "dayNumber": 1,
      "title": "string (catchy day title)",
      "theme": "string (one-line description of the day's focus)",
      "stops": [
        {
          "time": "HH:MM",
          "place": "string",
          "category": "string",
          "notes": "string (2-3 sentences of practical info)",
          "durationMinutes": number
        }
      ],
      "tips": "string (one practical tip for the day, optional)"
    }
  ]
}

Include 3-6 stops per day depending on pace. Make the itinerary specific, practical, and inspiring.`;
}

async function tryGenerateItinerary(
  prompt: string,
  attempt: number,
): Promise<Itinerary> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-3.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      maxOutputTokens: 4096,
      temperature:     0.5,
    },
  });

  const result = await model.generateContent(
    attempt === 1
      ? prompt
      : `${prompt}\n\nIMPORTANT: Your previous response was not valid JSON. This is attempt 2. Respond ONLY with JSON, nothing else. Start your response with { and end with }.`,
  );

  const text = result.response
    .text()
    .trim()
    // Strip any markdown code fences if model ignores instructions
    .replace(/^```json?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  const parsed = JSON.parse(text);

  // Validate shape
  if (!parsed.days || !Array.isArray(parsed.days)) {
    throw new Error('Invalid itinerary structure: missing days array');
  }

  return {
    ...parsed,
    destinationId: '', // Will be set client-side
    generatedAt:   new Date(),
  } as Itinerary;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'Gemini API key not configured' });
  }

  try {
    const { formValues, destinationData } = req.body;

    if (!formValues || !destinationData) {
      return res.status(400).json({ error: 'formValues and destinationData are required' });
    }

    const prompt = buildItineraryPrompt(
      destinationData,
      formValues.days,
      formValues.pace,
      formValues.interests,
    );

    let itinerary: Itinerary;
    let lastError: Error | null = null;

    // Try twice: first with normal temperature, then with stricter prompt
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        itinerary = await tryGenerateItinerary(prompt, attempt);
        itinerary.destinationId = formValues.destinationId;
        return res.status(200).json(itinerary);
      } catch (err) {
        lastError = err instanceof Error ? err : new Error('Parse failed');
        if (attempt === 2) break;
        // Small delay before retry
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    // Both attempts failed — return a structured error that the client can handle
    console.error('[/api/itinerary] Both generation attempts failed:', lastError);
    return res.status(422).json({
      error:   'Failed to generate structured itinerary after 2 attempts',
      details: lastError?.message,
    });

  } catch (err) {
    console.error('[/api/itinerary] Error:', err);
    const message = err instanceof Error ? err.message : 'Failed to generate itinerary';
    return res.status(500).json({ error: message });
  }
}
