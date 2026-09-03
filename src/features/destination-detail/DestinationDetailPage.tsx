import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Calendar, Clock, Globe, MapPin,
  MessageCircle, Sparkles, Camera, ExternalLink,
  CreditCard
} from 'lucide-react';
import type { Destination, Place } from '../../types';
import destinations from '../../data/destinations.json';
import { useWeather } from '../../hooks/useWeather';
import { useDestinationImage, usePlaceImage } from '../../hooks/usePexelsImage';
import { WeatherWidget } from '../../components/WeatherWidget';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { formatVibeName } from '../../utils/formatters';

const ALL_DESTINATIONS = destinations as Destination[];

// ─── Place Card ───────────────────────────────────────────────────────────────

function PlaceCard({ place, onClick }: { place: Place; onClick: () => void }) {
  const [imgError, setImgError] = useState(false);
  const { data: pexelsData, isLoading } = usePlaceImage(place.name, place.fallbackImage);

  const imageSrc = imgError
    ? place.fallbackImage
    : (pexelsData?.url ?? place.fallbackImage);

  return (
    <motion.button
      onClick={onClick}
      className="group text-left glass-card place-card-interactive overflow-hidden w-full flex flex-col h-full rounded-3xl border border-[var(--glass-border)] cursor-pointer"
      whileHover={{ y: -6, scale: 1.015 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      aria-label={`View details for ${place.name}`}
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden bg-surface-200 w-full">
        <img
          src={imageSrc}
          alt={place.name}
          loading="lazy"
          onError={() => setImgError(true)}
          className={`w-full h-full object-cover group-hover:scale-108 transition-all duration-700 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
        />
        <div className="absolute top-3 left-3">
          <span className="glass-dark text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
            {place.category}
          </span>
        </div>
        {pexelsData?.photographer && (
          <div className="absolute bottom-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="glass-dark text-white/95 text-2xs px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-md">
              <Camera size={10} />
              {pexelsData.photographer}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-display font-bold text-lg text-[var(--text-primary)] mb-1 group-hover:text-accent-500 transition-colors">
            {place.name}
          </h3>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] line-clamp-2 mb-3 leading-relaxed">
            {place.description}
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] font-medium pt-2 border-t border-[var(--glass-border-subtle)]">
          <Clock size={12} className="text-accent-500" />
          <span>{place.recommendedTime}</span>
        </div>
      </div>
    </motion.button>
  );
}

// ─── Place Modal ──────────────────────────────────────────────────────────────

function PlaceModal({ place, isOpen, onClose }: { place: Place | null; isOpen: boolean; onClose: () => void }) {
  const [imgError, setImgError] = useState(false);
  const { data: pexelsData } = usePlaceImage(place?.name, place?.fallbackImage);

  if (!place) return null;

  const imageSrc = imgError
    ? place.fallbackImage
    : (pexelsData?.url ?? place.fallbackImage);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="overflow-hidden rounded-3xl">
        <div className="relative h-72 sm:h-88 overflow-hidden bg-surface-200">
          <img
            src={imageSrc}
            alt={place.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-950/80 via-transparent to-transparent" />
          <div className="absolute bottom-5 left-6 right-14 text-white">
            <span className="glass-dark text-white text-xs font-semibold px-3 py-1 rounded-full mb-2 inline-block">
              {place.category}
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold">{place.name}</h2>
          </div>
          {pexelsData?.photographer && (
            <div className="absolute top-4 left-4">
              <a
                href={pexelsData.photographerUrl}
                target="_blank"
                rel="noreferrer"
                className="glass-dark text-white/95 text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:text-white transition-colors"
              >
                <Camera size={12} />
                <span>Photo: {pexelsData.photographer} on Pexels</span>
                <ExternalLink size={10} />
              </a>
            </div>
          )}
        </div>
        <div className="p-6 sm:p-8 space-y-4">
          <p className="text-[var(--text-secondary)] leading-relaxed text-sm sm:text-base">{place.description}</p>
          <div className="flex items-center gap-2.5 text-sm text-[var(--text-primary)] glass-subtle rounded-2xl px-5 py-3.5 border border-[var(--glass-border)]">
            <Clock size={18} className="text-accent-500 flex-shrink-0" />
            <span>Recommended time: <strong className="font-bold text-accent-500">{place.recommendedTime}</strong></span>
          </div>
        </div>
      </div>
    </Modal>
  );
}

// ─── Destination Detail Page ─────────────────────────────────────────────────

export function DestinationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [heroImgError, setHeroImgError] = useState(false);

  const destination = ALL_DESTINATIONS.find((d) => d.id === id);

  // Fetch live high-res Pexels image for hero
  const { data: pexelsHero, isLoading: heroLoading } = useDestinationImage(
    destination?.name,
    destination?.country,
    destination?.fallbackImage,
  );

  // Redirect if not found
  if (!destination) {
    return (
      <main className="min-h-screen flex items-center justify-center pt-24 px-4">
        <div className="text-center glass-panel p-8 rounded-3xl max-w-md">
          <p className="font-display text-2xl font-bold text-[var(--text-primary)] mb-4">Destination not found</p>
          <Button onClick={() => navigate('/explore')} leftIcon={<ArrowLeft size={16} />}>
            Back to Voyager Explorer
          </Button>
        </div>
      </main>
    );
  }

  const { data: weather, isLoading: weatherLoading, isError: weatherError, refetch } = useWeather({
    lat: destination.coordinates.lat,
    lng: destination.coordinates.lng,
  });

  const heroImageSrc = heroImgError
    ? destination.fallbackImage
    : (pexelsHero?.url ?? destination.fallbackImage);

  return (
    <main id="main-content" className="min-h-screen pb-20 relative">
      {/* Ambient background mesh */}
      <div className="background-mesh" aria-hidden="true" />

      {/* ─── Hero Image ──────────────────────────────────────────── */}
      <div className="relative h-[65vh] min-h-[460px] overflow-hidden bg-surface-200">
        <img
          src={heroImageSrc}
          alt={`${destination.name}, ${destination.country}`}
          onError={() => setHeroImgError(true)}
          className={`w-full h-full object-cover transition-opacity duration-700 ${
            heroLoading ? 'opacity-0' : 'opacity-100'
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950/90 via-dark-950/40 to-transparent" />

        {/* Top Controls: Back button & Photographer credit */}
        <div className="absolute top-24 left-4 right-4 sm:left-8 sm:right-8 lg:left-12 lg:right-12 z-10 flex items-center justify-between gap-2">
          <Link to="/explore">
            <Button
              variant="ghost"
              size="sm"
              className="glass-dark text-white hover:bg-white/20 rounded-full text-xs sm:text-sm px-3.5 py-1.5"
              leftIcon={<ArrowLeft size={14} />}
            >
              <span className="hidden sm:inline">All Destinations</span>
              <span className="sm:hidden">Explore</span>
            </Button>
          </Link>

          {pexelsHero?.photographer && (
            <a
              href={pexelsHero.photographerUrl}
              target="_blank"
              rel="noreferrer"
              className="glass-dark text-white/90 hover:text-white text-2xs sm:text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors shadow-sm max-w-[180px] sm:max-w-none truncate"
            >
              <Camera size={11} className="flex-shrink-0" />
              <span className="truncate">Photo: {pexelsHero.photographer}</span>
            </a>
          )}
        </div>

        {/* Hero text */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8 lg:p-14 pb-6 sm:pb-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-2 sm:mb-3 flex-wrap">
              <span className="glass-dark text-white text-2xs sm:text-xs font-semibold px-2.5 sm:px-3 py-1 rounded-full">
                {destination.region}
              </span>
              {destination.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="glass-dark text-white/90 text-2xs sm:text-xs px-2.5 sm:px-3 py-1 rounded-full font-medium">
                  {formatVibeName(tag)}
                </span>
              ))}
            </div>
            <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight">
              {destination.name}
            </h1>
            <div className="flex items-center gap-2 mt-1.5 sm:mt-2 text-white/90 font-semibold text-xs sm:text-base">
              <MapPin size={15} className="text-accent-400 flex-shrink-0" />
              <span>{destination.country}</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ─── Content ─────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">

          {/* ─── Main column ──────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-10">

            {/* Tagline & description */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              aria-labelledby="destination-intro"
              className="space-y-4"
            >
              <p className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-[var(--text-primary)] leading-snug">
                "{destination.tagline}"
              </p>
              <p className="text-[var(--text-secondary)] leading-relaxed text-xs sm:text-base">
                {destination.description}
              </p>
            </motion.section>

            {/* Key facts in Indian Rupee */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              aria-labelledby="key-facts-heading"
            >
              <h2 id="key-facts-heading" className="font-display text-xl sm:text-2xl font-bold text-[var(--text-primary)] mb-3 sm:mb-4">
                At a Glance
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {[
                  {
                    icon: Calendar,
                    label: 'Best Time to Visit',
                    value: destination.bestTimeToVisit
                  },
                  {
                    icon: CreditCard,
                    label: 'Avg Daily Budget',
                    value: `${destination.avgDailyBudget} /day`
                  },
                  {
                    icon: Globe,
                    label: 'Currency',
                    value: `${destination.currency}`
                  },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="glass-card p-4 sm:p-5 rounded-3xl flex flex-col justify-between">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-lg glass-subtle flex items-center justify-center text-accent-500 flex-shrink-0">
                        <Icon size={14} />
                      </div>
                      <span className="text-2xs text-[var(--text-muted)] font-bold uppercase tracking-wider">
                        {label}
                      </span>
                    </div>
                    <p className="text-sm sm:text-base font-bold text-[var(--text-primary)]">{value}</p>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Places to visit */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              aria-labelledby="places-heading"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5 sm:mb-6">
                <div>
                  <h2 id="places-heading" className="font-display text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                    Must-Visit Places ({destination.places.length})
                  </h2>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">Click any place card to inspect details and live photo.</p>
                </div>
                <span className="text-xs text-accent-500 flex items-center gap-1 font-semibold glass-subtle px-3 py-1 rounded-full w-fit">
                  <Camera size={12} /> Pexels Verified
                </span>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                {destination.places.map((place, index) => (
                  <motion.div
                    key={place.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 + index * 0.06 }}
                  >
                    <PlaceCard place={place} onClick={() => setSelectedPlace(place)} />
                  </motion.div>
                ))}
              </div>
            </motion.section>
          </div>

          {/* ─── Sidebar ──────────────────────────────────────────── */}
          <div className="space-y-6">
            {/* Weather widget */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <WeatherWidget
                isLoading={weatherLoading}
                isError={weatherError}
                data={weather}
                cityName={destination.name}
                onRetry={() => refetch()}
              />
            </motion.div>

            {/* AI Itinerary Planner CTA */}
            <motion.div
              className="glass-panel p-6 rounded-3xl space-y-4 border border-accent-500/30"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-accent-500/20 text-accent-500 flex items-center justify-center">
                  <Sparkles size={18} />
                </div>
                <span className="text-base font-bold text-[var(--text-primary)]">AI Trip Itinerary</span>
              </div>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                Generate a custom day-by-day itinerary tailored to your pace and budget for {destination.name}, priced in Indian Rupees (₹).
              </p>
              <Link
                to={`/itinerary?destination=${destination.id}`}
                className="block"
              >
                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  className="bg-accent-500 hover:bg-accent-600 font-bold shadow-lg"
                >
                  Plan Trip in {destination.name}
                </Button>
              </Link>
            </motion.div>

            {/* Chatbot CTA */}
            <motion.div
              className="glass-panel p-6 rounded-3xl space-y-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-accent-500/20 text-accent-500 flex items-center justify-center">
                  <MessageCircle size={18} />
                </div>
                <span className="text-base font-bold text-[var(--text-primary)]">Ask Voyager AI</span>
              </div>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                Need local customs, authentic cuisine tips, or hidden spots in {destination.name}? Ask the travel assistant.
              </p>
              <Button
                variant="outline"
                size="md"
                fullWidth
                onClick={() => {
                  document.getElementById('chatbot-trigger')?.click();
                }}
                className="font-bold border-[var(--glass-border)] text-[var(--text-primary)]"
              >
                Ask Voyager About {destination.name}
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Place detail modal */}
      <PlaceModal
        place={selectedPlace}
        isOpen={!!selectedPlace}
        onClose={() => setSelectedPlace(null)}
      />
    </main>
  );
}
