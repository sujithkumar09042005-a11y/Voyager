import { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Itinerary } from '../src/types';

const CANDIDATE_MODELS = [
  'gemini-flash-latest',
  'gemini-flash-lite-latest',
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash',
];

function buildItineraryPrompt(
  destination: {
    name: string;
    country: string;
    description: string;
    places: { name: string; category: string; description: string }[];
    bestTimeToVisit: string;
    avgDailyBudget: string;
  },
  days: number,
  pace: string,
  interests: string[],
): string {
  const placesList = destination.places
    .map((p) => `- ${p.name} (${p.category}): ${p.description}`)
    .join('\n');

  const interestsList = interests.length
    ? `Traveler interests: ${interests.join(', ')}.`
    : '';

  return `Create a detailed, day-by-day travel itinerary for ${destination.name}, ${destination.country}.

Trip details:
- Duration: ${days} day${days > 1 ? 's' : ''}
- Travel pace: ${pace} (relaxed = fewer stops, lots of wandering; balanced = mix of sightseeing and downtime; packed = see everything, maximum efficiency)
- ${interestsList}
- Destination overview: ${destination.description}
- Key places to visit:
${placesList}

IMPORTANT PRICING REQUIREMENT:
- All cost estimates, ticket prices, meal recommendations, and budgets must be quoted in Indian Rupees (₹ INR).

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
  genAI: GoogleGenerativeAI,
  prompt: string,
  modelName: string,
): Promise<Itinerary> {
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      responseMimeType: 'application/json',
      maxOutputTokens: 4096,
      temperature:     0.5,
    },
  });

  const result = await model.generateContent(prompt);
  const text = result.response
    .text()
    .trim()
    .replace(/^```json?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  const parsed = JSON.parse(text);

  if (!parsed.days || !Array.isArray(parsed.days)) {
    throw new Error('Invalid itinerary structure: missing days array');
  }

  return {
    ...parsed,
    destinationId: '',
    generatedAt:   new Date(),
  } as Itinerary;
}

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
    return res.status(500).json({ error: 'Gemini API key not configured in Vercel environment' });
  }

  const genAI = new GoogleGenerativeAI(apiKey);

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

    let lastError: any = null;

    // Try multiple models across separate quota buckets
    for (const modelName of CANDIDATE_MODELS) {
      try {
        const itinerary = await tryGenerateItinerary(genAI, prompt, modelName);
        itinerary.destinationId = formValues.destinationId;
        return res.status(200).json(itinerary);
      } catch (err: any) {
        lastError = err;
        console.warn(`[Itinerary Fallback] Model ${modelName} failed:`, err?.message || err);
        continue;
      }
    }

    // Curated fallback itinerary if external AI is strictly rate-limited
    const fallbackDays = [];
    const totalDays = Number(formValues.days) || 3;
    const places = destinationData.places || [];

    for (let d = 1; d <= totalDays; d++) {
      const place1 = places[(d - 1) % places.length] || { name: 'Historic District', category: 'Culture', description: 'Explore authentic streets.' };
      const place2 = places[d % places.length] || { name: 'Scenic Viewpoint', category: 'Nature', description: 'Panoramic scenic vantage point.' };
      
      fallbackDays.push({
        dayNumber: d,
        title: `Day ${d}: Discovering ${place1.name}`,
        theme: `Cultural exploration & local highlights`,
        stops: [
          {
            time: '09:30',
            place: place1.name,
            category: place1.category || 'Sightseeing',
            notes: `${place1.description} Allocate around ₹800 – ₹1,500 INR for entry and guided tour.`,
            durationMinutes: 120,
          },
          {
            time: '13:00',
            place: 'Local Traditional Eatery',
            category: 'Dining',
            notes: 'Savor regional specialties. Expect approximately ₹500 – ₹900 INR per person.',
            durationMinutes: 75,
          },
          {
            time: '15:30',
            place: place2.name,
            category: place2.category || 'Exploration',
            notes: `${place2.description} Great opportunities for travel photography.`,
            durationMinutes: 90,
          },
        ],
        tips: `Stay hydrated and purchase daily metro or transit passes to save up to ₹400 INR per day.`,
      });
    }

    const fallbackItinerary: Itinerary = {
      destinationId: formValues.destinationId,
      destinationName: destinationData.name,
      totalDays: totalDays,
      pace: formValues.pace || 'balanced',
      interests: formValues.interests || ['Culture', 'Sightseeing'],
      generatedAt: new Date(),
      days: fallbackDays,
    };

    return res.status(200).json(fallbackItinerary);
  } catch (err: any) {
    console.error('[/api/itinerary] Error:', err);
    return res.status(500).json({ error: err?.message || 'Failed to generate itinerary' });
  }
}
