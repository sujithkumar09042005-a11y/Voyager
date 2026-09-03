import axios from 'axios';
import type { ChatMessage, Itinerary, ItineraryFormValues } from '../types';

// ─── Base URL ────────────────────────────────────────────────────────────────
// All Gemini calls go through our local Express proxy (dev) or Vercel functions (prod).
// The Gemini API key NEVER touches the client bundle.

const BASE_URL = import.meta.env.DEV
  ? 'http://localhost:3001/api'
  : '/api';

// ─── Chat ─────────────────────────────────────────────────────────────────────

export interface ChatRequestPayload {
  messages: Pick<ChatMessage, 'role' | 'content'>[];
  destinationContext?: {
    name: string;
    country: string;
    description: string;
    places: string[];
    bestTimeToVisit: string;
    avgDailyBudget: string;
  };
}

export interface ChatResponsePayload {
  content: string;
}

export async function sendChatMessage(
  payload: ChatRequestPayload,
): Promise<ChatResponsePayload> {
  const response = await axios.post<ChatResponsePayload>(
    `${BASE_URL}/chat`,
    payload,
    { timeout: 30000 },
  );
  return response.data;
}

// ─── Itinerary ────────────────────────────────────────────────────────────────

export interface ItineraryRequestPayload {
  formValues: ItineraryFormValues;
  destinationData: {
    name: string;
    country: string;
    description: string;
    tags: string[];
    places: { name: string; category: string; description: string }[];
    bestTimeToVisit: string;
    avgDailyBudget: string;
  };
}

export async function generateItinerary(
  payload: ItineraryRequestPayload,
): Promise<Itinerary> {
  const response = await axios.post<Itinerary>(
    `${BASE_URL}/itinerary`,
    payload,
    { timeout: 60000 }, // Itinerary generation can take longer
  );
  return response.data;
}
