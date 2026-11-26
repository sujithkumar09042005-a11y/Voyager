import { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface ItineraryStop {
  time: string;
  place: string;
  category?: string;
  notes: string;
  durationMinutes?: number;
}

interface ItineraryDay {
  dayNumber: number;
  title: string;
  theme: string;
  stops: ItineraryStop[];
  tips?: string;
}

interface Itinerary {
  destinationId: string;
  destinationName: string;
  totalDays: number;
  pace: string;
  interests: string[];
  days: ItineraryDay[];
  generatedAt: Date;
  /** True when the AI was unavailable and a generic plan was returned instead. */
  degraded?: boolean;
}

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
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms / 1000}s`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}


/** Longest trip the planner accepts. Keep in sync with src/lib/tripLimits.ts and server/index.cjs. */
const MAX_TRIP_DAYS = 60;
/** Longest stretch of days asked of the AI in one call; longer trips are drafted in sections. */
const MAX_DAYS_PER_SECTION = 7;
/** Sections drafted at the same time, to stay inside provider rate limits. */
const SECTION_CONCURRENCY = 4;
/** Stop trying more models once this much time has passed (Vercel function limit is 60s). */
const TOTAL_BUDGET_MS = 50000;

interface DaySection {
  start: number;
  end: number;
}

/** Split a trip into balanced sections, e.g. 8 days -> 4 + 4 and 60 days -> 9 sections of 6 or 7. */
function planSections(totalDays: number): DaySection[] {
  const count = Math.ceil(totalDays / MAX_DAYS_PER_SECTION);
  const size = Math.ceil(totalDays / count);
  const sections: DaySection[] = [];
  for (let start = 1; start <= totalDays; start += size) {
    sections.push({ start, end: Math.min(start + size - 1, totalDays) });
  }
  return sections;
}

/** Run `fn` over `items` with at most `limit` in flight, and stop starting new work after a failure. */
async function mapWithLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
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
  section?: DaySection,
): string {
  const placesList = destination.places
    .map((p) => `- ${p.name} (${p.category}): ${p.description}`)
    .join('\n');

  const interestsList = interests.length
    ? `Traveler interests: ${interests.join(', ')}.`
    : '';

  const sectionDays = section ? section.end - section.start + 1 : days;
  const sectionNote = section && sectionDays < days
    ? `. THIS REQUEST COVERS ONLY DAYS ${section.start} TO ${section.end}. Return exactly ${sectionDays} entries in "days", numbered ${section.start} to ${section.end}. Do not write a farewell or departure day unless day ${days} is included`
    : '';
  const longTripNote = days > 7
    ? '\n- This is a long trip: vary the days, include day trips to nearby towns, add a lighter rest day each week, and never repeat the same place on different days.'
    : '';

  return `Create a detailed, day-by-day travel itinerary for ${destination.name}, ${destination.country}.

Trip details:
- Duration: ${days} day${days > 1 ? 's' : ''} in total${sectionNote}
- Travel pace: ${pace} (relaxed = fewer stops, lots of wandering; balanced = mix of sightseeing and downtime; packed = see everything, maximum efficiency)
- ${interestsList}
- Destination overview: ${destination.description}${longTripNote}
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
  expectedDays: number,
  firstDayNumber: number,
  deadline: number,
): Promise<Itinerary> {
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      responseMimeType: 'application/json',
      // roughly 700 tokens per day of JSON, with headroom
      maxOutputTokens: Math.min(8192, 1200 + expectedDays * 900),
      temperature:     0.5,
    },
  });

  const remaining = deadline - Date.now();
  if (remaining < 3000) throw new Error('out of time budget');
  const perCall = Math.min(25000, remaining, 8000 + expectedDays * 2500);

  const result = await withTimeout(model.generateContent(prompt), perCall, modelName);
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
  // A section that comes back short or long would leave gaps or duplicates in a long trip
  if (parsed.days.length !== expectedDays) {
    throw new Error(`expected ${expectedDays} days, got ${parsed.days.length}`);
  }

  // Never trust the model's own numbering: renumber so sections join up exactly
  parsed.days = parsed.days.map((day: ItineraryDay, i: number) => ({
    ...day,
    dayNumber: firstDayNumber + i,
  }));

  return {
    ...parsed,
    destinationId: '',
    generatedAt:   new Date(),
  };
}

/**
 * True for Google's short-lived capacity errors (503 and friends), which usually clear within a
 * second or two. A 429 quota error is deliberately excluded: it will not clear that fast, so the
 * next model, which has its own quota, is the better move.
 */
function isTransient(err: unknown): boolean {
  return /\[(500|502|503|504) /.test((err as Error)?.message ?? '');
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Draft one section, trying each model in turn until one returns a valid result. */
async function draftSection(
  genAI: GoogleGenerativeAI,
  destinationData: Parameters<typeof buildItineraryPrompt>[0],
  totalDays: number,
  pace: string,
  interests: string[],
  section: DaySection,
  deadline: number,
): Promise<Itinerary> {
  const expectedDays = section.end - section.start + 1;
  const prompt = buildItineraryPrompt(destinationData, totalDays, pace, interests, section);
  let lastError: unknown = null;
  for (const modelName of CANDIDATE_MODELS) {
    // One quick retry on the same model when Google reports a brief capacity error
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        return await tryGenerateItinerary(genAI, prompt, modelName, expectedDays, section.start, deadline);
      } catch (err) {
        lastError = err;
        console.warn(`[Itinerary] ${modelName} failed for days ${section.start}-${section.end} (attempt ${attempt}):`, (err as Error)?.message || err);
        if (attempt === 1 && isTransient(err) && deadline - Date.now() > 8000) {
          await sleep(900);
          continue;
        }
        break;
      }
    }
  }
  throw lastError ?? new Error('no model produced a valid section');
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

    // Never trust the client: clamp to a sane whole number of days
    const requestedDays = Math.floor(Number(formValues.days));
    if (!Number.isFinite(requestedDays) || requestedDays < 1 || requestedDays > MAX_TRIP_DAYS) {
      return res.status(400).json({ error: `Trip length must be between 1 and ${MAX_TRIP_DAYS} days` });
    }
    formValues.days = requestedDays;

    const interests: string[] = Array.isArray(formValues.interests) ? formValues.interests : [];
    const sections = planSections(requestedDays);
    const deadline = Date.now() + TOTAL_BUDGET_MS;

    try {
      const parts = await mapWithLimit(sections, SECTION_CONCURRENCY, (section) =>
        draftSection(genAI, destinationData, requestedDays, formValues.pace, interests, section, deadline),
      );
      const itinerary: Itinerary = {
        ...parts[0],
        totalDays: requestedDays,
        days: parts.flatMap((part) => part.days),
        destinationId: formValues.destinationId,
        generatedAt: new Date(),
      };
      return res.status(200).json(itinerary);
    } catch (err: any) {
      console.warn('[Itinerary] AI generation failed, using the generic fallback:', err?.message || err);
    }

    // Curated fallback itinerary if external AI is strictly rate-limited
    const fallbackDays = [];
    const totalDays = requestedDays;
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
      degraded: true, // generic plan built without the AI; the client labels it as an estimate
    };

    return res.status(200).json(fallbackItinerary);
  } catch (err: any) {
    console.error('[/api/itinerary] Error:', err);
    return res.status(500).json({ error: err?.message || 'Failed to generate itinerary' });
  }
}
