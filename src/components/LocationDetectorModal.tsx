import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Navigation, Compass, X, Sparkles, ArrowRight,
  Loader2, AlertCircle, Search
} from 'lucide-react';
import destinations from '../data/destinations.json';
import type { Destination } from '../types';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { useDestinationImage } from '../hooks/usePexelsImage';

interface LocationDetectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface GeocodedCity {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
}

// Preset locations for quick one-click exploration
const PRESET_CITIES = [
  { label: 'Mumbai, IN', query: 'Mumbai', lat: 19.076, lng: 72.8777 },
  { label: 'Delhi, IN', query: 'Delhi', lat: 28.6139, lng: 77.209 },
  { label: 'London, UK', query: 'London', lat: 51.5074, lng: -0.1278 },
  { label: 'Tokyo, JP', query: 'Tokyo', lat: 35.6762, lng: 139.6503 },
  { label: 'New York, US', query: 'New York', lat: 40.7128, lng: -74.006 },
];

// Haversine distance formula in kilometers
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

interface SuggestionItemProps {
  destination: Destination;
  distance: number;
  onClose: () => void;
}

function SuggestionItem({ destination, distance, onClose }: SuggestionItemProps) {
  const { data: pexelsData } = useDestinationImage(destination.name, destination.country, destination.fallbackImage);
  const imageSrc = pexelsData?.url ?? destination.fallbackImage;

  return (
    <Link
      to={`/destination/${destination.id}`}
      onClick={onClose}
      className="block group focus:outline-none"
    >
      <div className="glass-card place-card-interactive overflow-hidden rounded-2xl flex flex-col sm:flex-row items-center border border-[var(--glass-border)] hover:border-accent-500 transition-all p-3 sm:p-4 gap-4 cursor-pointer">
        <div className="relative w-full sm:w-36 h-32 rounded-xl overflow-hidden flex-shrink-0 bg-surface-200">
          <img
            src={imageSrc}
            alt={destination.name}
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
          />
          <div className="absolute top-2 left-2">
            <span className="glass-dark text-white text-2xs font-bold px-2 py-0.5 rounded-full">
              {destination.country}
            </span>
          </div>
        </div>

        <div className="flex-1 w-full flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-display font-bold text-lg text-[var(--text-primary)] group-hover:text-accent-500 transition-colors">
                {destination.name}
              </h4>
              <Badge variant="accent" size="sm" className="whitespace-nowrap flex items-center gap-1 font-bold">
                <Navigation size={10} />
                {distance > 0 ? `${distance.toLocaleString('en-IN')} km away` : 'Near You'}
              </Badge>
            </div>
            <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mt-1 mb-2 font-medium">
              {destination.tagline}
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[var(--glass-border-subtle)] text-xs">
            <span className="font-bold text-accent-500">
              {destination.avgDailyBudget} <span className="text-2xs font-normal text-[var(--text-muted)]">/day</span>
            </span>
            <span className="text-[var(--text-secondary)] group-hover:text-accent-500 flex items-center gap-1 group-hover:translate-x-1 transition-transform font-bold">
              Explore <ArrowRight size={13} />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function LocationDetectorModal({ isOpen, onClose }: LocationDetectorModalProps) {
  const [status, setStatus] = useState<'idle' | 'locating' | 'success' | 'denied'>('idle');
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [cityName, setCityName] = useState<string>('');
  const [suggestions, setSuggestions] = useState<Array<{ destination: Destination; distance: number }>>([]);

  // Search by city/location state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchingCity, setSearchingCity] = useState(false);
  const [citySearchResults, setCitySearchResults] = useState<GeocodedCity[]>([]);
  const [searchError, setSearchError] = useState('');

  const modalRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const previousFocusRef = useRef<Element | null>(null);

  // Keyboard accessibility: Escape to close, focus trap, auto-focus
  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current = document.activeElement;

    const timer = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 60);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', handleKeyDown);
      (previousFocusRef.current as HTMLElement)?.focus?.();
    };
  }, [isOpen, onClose]);

  // Update suggestions based on specific coordinates
  const calculateAndApplySuggestions = (lat: number, lng: number, label: string) => {
    setUserCoords({ lat, lng });
    setCityName(label);

    const allDest = (destinations as Destination[]).map((d) => ({
      destination: d,
      distance: calculateDistance(lat, lng, d.coordinates.lat, d.coordinates.lng),
    }));

    allDest.sort((a, b) => a.distance - b.distance);
    setSuggestions(allDest.slice(0, 6));
    setStatus('success');
  };

  // Real-time GPS detection
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setStatus('denied');
      return;
    }

    setStatus('locating');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        let detectedLabel = 'Your Location';

        try {
          const res = await fetch(
            `https://api.openweathermap.org/geo/1.0/reverse?lat=${coords.lat}&lon=${coords.lng}&limit=1&appid=${import.meta.env.VITE_OPENWEATHER_API_KEY}`
          );
          if (res.ok) {
            const data = await res.json();
            if (data?.[0]?.name) {
              detectedLabel = `${data[0].name}, ${data[0].country}`;
            }
          }
        } catch {
          detectedLabel = 'Your Current Coordinates';
        }

        calculateAndApplySuggestions(coords.lat, coords.lng, detectedLabel);
      },
      () => {
        setStatus('denied');
        const defaultDest = (destinations as Destination[]).slice(0, 6).map((d) => ({
          destination: d,
          distance: 0,
        }));
        setSuggestions(defaultDest);
      },
      { timeout: 12000, enableHighAccuracy: false }
    );
  };

  // Search for any city on earth using OpenWeather Geocoding
  const handleSearchLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearchingCity(true);
    setSearchError('');
    setCitySearchResults([]);

    try {
      const res = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(searchQuery.trim())}&limit=5&appid=${import.meta.env.VITE_OPENWEATHER_API_KEY}`
      );
      if (!res.ok) throw new Error('Could not search locations');
      const data: GeocodedCity[] = await res.json();

      if (!data || data.length === 0) {
        setSearchError(`No coordinates found for "${searchQuery}". Try another city.`);
      } else if (data.length === 1) {
        const first = data[0];
        calculateAndApplySuggestions(first.lat, first.lon, `${first.name}, ${first.country}`);
      } else {
        setCitySearchResults(data);
      }
    } catch {
      setSearchError('Network error searching location. Try selecting a preset below.');
    } finally {
      setSearchingCity(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/65 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Dialog Container */}
          <motion.div
            ref={modalRef}
            className="relative w-full max-w-2xl glass-dock p-6 sm:p-8 rounded-4xl overflow-hidden shadow-2xl z-10 my-8 max-h-[90vh] flex flex-col border border-[var(--glass-border)]"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="location-dialog-title"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 w-9 h-9 rounded-full glass-subtle flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/10 transition-colors focus:outline-none cursor-pointer"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl glass-subtle flex items-center justify-center text-accent-500 shadow-inner flex-shrink-0">
                <Compass size={24} className="animate-spin-slow" />
              </div>
              <div>
                <h3 id="location-dialog-title" className="font-display text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">
                  Location Explorer
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium">
                  Use your live GPS or search any city to measure geodesic distances to 34 global destinations.
                </p>
              </div>
            </div>

            {/* City Search Bar (Requirement: Choose location by searching for it) */}
            <div className="mb-5 space-y-2">
              <form onSubmit={handleSearchLocation} className="relative flex items-center gap-2">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-accent-500 pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search any starting city (e.g. London, Delhi, Tokyo, New York)..."
                    className="w-full glass-subtle pl-10 pr-4 py-2.5 rounded-2xl border border-[var(--glass-border)] text-xs sm:text-sm text-[var(--text-primary)] placeholder-[var(--input-placeholder)] focus:outline-none focus:border-accent-500 transition-all font-medium"
                  />
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={searchingCity || !searchQuery.trim()}
                  className="bg-accent-500 hover:bg-accent-600 text-white shadow-md font-bold px-4 py-2.5 rounded-2xl flex-shrink-0"
                >
                  {searchingCity ? <Loader2 size={15} className="animate-spin" /> : 'Search'}
                </Button>
              </form>

              {/* Multiple City Matches Dropdown */}
              {citySearchResults.length > 0 && (
                <div className="glass-panel p-2 rounded-2xl border border-accent-500/30 space-y-1">
                  <p className="text-2xs font-bold text-[var(--text-muted)] px-2">Select matching location:</p>
                  {citySearchResults.map((city, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        calculateAndApplySuggestions(city.lat, city.lon, `${city.name}, ${city.country}`);
                        setCitySearchResults([]);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-[var(--text-primary)] hover:bg-accent-500 hover:text-white transition-colors flex items-center justify-between"
                    >
                      <span>{city.name}, {city.state ? `${city.state}, ` : ''}{city.country}</span>
                      <span className="text-2xs opacity-75 font-mono">{city.lat.toFixed(2)}°, {city.lon.toFixed(2)}°</span>
                    </button>
                  ))}
                </div>
              )}

              {searchError && (
                <p className="text-xs text-red-400 font-semibold px-1">{searchError}</p>
              )}

              {/* Quick Presets Rail */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-2xs font-bold text-[var(--text-muted)] uppercase tracking-wider mr-1">Quick Presets:</span>
                {PRESET_CITIES.map((city) => (
                  <button
                    key={city.label}
                    type="button"
                    onClick={() => calculateAndApplySuggestions(city.lat, city.lng, city.label)}
                    className="glass-pill px-2.5 py-1 text-2xs font-bold text-[var(--text-secondary)] hover:text-accent-500 hover:border-accent-500 transition-all cursor-pointer"
                  >
                    {city.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-4">
              {status === 'idle' && (
                <div className="text-center py-8 px-4 glass-subtle rounded-3xl border border-dashed border-[var(--glass-border)]">
                  <div className="w-14 h-14 rounded-full bg-accent-500/10 text-accent-500 mx-auto flex items-center justify-center mb-3">
                    <Navigation size={24} />
                  </div>
                  <h4 className="font-display font-bold text-lg text-[var(--text-primary)] mb-1">
                    Detect Live GPS Position
                  </h4>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-md mx-auto mb-4 leading-relaxed font-medium">
                    Or click below to automatically read device GPS coordinates and calculate distances.
                  </p>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleDetectLocation}
                    leftIcon={<Navigation size={16} />}
                    className="bg-accent-500 hover:bg-accent-600 shadow-lg hover:shadow-accent-500/25 font-bold"
                  >
                    Use Live Device GPS
                  </Button>
                </div>
              )}

              {status === 'locating' && (
                <div className="text-center py-12 px-4">
                  <div className="relative w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-accent-400/20 animate-ping" />
                    <div className="w-12 h-12 rounded-full glass-panel flex items-center justify-center text-accent-500">
                      <Loader2 size={24} className="animate-spin" />
                    </div>
                  </div>
                  <h4 className="font-display text-lg font-bold text-[var(--text-primary)] mb-1">
                    Calculating Geodesic Distances...
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Measuring real-time kilometers across all 34 global destinations...
                  </p>
                </div>
              )}

              {status === 'denied' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-start gap-3 text-xs sm:text-sm">
                    <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">GPS access was denied or not supported.</p>
                      <p className="text-xs opacity-90 mt-0.5 font-medium">
                        You can search any city in the search bar above, or explore these top curated destinations:
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {suggestions.map(({ destination, distance }) => (
                      <SuggestionItem
                        key={destination.id}
                        destination={destination}
                        distance={distance}
                        onClose={onClose}
                      />
                    ))}
                  </div>
                </div>
              )}

              {status === 'success' && (
                <div className="space-y-4">
                  {/* Location Banner */}
                  <div className="p-4 rounded-2xl glass-subtle border border-accent-500/40 flex items-center justify-between flex-wrap gap-2 shadow-sm">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-accent-500 text-white flex items-center justify-center shadow-md">
                        <MapPin size={16} />
                      </div>
                      <div>
                        <span className="text-2xs uppercase tracking-wider text-accent-500 font-extrabold">Origin Coordinates</span>
                        <p className="text-sm font-bold text-[var(--text-primary)]">{cityName || 'Your Location'}</p>
                      </div>
                    </div>
                    {userCoords && (
                      <span className="text-xs text-[var(--text-muted)] font-mono font-semibold">
                        {userCoords.lat.toFixed(2)}°N, {userCoords.lng.toFixed(2)}°E
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <h4 className="text-xs uppercase tracking-widest font-bold text-[var(--text-secondary)] flex items-center gap-1.5">
                      <Sparkles size={13} className="text-accent-500" />
                      Suggested Escapes Closest To {cityName || 'You'}
                    </h4>
                    <span className="text-2xs text-[var(--text-muted)] font-semibold">{suggestions.length} recommendations</span>
                  </div>

                  {/* Suggestions List */}
                  <div className="space-y-3">
                    {suggestions.map(({ destination, distance }) => (
                      <SuggestionItem
                        key={destination.id}
                        destination={destination}
                        distance={distance}
                        onClose={onClose}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
