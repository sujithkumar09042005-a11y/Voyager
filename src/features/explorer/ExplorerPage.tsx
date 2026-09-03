import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe, X, Navigation, Search, Sparkles, SlidersHorizontal,
  Compass, RotateCcw, Landmark, Building2, Mountain, Waves,
  UtensilsCrossed, Trees, Heart, ShoppingBag, Flame, Sun,
  IndianRupee
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { DestinationCard } from './DestinationCard';
import { useDestinationSearch } from '../../hooks/useDestinationSearch';
import { LocationDetectorModal } from '../../components/LocationDetectorModal';
import { formatVibeName } from '../../utils/formatters';

// ─── Modern Theme-Harmonious Vector Icons for Continents ──────────────────────

interface RegionMeta {
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  accentColor: string;
}

const REGION_CONFIG: Record<string, RegionMeta> = {
  Asia: {
    label: 'Asia',
    icon: Landmark,
    accentColor: 'text-amber-500',
  },
  Europe: {
    label: 'Europe',
    icon: Building2,
    accentColor: 'text-blue-500',
  },
  'Middle East': {
    label: 'Middle East',
    icon: Sun,
    accentColor: 'text-orange-500',
  },
  Americas: {
    label: 'Americas',
    icon: Mountain,
    accentColor: 'text-emerald-500',
  },
  Africa: {
    label: 'Africa',
    icon: Flame,
    accentColor: 'text-rose-500',
  },
  Oceania: {
    label: 'Oceania',
    icon: Waves,
    accentColor: 'text-cyan-500',
  },
};

// ─── Modern Theme-Harmonious Vector Icons for Vibes & Atmosphere ─────────────

const VIBE_ICON_MAP: Record<string, { icon: React.ComponentType<{ size?: number; className?: string }>; color: string }> = {
  culture:      { icon: Landmark,         color: 'text-amber-500' },
  heritage:     { icon: Landmark,         color: 'text-amber-600' },
  nature:       { icon: Trees,            color: 'text-emerald-500' },
  food:         { icon: UtensilsCrossed,  color: 'text-orange-500' },
  culinary:     { icon: UtensilsCrossed,  color: 'text-orange-500' },
  history:      { icon: Landmark,         color: 'text-amber-500' },
  adventure:    { icon: Mountain,         color: 'text-rose-500' },
  beaches:      { icon: Waves,            color: 'text-cyan-500' },
  coastal:      { icon: Waves,            color: 'text-cyan-500' },
  romantic:     { icon: Heart,            color: 'text-pink-500' },
  wellness:     { icon: Sparkles,         color: 'text-purple-500' },
  shopping:     { icon: ShoppingBag,      color: 'text-blue-500' },
  architecture: { icon: Building2,        color: 'text-indigo-500' },
  nightlife:    { icon: Flame,            color: 'text-yellow-500' },
  wildlife:     { icon: Trees,            color: 'text-emerald-500' },
  mountains:    { icon: Mountain,         color: 'text-sky-500' },
  luxury:       { icon: Sparkles,         color: 'text-amber-400' },
};

function getVibeIcon(tag: string) {
  const lower = tag.toLowerCase().trim();
  for (const key of Object.keys(VIBE_ICON_MAP)) {
    if (lower.includes(key)) {
      return VIBE_ICON_MAP[key];
    }
  }
  return { icon: Compass, color: 'text-accent-500' };
}

// ─── Empty State ─────────────────────────────────────────────────────────────

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <motion.div
      className="col-span-full flex flex-col items-center py-20 text-center glass-dock rounded-4xl p-8 sm:p-12 border border-[var(--glass-border)] shadow-2xl my-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="w-20 h-20 rounded-3xl glass-subtle flex items-center justify-center mb-5 text-accent-500 shadow-inner border border-accent-500/20">
        <Compass size={36} className="animate-spin-slow" />
      </div>
      <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] mb-2">
        No Matching Escapes Found
      </h3>
      <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-md mb-8 leading-relaxed">
        We couldn't find destinations matching your exact filter criteria. Relax your search term or reset filters to explore all 34 curated global destinations.
      </p>
      <Button
        variant="primary"
        onClick={onClear}
        leftIcon={<RotateCcw size={15} />}
        className="font-bold bg-accent-500 hover:bg-accent-600 text-white shadow-lg hover:shadow-accent-500/30 px-6 py-3 rounded-full"
      >
        Reset All Filters
      </Button>
    </motion.div>
  );
}

// ─── Explorer Page ────────────────────────────────────────────────────────────

export function ExplorerPage() {
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [showVibeDrawer, setShowVibeDrawer] = useState(false);

  const {
    filters,
    setFilters,
    results,
    totalCount,
    allRegions,
    allTags,
    clearFilters,
    isFiltered,
  } = useDestinationSearch();

  const toggleRegion = (region: string) => {
    setFilters((prev) => ({
      ...prev,
      regions: prev.regions.includes(region)
        ? prev.regions.filter((r) => r !== region)
        : [...prev.regions, region],
    }));
  };

  const setSingleRegion = (region: string | null) => {
    setFilters((prev) => ({
      ...prev,
      regions: region ? [region] : [],
    }));
  };

  const toggleTag = (tag: string) => {
    setFilters((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const setBudgetFilter = (budget: 'all' | 'budget' | 'mid' | 'luxury') => {
    setFilters((prev) => ({ ...prev, budget }));
  };

  return (
    <main id="main-content" className="min-h-screen pt-28 pb-24 px-4 sm:px-6 lg:px-8 relative">
      {/* Ambient background mesh */}
      <div className="background-mesh" aria-hidden="true" />

      <div className="max-w-7xl mx-auto">
        {/* ─── Hero Header & Location Action ──────────────────────────── */}
        <div className="mb-6 sm:mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2 sm:mb-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-accent-500 animate-pulse" />
              <span className="text-2xs font-extrabold uppercase tracking-widest text-accent-500">
                Global Travel Catalog · {results.length} of {totalCount} Escapes
              </span>
            </div>
            <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[var(--text-primary)] tracking-tight">
              Destination Explorer
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-2xl mt-1.5 sm:mt-2 leading-relaxed font-medium">
              Discover 34 handpicked destinations across 7 continents with live meteorological intelligence and Indian Rupee (₹) daily estimates.
            </p>
          </div>

          {/* Quick Real-Time Location Action */}
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={() => setLocationModalOpen(true)}
              className="flex-1 sm:flex-initial glass-dock px-3.5 sm:px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold text-[var(--text-primary)] hover:border-accent-500 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
              title="Detect or Search Starting Location"
            >
              <Navigation size={14} className="text-accent-500" />
              <span>Explore Near Me</span>
            </button>

            {isFiltered && (
              <button
                onClick={clearFilters}
                className="glass-subtle px-3 sm:px-3.5 py-2.5 rounded-full text-xs font-bold text-accent-500 hover:bg-accent-500 hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm flex-shrink-0"
                title="Reset all active filters"
              >
                <RotateCcw size={12} />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* ─── Modern Slick Glass Filter Dock ─────────────────────────── */}
        <div className="glass-dock p-3.5 sm:p-6 rounded-3xl sm:rounded-4xl mb-8 sm:mb-12 space-y-4 sm:space-y-5 border border-[var(--glass-border)] shadow-2xl relative overflow-hidden">
          {/* Subtle ambient light gradient accent */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-accent-500/10 via-amber-400/5 to-transparent rounded-full blur-3xl pointer-events-none" />

          {/* ─── Level 1: Master Search Bar & Fast Controls ───────────── */}
          <div className="flex flex-col lg:flex-row items-center gap-3 relative z-10">
            {/* Search Capsule */}
            <div className="relative flex-1 w-full flex items-center">
              <Search
                size={18}
                className="absolute left-4 text-accent-500 pointer-events-none flex-shrink-0"
              />
              <input
                id="destination-search"
                type="text"
                value={filters.query}
                onChange={(e) => setFilters((prev) => ({ ...prev, query: e.target.value }))}
                placeholder="Search by country, city, culture, or vibe (e.g. Kyoto, Rajasthan, Bali, Amalfi, Temples)..."
                className="w-full pl-11 pr-28 py-3.5 rounded-full glass-subtle text-[var(--text-primary)] placeholder-[var(--input-placeholder)] border border-[var(--glass-border)] focus:outline-none focus:border-accent-500 focus:ring-4 focus:ring-accent-500/20 text-xs sm:text-sm font-medium transition-all shadow-inner"
                aria-label="Search destinations"
              />
              <div className="absolute right-3.5 flex items-center gap-1.5">
                {filters.query ? (
                  <button
                    type="button"
                    onClick={() => setFilters((prev) => ({ ...prev, query: '' }))}
                    className="p-1 rounded-full glass-subtle text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/15 transition-colors focus:outline-none cursor-pointer"
                    aria-label="Clear search input"
                  >
                    <X size={14} />
                  </button>
                ) : (
                  <span className="text-2xs font-mono font-bold text-[var(--text-muted)] px-2 py-0.5 rounded-full glass-subtle hidden sm:inline">
                    {results.length} found
                  </span>
                )}
              </div>
            </div>

            {/* Budget Range Segmented Pill (in ₹ INR) */}
            <div className="w-full lg:w-auto flex items-center justify-between sm:justify-start gap-1 p-1 rounded-full glass-subtle border border-[var(--glass-border-subtle)] flex-shrink-0">
              <div className="flex items-center gap-1 px-2.5 text-accent-500 font-extrabold text-xs hidden sm:flex">
                <IndianRupee size={12} />
                <span className="text-2xs uppercase tracking-wider text-[var(--text-muted)]">Daily:</span>
              </div>
              {[
                { id: 'all',    label: 'All' },
                { id: 'budget', label: '< ₹6K' },
                { id: 'mid',    label: '₹6K–₹14K' },
                { id: 'luxury', label: '> ₹14K' },
              ].map(({ id, label }) => {
                const active = filters.budget === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setBudgetFilter(id as any)}
                    className={[
                      'px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap',
                      active
                        ? 'bg-accent-500 text-white shadow-md scale-102'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/10',
                    ].join(' ')}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Vibe Selector Toggle Button */}
            <button
              type="button"
              onClick={() => setShowVibeDrawer(!showVibeDrawer)}
              className={[
                'w-full lg:w-auto px-4 py-3 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 border cursor-pointer flex-shrink-0 shadow-sm',
                showVibeDrawer || filters.tags.length > 0
                  ? 'bg-accent-500/15 border-accent-500 text-accent-500'
                  : 'glass-subtle text-[var(--text-secondary)] border-[var(--glass-border-subtle)] hover:text-[var(--text-primary)] hover:border-accent-500/40',
              ].join(' ')}
              aria-expanded={showVibeDrawer}
            >
              <SlidersHorizontal size={14} className={filters.tags.length > 0 ? 'text-accent-500' : ''} />
              <span>Filter Vibes {filters.tags.length > 0 && `(${filters.tags.length})`}</span>
            </button>
          </div>

          {/* ─── Level 2: Sleek Continental Region Segmented Ribbon ──── */}
          <div className="pt-2 border-t border-[var(--glass-border-subtle)] space-y-2 relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-2xs uppercase tracking-widest font-extrabold text-[var(--text-muted)] flex items-center gap-1.5">
                <Globe size={12} className="text-accent-500" />
                Filter by Continent
              </span>
              <span className="text-2xs text-[var(--text-muted)] font-semibold">
                {filters.regions.length === 0 ? 'All 7 Continents Active' : `${filters.regions.length} selected`}
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar">
              {/* All Continents Segment */}
              <button
                type="button"
                onClick={() => setSingleRegion(null)}
                className={[
                  'px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap border cursor-pointer flex-shrink-0',
                  filters.regions.length === 0
                    ? 'bg-accent-500 text-white border-accent-500 shadow-md scale-102'
                    : 'glass-subtle text-[var(--text-secondary)] border-[var(--glass-border-subtle)] hover:text-[var(--text-primary)] hover:border-accent-500/40',
                ].join(' ')}
              >
                <Globe size={14} className={filters.regions.length === 0 ? 'text-white' : 'text-accent-500'} />
                <span>All Continents</span>
                <span className="text-2xs opacity-80 font-mono">({totalCount})</span>
              </button>

              {/* Individual Continents with Sleek Vector Icons */}
              {allRegions.map((region) => {
                const active = filters.regions.includes(region);
                const meta = REGION_CONFIG[region] || { label: region, icon: Globe, accentColor: 'text-accent-500' };
                const IconComponent = meta.icon;

                return (
                  <button
                    key={region}
                    type="button"
                    onClick={() => toggleRegion(region)}
                    className={[
                      'px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap border cursor-pointer flex-shrink-0',
                      active
                        ? 'bg-accent-500 text-white border-accent-500 shadow-md scale-102'
                        : 'glass-subtle text-[var(--text-secondary)] border-[var(--glass-border-subtle)] hover:text-[var(--text-primary)] hover:border-accent-500/40',
                    ].join(' ')}
                  >
                    <IconComponent size={14} className={active ? 'text-white' : meta.accentColor} />
                    <span>{region}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ─── Level 3: Collapsible Modern Vibe Flow Matrix ─────────── */}
          <AnimatePresence>
            {showVibeDrawer && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="pt-4 border-t border-[var(--glass-border-subtle)] space-y-3 overflow-hidden relative z-10"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-accent-500" />
                    <span className="text-xs font-extrabold text-[var(--text-primary)] uppercase tracking-wider">
                      Travel Atmosphere & Activity Vibe
                    </span>
                  </div>
                  {filters.tags.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setFilters((p) => ({ ...p, tags: [] }))}
                      className="text-xs font-bold text-accent-500 hover:underline cursor-pointer"
                    >
                      Clear Vibes
                    </button>
                  )}
                </div>

                {/* Vibe Chips with Vector Micro-Icons */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {allTags.map((tag) => {
                    const active = filters.tags.includes(tag);
                    const { icon: VibeIcon, color } = getVibeIcon(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={[
                          'px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 border cursor-pointer shadow-sm',
                          active
                            ? 'bg-accent-500 text-white border-accent-500 shadow-glow-accent scale-105'
                            : 'glass-subtle text-[var(--text-secondary)] border-[var(--glass-border-subtle)] hover:border-accent-500 hover:text-[var(--text-primary)] hover:bg-white/15',
                        ].join(' ')}
                      >
                        <VibeIcon size={13} className={active ? 'text-white' : color} />
                        <span>{formatVibeName(tag)}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ─── Level 4: Active Filter Chips Summary ─────────────────── */}
          {isFiltered && (
            <motion.div
              className="flex items-center gap-2 pt-3 border-t border-[var(--glass-border-subtle)] flex-wrap relative z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <span className="text-2xs font-extrabold uppercase tracking-widest text-[var(--text-muted)] mr-1">
                Active Filters:
              </span>

              {/* Active Search Query */}
              {filters.query && (
                <span className="glass-subtle text-accent-500 border border-accent-500/35 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                  <Search size={11} />
                  <span>"{filters.query}"</span>
                  <X
                    size={13}
                    className="cursor-pointer hover:text-red-500 ml-0.5"
                    onClick={() => setFilters((p) => ({ ...p, query: '' }))}
                  />
                </span>
              )}

              {/* Active Continents */}
              {filters.regions.map((r) => {
                const meta = REGION_CONFIG[r] || { icon: Globe };
                const IconComponent = meta.icon;
                return (
                  <span
                    key={r}
                    className="glass-subtle text-accent-500 border border-accent-500/35 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm"
                  >
                    <IconComponent size={12} />
                    <span>{r}</span>
                    <X
                      size={13}
                      className="cursor-pointer hover:text-red-500 ml-0.5"
                      onClick={() => toggleRegion(r)}
                    />
                  </span>
                );
              })}

              {/* Active Vibes */}
              {filters.tags.map((t) => {
                const { icon: VibeIcon } = getVibeIcon(t);
                return (
                  <span
                    key={t}
                    className="glass-subtle text-accent-500 border border-accent-500/35 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm"
                  >
                    <VibeIcon size={12} />
                    <span>{formatVibeName(t)}</span>
                    <X
                      size={13}
                      className="cursor-pointer hover:text-red-500 ml-0.5"
                      onClick={() => toggleTag(t)}
                    />
                  </span>
                );
              })}

              {/* Active Budget */}
              {filters.budget !== 'all' && (
                <span className="glass-subtle text-accent-500 border border-accent-500/35 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                  <IndianRupee size={11} />
                  <span>{filters.budget === 'budget' ? '< ₹6K' : filters.budget === 'mid' ? '₹6K–₹14K' : '> ₹14K'}</span>
                  <X
                    size={13}
                    className="cursor-pointer hover:text-red-500 ml-0.5"
                    onClick={() => setBudgetFilter('all')}
                  />
                </span>
              )}

              <button
                type="button"
                onClick={clearFilters}
                className="text-xs text-accent-500 hover:text-accent-600 font-extrabold ml-2 underline transition-colors flex items-center gap-1 cursor-pointer"
              >
                Clear All
              </button>
            </motion.div>
          )}
        </div>

        {/* ─── Destination Grid ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {results.length > 0 ? (
            results.map((destination) => (
              <DestinationCard
                key={destination.id}
                destination={destination}
              />
            ))
          ) : (
            <EmptyState onClear={clearFilters} />
          )}
        </div>
      </div>

      {/* Real-time Location Detector Modal */}
      <LocationDetectorModal
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
      />
    </main>
  );
}
