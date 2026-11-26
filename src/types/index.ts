// ─── Destination & Place Types ────────────────────────────────────────────────

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Place {
  id: string;
  name: string;
  category: string;
  description: string;
  recommendedTime: string;
  fallbackImage: string;
  /** Resolved from Pexels API at runtime */
  liveImage?: string;
}

/** What it costs to get in. Amounts are approximate and in the local currency. */
export type EntryFee =
  | { kind: 'free'; note?: string }
  | { kind: 'paid'; currency: string; from: number; to?: number; note?: string }
  | { kind: 'varies'; note: string };

/** Visitor information for one place, kept separate from the basic Place record. */
export interface PlaceDetails {
  /** Short era label, for example "Built 1887-1889". */
  era: string;
  /** Two or three sentences of history. */
  history: string;
  fee: EntryFee;
  /** Typical opening hours, approximate. */
  hours: string;
  tips: string[];
  officialUrl?: string;
  /** Wikipedia article used as the source for the history. */
  sourceUrl?: string;
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  region: string;
  coordinates: Coordinates;
  tagline: string;
  description: string;
  bestTimeToVisit: string;
  avgDailyBudget: string;
  currency: string;
  tags: string[];
  fallbackImage: string;
  places: Place[];
}

// ─── Weather Types ────────────────────────────────────────────────────────────

export type WeatherCondition =
  | 'clear'
  | 'partly-cloudy'
  | 'cloudy'
  | 'rain'
  | 'drizzle'
  | 'thunderstorm'
  | 'snow'
  | 'mist'
  | 'unknown';

export interface WeatherData {
  temperature: number;       // Celsius
  feelsLike: number;         // Celsius
  condition: WeatherCondition;
  conditionText: string;     // Human-readable: "Partly Cloudy"
  humidity: number;          // Percentage
  windSpeed: number;         // km/h
  windDirection: string;     // "N", "NE", etc.
  visibility: number;        // km
  updatedAt: Date;
}

// ─── Image Types ──────────────────────────────────────────────────────────────

export interface ImageResult {
  url: string;
  thumbUrl: string;
  photographer: string;
  photographerUrl: string;
  alt: string;
  source: 'pexels' | 'fallback';
}

// ─── Itinerary Types ──────────────────────────────────────────────────────────

export type ItineraryPace = 'relaxed' | 'balanced' | 'packed';

export interface ItineraryStop {
  time: string;             // e.g. "09:00"
  place: string;
  category?: string;
  notes: string;
  durationMinutes?: number;
}

export interface ItineraryDay {
  dayNumber: number;
  title: string;
  theme: string;
  stops: ItineraryStop[];
  tips?: string;
}

export interface Itinerary {
  destinationId: string;
  destinationName: string;
  totalDays: number;
  pace: ItineraryPace;
  interests: string[];
  days: ItineraryDay[];
  generatedAt: Date;
  /** True when the AI was unavailable and a generic plan was returned instead. */
  degraded?: boolean;
}

export interface ItineraryFormValues {
  destinationId: string;
  days: number;
  pace: ItineraryPace;
  interests: string[];
  startDate?: string;
}

// ─── Chat Types ───────────────────────────────────────────────────────────────

export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  /** True when this reply is a canned guide because the AI was unavailable. */
  degraded?: boolean;
}

// ─── Geolocation Types ───────────────────────────────────────────────────────

export type GeolocationStatus =
  | 'idle'
  | 'pending'
  | 'granted'
  | 'denied'
  | 'unsupported';

export interface GeolocationState {
  status: GeolocationStatus;
  coords: Coordinates | null;
  error: string | null;
}

// ─── Filter Types ─────────────────────────────────────────────────────────────

export interface ExplorerFilters {
  query: string;
  regions: string[];
  tags: string[];
  budget: 'all' | 'budget' | 'mid' | 'luxury';
}
