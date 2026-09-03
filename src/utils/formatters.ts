/**
 * Formats vibe / interest / tag strings into clean, elegant Title Case.
 * Handles conjunctions, special multi-word vibes, and symbol spacing.
 */
export function formatVibeName(vibe: string): string {
  if (!vibe) return '';

  const knownMap: Record<string, string> = {
    culture: 'Culture & Heritage',
    'culture & heritage': 'Culture & Heritage',
    food: 'Street Food & Dining',
    'street food': 'Street Food',
    'street food & dining': 'Street Food & Dining',
    nature: 'Nature & Views',
    'nature & views': 'Nature & Views',
    history: 'Ancient History',
    'ancient history': 'Ancient History',
    adventure: 'Adventure & Trekking',
    'adventure sports': 'Adventure Sports',
    beaches: 'Beaches & Coastal',
    coastal: 'Coastal Escapes',
    'beach & island': 'Beach & Island',
    romantic: 'Romantic Getaways',
    wellness: 'Wellness & Spa',
    'wellness & spa': 'Wellness & Spa',
    shopping: 'Local Shopping & Bazaars',
    'local shopping': 'Local Shopping',
    architecture: 'Iconic Architecture',
    nightlife: 'Vibrant Nightlife',
    photography: 'Scenic Photography',
    heritage: 'Royal Heritage',
    wildlife: 'Wildlife & Safari',
    mountains: 'Mountain Trails',
    spiritual: 'Spiritual Temples',
    culinary: 'Culinary Journeys',
    luxury: 'Luxury Stays',
    desert: 'Desert Dunes',
    islands: 'Tropical Islands',
    festivals: 'Festivals & Arts',
  };

  const lower = vibe.trim().toLowerCase();
  if (knownMap[lower]) {
    return knownMap[lower];
  }

  // General Title Case
  return vibe
    .trim()
    .split(/[\s_-]+/)
    .map((word) => {
      if (word.toLowerCase() === 'and' || word === '&') return '&';
      if (word.length === 0) return '';
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

/**
 * Capitalizes every word in a general string.
 */
export function capitalizeWord(text: string): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}
