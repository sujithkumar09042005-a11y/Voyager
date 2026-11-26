import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Clock, MapPin, Minus, Plus, RefreshCw, Sparkles, Coffee, Scale, Zap } from 'lucide-react';
import type { Destination, ItineraryDay, ItineraryFormValues, ItineraryPace } from '../../types';
import destinations from '../../data/destinations.json';
import { useItinerary } from '../../hooks/useItinerary';
import { AtlasMap } from '../atlas/AtlasMap';
import { TripTicket } from './TripTicket';
import { Button } from '../../components/ui/Button';
import { CustomSelect } from '../../components/ui/CustomSelect';
import { ItinerarySkeleton } from '../../components/ui/Skeleton';
import { DAY_PRESETS, LONG_TRIP_DAYS, MAX_TRIP_DAYS, clampDays } from '../../lib/tripLimits';

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


// ─── Day Accordion ────────────────────────────────────────────────────────────

function DayAccordion({ day }: { day: ItineraryDay }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="card-ledger overflow-hidden">
      {/* Day header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 text-left hover-tint transition-colors focus:outline-none cursor-pointer"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          <div className="flex flex-col items-center justify-center w-11 h-12 border border-dashed border-accent-500 text-accent-500 flex-shrink-0 leading-none" aria-hidden="true">
            <span className="text-[0.55rem] font-bold tracking-widest">DAY</span>
            <span className="font-display text-xl mt-0.5">{day.dayNumber}</span>
          </div>
          <div>
            <p className="font-display text-base sm:text-xl text-[var(--text-primary)]">{day.title}</p>
            <p className="text-xs sm:text-xs text-[var(--text-muted)] font-medium">{day.theme}</p>
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
                        <span className="glass-subtle text-xs px-2.5 py-0.5 rounded-full text-[var(--text-muted)] font-medium">
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
                    <span className="font-bold text-accent-500">Tip: </span>
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

  // The typed text is kept separately so the field can be empty or half-typed without snapping back
  const [daysText, setDaysText] = useState(String(formValues.days));

  const setDays = (days: number) => {
    const clamped = clampDays(days);
    setFormValues((prev) => ({ ...prev, days: clamped }));
    setDaysText(String(clamped));
  };

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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-10 max-w-2xl">
          <motion.p
            className="legend-label mb-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Route planner / prices in rupees
          </motion.p>
          <motion.h1
            className="font-display text-4xl sm:text-5xl lg:text-6xl text-[var(--text-primary)] mb-3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            Draft a <em className="italic text-accent-500">route</em>
          </motion.h1>
          <motion.p
            className="text-base text-[var(--text-secondary)] leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            Fill in three sheets. Voyager AI drafts a day-by-day plan with timings and local budget estimates, and your ticket updates as you go.
          </motion.p>
        </div>

        <div className={state.status === 'success' ? '' : 'grid lg:grid-cols-[minmax(0,1fr)_360px] gap-8 items-start'}>
          {/* Form */}
          {state.status !== 'success' && (
            <motion.form
              onSubmit={handleSubmit}
              className="card-ledger overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              aria-label="Trip planner"
            >
              {/* Sheet 1: where */}
              <section className="plan-sheet">
                <div className="plan-sheet__head">
                  <span className="plan-sheet__num" aria-hidden="true">01</span>
                  <h2 className="plan-sheet__title">Where to</h2>
                  <span className="plan-sheet__hint">Required</span>
                </div>
                <CustomSelect
                  id="destination-select"
                  label="Destination"
                  placeholder="Search or choose a destination"
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
              </section>

              {/* Sheet 2: how long and how fast */}
              <section className="plan-sheet">
                <div className="plan-sheet__head">
                  <span className="plan-sheet__num" aria-hidden="true">02</span>
                  <h2 className="plan-sheet__title">How long, how fast</h2>
                </div>

                <fieldset>
                  <legend className="text-sm font-semibold text-[var(--text-primary)] mb-1">Trip length</legend>
                  <div className="day-ruler" role="radiogroup" aria-label="Quick trip length in days">
                    {DAY_PRESETS.map((d) => (
                      <label key={d} className="day-ruler__stop">
                        <input
                          type="radio"
                          name="days"
                          value={d}
                          className="sr-only"
                          checked={formValues.days === d}
                          onChange={() => setDays(d)}
                          aria-label={`${d} ${d === 1 ? 'day' : 'days'}`}
                        />
                        <span className="day-ruler__tick" aria-hidden="true" />
                        <span className="day-ruler__num" aria-hidden="true">{d}</span>
                      </label>
                    ))}
                  </div>

                  {/* Any length up to the limit */}
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <label htmlFor="trip-days" className="text-sm text-[var(--text-secondary)]">
                      Or enter any length, up to {MAX_TRIP_DAYS} days
                    </label>
                    <div className="inline-flex items-center border border-[var(--line)] rounded-md bg-[var(--surface-raised)]">
                      <button
                        type="button"
                        onClick={() => setDays(formValues.days - 1)}
                        disabled={formValues.days <= 1}
                        className="w-11 h-11 flex items-center justify-center text-[var(--text-primary)] disabled:opacity-40"
                        aria-label="One day fewer"
                      >
                        <Minus size={16} aria-hidden="true" />
                      </button>
                      <input
                        id="trip-days"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={daysText}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, '').slice(0, 3);
                          setDaysText(digits);
                          if (digits !== '') {
                            // Keep the live ticket in step while typing, without rewriting what is typed
                            setFormValues((prev) => ({ ...prev, days: clampDays(Number(digits)) }));
                          }
                        }}
                        onBlur={() => setDays(daysText === '' ? formValues.days : Number(daysText))}
                        className="w-16 h-11 text-center bg-transparent text-base font-semibold text-[var(--text-primary)] border-x border-[var(--line)] focus:outline-none tabular-nums"
                        aria-describedby="trip-days-hint"
                      />
                      <button
                        type="button"
                        onClick={() => setDays(formValues.days + 1)}
                        disabled={formValues.days >= MAX_TRIP_DAYS}
                        className="w-11 h-11 flex items-center justify-center text-[var(--text-primary)] disabled:opacity-40"
                        aria-label="One day more"
                      >
                        <Plus size={16} aria-hidden="true" />
                      </button>
                    </div>
                    <span className="text-sm text-[var(--text-muted)]">days</span>
                  </div>
                  <p id="trip-days-hint" className="mt-2 text-sm text-[var(--text-muted)]" aria-live="polite">
                    {Number(daysText) > MAX_TRIP_DAYS
                      ? `The longest trip we can plan is ${MAX_TRIP_DAYS} days, so we will use ${MAX_TRIP_DAYS}.`
                      : formValues.days > LONG_TRIP_DAYS
                        ? 'Long trips are drafted in sections and can take up to a minute.'
                        : ''}
                  </p>
                </fieldset>

                <fieldset className="mt-7">
                  <legend className="text-sm font-semibold text-[var(--text-primary)] mb-3">Pace</legend>
                  <div className="grid sm:grid-cols-3 gap-3">
                    {PACE_OPTIONS.map(({ value, label, icon: Icon, description }) => {
                      const stops = value === 'relaxed' ? 2 : value === 'balanced' ? 4 : 6;
                      return (
                        <label key={value} className="block">
                          <input
                            type="radio"
                            name="pace"
                            value={value}
                            className="sr-only"
                            checked={formValues.pace === value}
                            onChange={() => setFormValues((prev) => ({ ...prev, pace: value }))}
                          />
                          <span className="pace-card">
                            <span className="pace-card__route" aria-hidden="true">
                              {Array.from({ length: stops }).map((_, i) => (
                                <span key={i} className="contents">
                                  <i />
                                  {i < stops - 1 && <b />}
                                </span>
                              ))}
                            </span>
                            <span className="flex items-center gap-2 mb-1">
                              <Icon size={15} className="text-accent-500" aria-hidden="true" />
                              <span className="text-sm font-bold text-[var(--text-primary)]">{label}</span>
                            </span>
                            <span className="block text-xs text-[var(--text-secondary)]">{description}</span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              </section>

              {/* Sheet 3: interests */}
              <section className="plan-sheet">
                <div className="plan-sheet__head">
                  <span className="plan-sheet__num" aria-hidden="true">03</span>
                  <h2 className="plan-sheet__title">What you love</h2>
                  <span className="plan-sheet__hint">Pick any</span>
                </div>
                <fieldset>
                  <legend className="sr-only">Travel interests</legend>
                  <div className="flex flex-wrap gap-2">
                    {INTEREST_OPTIONS.map((interest) => (
                      <label key={interest}>
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={formValues.interests.includes(interest)}
                          onChange={() => toggleInterest(interest)}
                        />
                        <span className="legend-chip">{interest}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              </section>

              {/* Submit */}
              <div className="plan-sheet" style={{ background: 'var(--surface-sunken)' }}>
                {state.status === 'error' && (
                  <div
                    role="alert"
                    className="mb-4 border border-[var(--danger)] rounded-md px-4 py-3 text-sm font-medium text-[var(--danger)]"
                  >
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
                  className="bg-accent-500 hover:bg-accent-600 text-onaccent font-bold py-4"
                >
                  {state.status === 'loading' ? 'Drafting your route…' : 'Draft my route'}
                </Button>
                {!formValues.destinationId && (
                  <p className="mt-3 text-xs text-[var(--text-muted)] text-center">
                    Choose a destination in sheet 01 to continue.
                  </p>
                )}
              </div>
            </motion.form>
          )}

          {/* Live ticket */}
          {state.status !== 'success' && (
            <div className="lg:sticky lg:top-28">
              <TripTicket
                destination={selectedDestination}
                days={formValues.days}
                pace={formValues.pace}
                interests={formValues.interests}
              />
            </div>
          )}
        </div>

        {/* Loading: the route draws itself */}
        {state.status === 'loading' && (
          <motion.div
            className="mt-8 space-y-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            role="status"
          >
            <div className="card-ledger p-5 flex items-center gap-4">
              <svg width="96" height="28" viewBox="0 0 96 28" aria-hidden="true" className="flex-shrink-0">
                <path className="draft-route" d="M4 22 C 24 2, 40 26, 56 12 S 84 4, 92 8" />
                <circle cx="4" cy="22" r="3.5" fill="var(--accent-color)" />
                <circle cx="92" cy="8" r="3.5" fill="var(--accent-color)" />
              </svg>
              <p className="text-sm font-medium text-[var(--text-primary)]">
                Drafting a {formValues.days}-day route for {selectedDestination?.name}. {formValues.days > LONG_TRIP_DAYS ? 'Long trips are drafted in sections and can take up to a minute.' : 'This takes a few seconds.'}
              </p>
            </div>
            <ItinerarySkeleton />
          </motion.div>
        )}

        {/* Generated Success Itinerary */}
        {state.status === 'success' && (
          <motion.div
            className="space-y-6 max-w-4xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {state.data.degraded && (
              <div
                role="alert"
                className="border border-[var(--danger)] rounded-md px-4 py-3 text-sm text-[var(--danger)] flex flex-wrap items-center justify-between gap-3"
              >
                <span className="font-medium">
                  The AI was unavailable, so this is a generic estimate built from the destination&apos;s highlights, not a personalised plan.
                </span>
                <Button variant="outline" size="sm" onClick={reset} className="border-[var(--danger)] text-[var(--danger)]">
                  Try again
                </Button>
              </div>
            )}

            {/* Itinerary Header */}
            <div className="card-ledger is-accent p-6 sm:p-8 flex items-start justify-between gap-4 flex-wrap">
              <div>
                <span className="legend-label">
                  AI-drafted route
                </span>
                <h2 className="font-display text-2xl sm:text-3xl text-[var(--text-primary)] mt-1">
                  {state.data.totalDays}-day route for{' '}
                  <span className="text-accent-500">{state.data.destinationName}</span>
                </h2>
                <div className="flex items-center gap-3 mt-2 text-xs text-[var(--text-muted)] font-medium flex-wrap">
                  <span className="capitalize">{state.data.pace} pace</span>
                  <span aria-hidden="true">/</span>
                  <span>Prices in rupees</span>
                  {state.data.interests.length > 0 && (
                    <>
                      <span aria-hidden="true">/</span>
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
                className="text-[var(--text-primary)] font-bold border-[var(--line)]"
              >
                Plan another trip
              </Button>
            </div>

            {/* Where this trip is */}
            <div className="card-ledger p-4">
              <p className="ledger-label mb-3">On the atlas</p>
              <AtlasMap compact focusId={state.data.destinationId} visibleIds={[state.data.destinationId]} />
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
