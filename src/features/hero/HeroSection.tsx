import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navigation, Search, CloudSun, Camera, Bot, ArrowRight } from 'lucide-react';
import destinations from '../../data/destinations.json';
import type { Destination } from '../../types';
import { DestinationCard } from '../explorer/DestinationCard';
import { LocationDetectorModal } from '../../components/LocationDetectorModal';
import { AtlasMap } from '../atlas/AtlasMap';

const FEATURED_IDS = [
  'rajasthan-india', 'kerala-india', 'kyoto-japan', 'paris-france',
  'santorini-greece', 'dubai-uae', 'cappadocia-turkey', 'bali-indonesia', 'amalfi-coast-italy'
];

const featuredDestinations = (destinations as Destination[]).filter((d) =>
  FEATURED_IDS.includes(d.id),
);

// ─── Hero Section ─────────────────────────────────────────────────────────────

export function HeroSection() {
  const navigate = useNavigate();
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(searchQuery.trim() ? `/explore?q=${encodeURIComponent(searchQuery.trim())}` : '/explore');
  };

  return (
    <main id="main-content" className="page-wrapper relative">
      {/* ─── Atlas hero: headline + live map ───────────────────────── */}
      <section className="relative pt-28 sm:pt-32 pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" aria-label="Voyager atlas">
        <div className="grid grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-8 lg:gap-12 items-start">
          <div>
            <motion.p
              className="legend-label mb-4"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              Voyager Atlas / {destinations.length} destinations
            </motion.p>
            <motion.h1
              className="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05] mb-5"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08 }}
            >
              Chart your next <em className="italic text-accent-500">great</em> journey.
            </motion.h1>
            <motion.p
              className="text-base sm:text-lg text-[var(--text-secondary)] max-w-xl mb-7 leading-relaxed"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.16 }}
            >
              Explore the world on a living map, check the weather on arrival, and let AI draft a day-by-day route you can edit.
            </motion.p>

            <motion.form
              onSubmit={handleSearchSubmit}
              className="glass-panel rounded-2xl p-2 flex items-center gap-2 mb-5 max-w-xl"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.24 }}
              role="search"
            >
              <label htmlFor="hero-search" className="sr-only">Search destinations</label>
              <Search size={18} className="ml-3 text-accent-500 flex-shrink-0" aria-hidden="true" />
              <input
                id="hero-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Try Kyoto or Bali"
                className="flex-1 min-w-0 bg-transparent px-1 py-3 text-base text-[var(--text-primary)] outline-none"
              />
              <button
                type="submit"
                className="px-5 py-3 rounded-xl bg-accent-500 hover:bg-accent-600 text-onaccent font-semibold text-sm flex items-center gap-2 flex-shrink-0"
              >
                Explore <ArrowRight size={14} />
              </button>
            </motion.form>

            <motion.div
              className="flex flex-wrap gap-3"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.32 }}
            >
              <button
                type="button"
                onClick={() => setLocationModalOpen(true)}
                className="glass-pill px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2 hover:border-accent-500"
              >
                <Navigation size={15} className="text-accent-500" aria-hidden="true" /> Near me
              </button>
              <Link
                to="/itinerary"
                className="glass-pill px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2 hover:border-accent-500"
              >
                <Bot size={15} className="text-accent-500" aria-hidden="true" /> Plan a trip with AI
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <AtlasMap />
          </motion.div>
        </div>
      </section>

      {/* ─── What you get: a legend, not a feature grid ────────────── */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-10" aria-label="What Voyager does">
        <hr className="rule-dotted mb-8" />
        <p className="legend-label mb-6">Legend</p>
        <ul className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6">
          {[
            { icon: Navigation, title: 'Near you', desc: 'Detect your location and see the closest destinations first.' },
            { icon: CloudSun, title: 'Live weather', desc: 'Current temperature, wind and visibility for every destination.' },
            { icon: Camera, title: 'Real photography', desc: 'High-resolution photos from Pexels, credited to the photographer.' },
            { icon: Bot, title: 'AI itineraries', desc: 'Day-by-day plans with timings and local budget estimates.' },
          ].map(({ icon: Icon, title, desc }, idx) => (
            <motion.li
              key={title}
              className="flex gap-4"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: idx * 0.07 }}
            >
              <span className="w-10 h-10 rounded-full border border-[var(--line)] flex items-center justify-center text-accent-500 flex-shrink-0" aria-hidden="true">
                <Icon size={18} />
              </span>
              <div>
                <h3 className="font-display text-lg mb-1">{title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{desc}</p>
              </div>
            </motion.li>
          ))}
        </ul>
      </section>

      {/* ─── Featured destinations ─────────────────────────────────── */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" aria-labelledby="featured-heading">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="legend-label mb-2">Field notes</p>
            <h2 id="featured-heading" className="font-display text-3xl sm:text-4xl">Featured destinations</h2>
          </div>
          <Link
            to="/explore"
            className="text-sm font-semibold text-accent-500 hover:underline flex items-center gap-1.5 self-start sm:self-auto"
          >
            Explore all {destinations.length} <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" role="list" aria-label="Featured destinations">
          {featuredDestinations.map((destination, index) => (
            <motion.div
              key={destination.id}
              role="listitem"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: (index % 3) * 0.06 }}
            >
              <DestinationCard destination={destination} />
            </motion.div>
          ))}
        </div>
      </section>

      <LocationDetectorModal
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
      />
    </main>
  );
}
