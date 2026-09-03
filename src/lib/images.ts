import axios from 'axios';
import type { ImageResult } from '../types';

const BASE_URL = 'https://api.pexels.com/v1';
const API_KEY = import.meta.env.VITE_PEXELS_API_KEY;

// ─── Query Optimizer ─────────────────────────────────────────────────────────
// Crafts better search terms than raw destination names for more relevant results.

function buildSearchQuery(term: string, context?: string): string {
  const cleaned = term.replace(/[()]/g, '').trim();
  if (context === 'destination') {
    return `${cleaned} travel landscape`;
  }
  if (context === 'place') {
    return cleaned;
  }
  return cleaned;
}

// ─── Response Transformer ────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformPexelsPhoto(photo: any): ImageResult {
  return {
    url:              photo.src?.large2x ?? photo.src?.large ?? photo.src?.original,
    thumbUrl:         photo.src?.medium ?? photo.src?.small,
    photographer:     photo.photographer,
    photographerUrl:  photo.photographer_url,
    alt:              photo.alt || 'Travel destination photo',
    source:           'pexels',
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Fetches a destination hero image from Pexels.
 * Returns null if API key is missing or no results found — caller should use fallback.
 */
export async function fetchDestinationImage(
  destinationName: string,
  country: string,
): Promise<ImageResult | null> {
  if (!API_KEY) return null;

  try {
    const query = buildSearchQuery(`${destinationName} ${country}`, 'destination');
    const response = await axios.get(`${BASE_URL}/search`, {
      headers: { Authorization: API_KEY },
      params: { query, per_page: 5, orientation: 'landscape' },
    });

    const photos = response.data.photos;
    if (!photos?.length) return null;

    // Pick the best photo (prefer wider aspect ratio for hero use)
    const best = photos.find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (p: any) => p.width / p.height > 1.5,
    ) ?? photos[0];

    return transformPexelsPhoto(best);
  } catch {
    return null; // Silent fail — caller uses fallback image
  }
}

/**
 * Fetches a place-specific image from Pexels.
 * Returns null on failure — caller should use place.fallbackImage.
 */
export async function fetchPlaceImage(placeName: string): Promise<ImageResult | null> {
  if (!API_KEY) return null;

  try {
    const query = buildSearchQuery(placeName, 'place');
    const response = await axios.get(`${BASE_URL}/search`, {
      headers: { Authorization: API_KEY },
      params: { query, per_page: 3, orientation: 'landscape' },
    });

    const photos = response.data.photos;
    if (!photos?.length) return null;

    return transformPexelsPhoto(photos[0]);
  } catch {
    return null;
  }
}

/**
 * Fetches multiple images for a search term (for gallery use).
 */
export async function fetchImages(
  query: string,
  count = 6,
): Promise<ImageResult[]> {
  if (!API_KEY) return [];

  try {
    const response = await axios.get(`${BASE_URL}/search`, {
      headers: { Authorization: API_KEY },
      params: { query, per_page: count, orientation: 'landscape' },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (response.data.photos ?? []).map(transformPexelsPhoto);
  } catch {
    return [];
  }
}
