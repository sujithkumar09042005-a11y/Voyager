import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Clock, MapPin, RefreshCw, Sparkles, Coffee, Scale, Zap } from 'lucide-react';
import type { Destination, ItineraryDay, ItineraryFormValues, ItineraryPace } from '../../types';
import destinations from '../../data/destinations.json';
import { useItinerary } from '../../hooks/useItinerary';
import { Button } from '../../components/ui/Button';
import { CustomSelect } from '../../components/ui/CustomSelect';
import { ItinerarySkeleton } from '../../components/ui/Skeleton';

const ALL_DESTINATIONS = destinations as Destination[];

const PACE_OPTIONS: { value: ItineraryPace; label: string; icon: React.ComponentType<{ size?: number; className?: string }>; description: string }[] = [
  { value: 'relaxed', label: 'Relaxed', icon: Coffee, description: 'Fewer stops, lots of wandering' },
  { value: 'balanced', label: 'Balanced', icon: Scale, description: 'Mix of sightseeing and downtime' },
  { value: 'packed', label: 'Packed', icon: Zap, description: 'See everything, maximum efficiency' },
];

const INTEREST_OPTIONS = [
  'Culture & Heritage', 'Street Food & Dining', 'Nature & Views', 'Ancient History',
  'Art & Museums', 'Local Shopping', 'Nightlife', 'Adventure Sports', 'Wellness & Spa', 'Photography'
];

const DAYS_OPTIONS = [1, 2, 3, 4, 5, 7, 10, 14];

// ─── Day Accordion ────────────────────────────────────────────────────────────

function DayAccordion({ day }: { day: ItineraryDay }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="glass-panel overflow-hidden rounded-3xl border border-[var(--glass-border)] shadow-glass-sm">
      {/* Day header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 text-left hover:bg-white/5 transition-colors focus:outline-none cursor-pointer"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-accent-500 text-white text-xs sm:text-sm font-bold flex items-center justify-center flex-shrink-0 shadow-md">
            {day.dayNumber}
          </div>
          <div>
            <p className="font-display font-bold text-sm sm:text-lg text-[var(--text-primary)]">{day.title}</p>
            <p className="text-2xs sm:text-xs text-[var(--text-muted)] font-medium">{day.theme}</p>
          </div>
        </div>
        <ChevronDown
          size={18}
          className={`text-[var(--text-muted)] flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-180 text-accent-500' : ''}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="px-4 sm:px-6 pb-5 sm:pb-6 pt-2 space-y-2 border-t border-[var(--glass-border-subtle)]">
              {/* Timeline */}
              {day.stops.map((stop, index) => (
                <div key={index} className="flex gap-4">
                  {/* Timeline line */}
                  <div className="flex flex-col items-center w-8 flex-shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-accent-400 mt-2 flex-shrink-0 shadow-sm" />
                    {index < day.stops.length - 1 && (
                      <div className="w-px flex-1 bg-[var(--glass-border)] mt-1" />
                    )}
                  </div>

                  {/* Stop content */}
                  <div className={`flex-1 pb-4 ${index === day.stops.length - 1 ? 'pb-0' : ''}`}>
                    <div className="flex items-center gap-2 mb-1">
                      {stop.time && (
                        <span className="text-xs font-mono text-accent-500 font-bold glass-subtle px-2 py-0.5 rounded-full">
                          {stop.time}
                        </span>
                      )}
                      {stop.category && (
                        <span className="glass-subtle text-2xs px-2.5 py-0.5 rounded-full text-[var(--text-muted)] font-medium">
                          {stop.category}
                        </span>
                      )}
                    </div>
                    <p className="text-sm sm:text-base font-bold text-[var(--text-primary)] mb-0.5">{stop.place}</p>
                    <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">{stop.notes}</p>
                    {stop.durationMinutes && (
                      <div className="flex items-center gap-1 mt-1.5 text-xs text-[var(--text-muted)]">
                        <Clock size={11} className="text-accent-500" />
                        <span>Approx. {stop.durationMinutes} minutes</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Day tip */}
              {day.tips && (
                <div className="mt-4 glass-subtle border border-accent-500/30 rounded-2xl px-4 py-3">
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    <span className="font-bold text-accent-500">💡 Voyager Tip: </span>
                    {day.tips}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Itinerary Page ───────────────────────────────────────────────────────────

export function ItineraryPage() {
  const [searchParams] = useSearchParams();
  const preselectedId  = searchParams.get('destination') ?? '';

  const [formValues, setFormValues] = useState<ItineraryFormValues>({
    destinationId: preselectedId,
    days:          3,
    pace:          'balanced',
    interests:     [],
  });

  const selectedDestination = ALL_DESTINATIONS.find(
    (d) => d.id === formValues.destinationId,
  );

  const { state, generate, reset } = useItinerary();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDestination) return;
    generate(formValues, selectedDestination);
  };

  const toggleInterest = (interest: string) => {
    setFormValues((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  return (
    <main id="main-content" className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 relative">
      {/* Ambient background mesh */}
      <div className="background-mesh" aria-hidden="true" />

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-10 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-accent-500 animate-pulse" />
            <motion.p
              className="text-xs font-bold uppercase tracking-widest text-accent-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Smart AI Engine · Estimates in Indian Rupees (₹)
            </motion.p>
          </div>
          <motion.h1
            className="font-display text-4xl sm:text-5xl font-extrabold text-[var(--text-primary)] tracking-tight mb-3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            Plan Your Journey
          </motion.h1>
          <motion.p
            className="text-sm sm:text-base text-[var(--text-secondary)] max-w-xl leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            Choose your destination, preferred pace, and travel vibe. Voyager AI will craft an optimal day-by-day itinerary with exact timing and realistic Indian Rupee expenses.
          </motion.p>
        </div>

        {/* Form */}
        {state.status !== 'success' && (
          <motion.form
            onSubmit={handleSubmit}
            className="glass-panel p-6 sm:p-10 rounded-3xl space-y-8 shadow-2xl border border-[var(--glass-border)]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            {/* Destination Selector */}
            <div>
              <CustomSelect
                id="destination-select"
                label="Select Destination *"
                placeholder="Search or choose a country / destination…"
                searchable={true}
                icon={<MapPin size={18} />}
                value={formValues.destinationId}
                onChange={(val) => setFormValues((prev) => ({ ...prev, destinationId: val }))}
                options={ALL_DESTINATIONS.map((d) => ({
                  value: d.id,
                  label: `${d.name}, ${d.country}`,
                  subtext: `${d.avgDailyBudget}/day`,
                }))}
              />
            </div>

            {/* Days Count */}
            <div>
              <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">
                Trip Duration (Days)
              </label>
              <div className="flex flex-wrap gap-2.5">
                {DAYS_OPTIONS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setFormValues((prev) => ({ ...prev, days: d }))}
                    className={[
                      'px-5 py-2.5 rounded-2xl text-sm font-bold transition-all',
                      formValues.days === d
                        ? 'bg-accent-500 text-white shadow-lg'
                        : 'glass-subtle text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--glass-border-subtle)]',
                    ].join(' ')}
                  >
                    {d} {d === 1 ? 'Day' : 'Days'}
                  </button>
                ))}
              </div>
            </div>

            {/* Travel Pace */}
            <div>
              <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">
                Travel Pace
              </label>
              <div className="grid sm:grid-cols-3 gap-3">
                {PACE_OPTIONS.map(({ value, label, icon: Icon, description }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFormValues((prev) => ({ ...prev, pace: value }))}
                    className={[
                      'p-4 rounded-2xl border text-left transition-all cursor-pointer',
                      formValues.pace === value
                        ? 'border-accent-500 bg-accent-500/10 shadow-md'
                        : 'border-[var(--glass-border-subtle)] glass-subtle hover:border-[var(--glass-border)]',
                    ].join(' ')}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon size={16} className={formValues.pace === value ? 'text-accent-500' : 'text-[var(--text-muted)]'} />
                      <p className="text-sm font-bold text-[var(--text-primary)]">{label}</p>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)]">{description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Interests */}
            <div>
              <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">
                Travel Interests (Select all that apply)
              </label>
              <div className="flex flex-wrap gap-2">
                {INTEREST_OPTIONS.map((interest) => {
                  const active = formValues.interests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={[
                        'px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all',
                        active
                          ? 'bg-accent-500 text-white border-accent-500 shadow-md'
                          : 'glass-subtle text-[var(--text-secondary)] border-[var(--glass-border-subtle)] hover:text-[var(--text-primary)]',
                      ].join(' ')}
                      aria-pressed={active}
                    >
                      {interest}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Error Message */}
            {state.status === 'error' && (
              <div className="glass-subtle border border-red-500/30 rounded-2xl px-5 py-3.5 text-sm text-red-500 font-medium">
                {state.message}
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              loading={state.status === 'loading'}
              disabled={!formValues.destinationId}
              fullWidth
              leftIcon={<Sparkles size={18} />}
              className="bg-accent-500 hover:bg-accent-600 font-bold shadow-xl hover:shadow-accent-500/30 py-4"
            >
              {state.status === 'loading'
                ? 'Synthesizing Your Custom Itinerary with Gemini…'
                : 'Generate Custom Itinerary'}
            </Button>
          </motion.form>
        )}

        {/* Loading Skeleton */}
        {state.status === 'loading' && (
          <motion.div
            className="mt-8 space-y-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="glass-panel p-4 rounded-2xl text-center">
              <p className="text-sm font-semibold text-accent-500 animate-pulse">
                ✨ Voyager AI is curating a {formValues.days}-day plan for {selectedDestination?.name} in Indian Rupees (₹)...
              </p>
            </div>
            <ItinerarySkeleton />
          </motion.div>
        )}

        {/* Generated Success Itinerary */}
        {state.status === 'success' && (
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Itinerary Header */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl flex items-start justify-between gap-4 flex-wrap">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-accent-500">
                  Custom AI Generated Trip
                </span>
                <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] mt-1">
                  {state.data.totalDays}-Day Itinerary for{' '}
                  <span className="text-gradient-accent">{state.data.destinationName}</span>
                </h2>
                <div className="flex items-center gap-3 mt-2 text-xs text-[var(--text-muted)] font-medium flex-wrap">
                  <span className="capitalize">{state.data.pace} pace</span>
                  <span>·</span>
                  <span>Currency: Indian Rupee (₹)</span>
                  {state.data.interests.length > 0 && (
                    <>
                      <span>·</span>
                      <span>{state.data.interests.join(', ')}</span>
                    </>
                  )}
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={reset}
                leftIcon={<RefreshCw size={14} />}
                className="glass-subtle text-[var(--text-primary)] font-bold border-[var(--glass-border)]"
              >
                Plan Another Trip
              </Button>
            </div>

            {/* Day Accordions */}
            <div className="space-y-4">
              {state.data.days.map((day) => (
                <motion.div
                  key={day.dayNumber}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: day.dayNumber * 0.06 }}
                >
                  <DayAccordion day={day} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
