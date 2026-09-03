import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowDown, Sparkles, Navigation, Sun, Moon,
  Search, CloudSun, Camera, Bot, ArrowRight
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import destinations from '../../data/destinations.json';
import type { Destination } from '../../types';
import { DestinationCard } from '../explorer/DestinationCard';
import { LocationDetectorModal } from '../../components/LocationDetectorModal';
import { useTheme } from '../../context/ThemeContext';

const FEATURED_IDS = [
  'rajasthan-india', 'kerala-india', 'kyoto-japan', 'paris-france',
  'santorini-greece', 'dubai-uae', 'cappadocia-turkey', 'bali-indonesia', 'amalfi-coast-italy'
];

const featuredDestinations = (destinations as Destination[]).filter((d) =>
  FEATURED_IDS.includes(d.id),
);

// ─── Scroll Cue ──────────────────────────────────────────────────────────────

function ScrollCue() {
  return (
    <motion.div
      className="flex flex-col items-center gap-2 text-white/70"
      animate={{ y: [0, 8, 0] }}
      transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
    >
      <span className="text-2xs font-semibold tracking-widest uppercase">Explore Below</span>
      <ArrowDown size={14} className="text-accent-400" />
    </motion.div>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────

export function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/explore');
    }
  };

  return (
    <main id="main-content" className="page-wrapper relative">
      {/* ─── Ambient Mesh Background behind entire page ────────────── */}
      <div className="background-mesh" aria-hidden="true" />

      {/* ─── Hero ─────────────────────────────────────────────────── */}
      <section
        className="relative min-h-[92vh] sm:min-h-screen flex flex-col items-center justify-center overflow-hidden pt-24 pb-16 px-4"
        aria-label="Hero: Voyager Travel Explorer"
      >
        {/* Background video — Looped Hero_Video.mp4 */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          aria-hidden="true"
        >
          <source src="/Hero_Video.mp4" type="video/mp4" />
        </video>

        {/* Multi-layered Glass Scrim for WCAG AA readability */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-dark-950/70 via-dark-950/50 to-[var(--bg-color)] backdrop-blur-[2px]"
          aria-hidden="true"
        />

        {/* Hero content container */}
        <div className="relative z-10 text-center text-white max-w-5xl mx-auto flex flex-col items-center">
          
          {/* Eyebrow & Theme Toggle Pill on Landing Page */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-3 mb-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="glass-panel px-4 py-1.5 rounded-full text-xs font-bold text-[var(--text-primary)] flex items-center gap-2 border border-[var(--glass-border)] shadow-md">
              <Sparkles size={14} className="text-accent-500" />
              <span>Smart AI Travel Engine</span>
              <span className="w-1.5 h-1.5 rounded-full bg-accent-500" />
              <span className="text-accent-600 dark:text-accent-300 font-extrabold">INR (₹) Estimates</span>
            </div>

            {/* Prominent Landing Page Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="glass-panel px-4 py-1.5 rounded-full text-xs font-bold text-[var(--text-primary)] hover:border-accent-500 flex items-center gap-2 border border-[var(--glass-border)] transition-all shadow-md focus:outline-none cursor-pointer"
              title="Toggle Light / Dark Mode"
            >
              {theme === 'dark' ? (
                <>
                  <Sun size={14} className="text-amber-400" />
                  <span>Switch to Light Theme</span>
                </>
              ) : (
                <>
                  <Moon size={14} className="text-midblue-500" />
                  <span>Switch to Dark Theme</span>
                </>
              )}
            </button>
          </motion.div>

          {/* Heading */}
          <motion.h1
            className="font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.12] tracking-tight mb-4 sm:mb-6 max-w-4xl"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Plan Your Next <br />
            <span className="text-gradient-accent">Great Adventure</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            className="text-xs sm:text-lg md:text-xl text-white/85 max-w-2xl mx-auto mb-6 sm:mb-8 leading-relaxed font-normal px-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Voyager delivers intelligent destination discovery, real-time location suggestions, live weather, and bespoke day-by-day itineraries tailored to your budget.
          </motion.p>

          {/* Glassmorphic Search Bar */}
          <motion.form
            onSubmit={handleSearchSubmit}
            className="w-full max-w-2xl glass-panel p-2 sm:p-3 rounded-3xl sm:rounded-full mb-6 sm:mb-8 flex flex-col sm:flex-row items-center gap-2 border border-white/30 shadow-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex-1 w-full flex items-center gap-3 px-3 sm:px-4 py-2">
              <Search size={18} className="text-accent-400 flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Where to? (e.g. Kyoto, Paris, Rajasthan, Bali...)"
                className="w-full bg-transparent border-none outline-none text-xs sm:text-base text-white placeholder-white/85 focus:ring-0 font-medium"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 rounded-2xl sm:rounded-full bg-accent-500 hover:bg-accent-600 text-white font-bold text-xs sm:text-sm shadow-lg hover:shadow-accent-500/30 transition-all flex items-center justify-center gap-2 flex-shrink-0 cursor-pointer"
            >
              <span>Explore Escapes</span>
              <ArrowRight size={14} />
            </button>
          </motion.form>

          {/* CTAs including Real-Time Location Detector */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-3.5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            {/* Real-time Location Detection Button */}
            <Button
              size="lg"
              onClick={() => setLocationModalOpen(true)}
              className="glass-panel text-white hover:text-accent-400 border border-white/30 hover:border-accent-400/60 shadow-glass-md transition-all font-bold"
              leftIcon={<Navigation size={18} className="text-accent-400 animate-pulse" />}
            >
              Detect My Location & Suggest Places
            </Button>

            <Link to="/itinerary">
              <Button
                size="lg"
                className="bg-accent-500/90 hover:bg-accent-500 text-white shadow-xl hover:shadow-accent-500/40 font-bold"
                leftIcon={<Bot size={18} />}
              >
                AI Itinerary Builder
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Scroll cue */}
        <motion.div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <ScrollCue />
        </motion.div>
      </section>

      {/* ─── Modern Glassmorphic Feature Highlights ──────────────── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            {
              icon: Navigation,
              title: 'Real-Time Location',
              desc: 'Instant GPS detection calculates geodesic distance and curates closest destinations.',
            },
            {
              icon: CloudSun,
              title: 'Live Weather Intelligence',
              desc: 'Continuous live temperature, wind speed, visibility, and weather condition badges.',
            },
            {
              icon: Camera,
              title: 'Dynamic Pexels Imagery',
              desc: 'High-definition destination photography loaded directly via verified Pexels credentials.',
            },
            {
              icon: Bot,
              title: 'Gemini Itinerary AI',
              desc: 'Custom day-by-day itineraries with timeline stops and authentic dining tips in INR (₹).',
            },
          ].map(({ icon: Icon, title, desc }, idx) => (
            <motion.div
              key={title}
              className="glass-card p-6 rounded-3xl"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
            >
              <div className="w-12 h-12 rounded-2xl glass-subtle flex items-center justify-center text-accent-500 mb-4 shadow-inner">
                <Icon size={22} />
              </div>
              <h3 className="font-display font-bold text-lg text-[var(--text-primary)] mb-2">
                {title}
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                {desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── Featured Destinations Rail ──────────────────────────── */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-accent-500" />
              <p className="text-xs font-bold uppercase tracking-widest text-accent-500">
                Curated Global Collection
              </p>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)]">
              Featured Destinations
            </h2>
          </div>
          <Link
            to="/explore"
            className="glass-panel px-4 py-2 rounded-full text-xs sm:text-sm font-bold text-accent-500 hover:text-accent-400 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>Explore All 34 Destinations</span>
            <ArrowRight size={14} />
          </Link>
        </motion.div>

        {/* Cards Grid */}
        <div
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          role="list"
          aria-label="Featured destinations"
        >
          {featuredDestinations.map((destination, index) => (
            <motion.div
              key={destination.id}
              role="listitem"
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: index * 0.06 }}
            >
              <DestinationCard destination={destination} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Real-time Location Detector Modal */}
      <LocationDetectorModal
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
      />
    </main>
  );
}
