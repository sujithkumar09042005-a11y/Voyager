// Copyright (c) 2026 ReLU Technologies Private Limited. All rights reserved.
import type { Destination, ItineraryPace } from '../../types';
import { AtlasMap } from '../atlas/AtlasMap';

const PACE_LABEL: Record<ItineraryPace, string> = {
  relaxed: 'Relaxed',
  balanced: 'Balanced',
  packed: 'Packed',
};

/** Parse "Rs 3,500 - Rs 7,500" style strings into a [low, high] daily range. */
function parseDailyRange(budget: string): [number, number] | null {
  const nums = (budget.match(/\d[\d,]*/g) ?? []).map((n) => parseInt(n.replace(/,/g, ''), 10));
  if (nums.length === 0 || nums.some(Number.isNaN)) return null;
  return [nums[0], nums[1] ?? nums[0]];
}

const inr = (n: number) => `\u20B9${n.toLocaleString('en-IN')}`;

/** Three-letter route code, like an airport code: "Kyoto" -> "KYO". */
function routeCode(name: string): string {
  const letters = name.replace(/[^A-Za-z]/g, '').toUpperCase();
  return letters.slice(0, 3).padEnd(3, 'X');
}

interface TripTicketProps {
  destination: Destination | undefined;
  days: number;
  pace: ItineraryPace;
  interests: string[];
}

/** A boarding-pass style summary that fills in as the planner form is completed. */
export function TripTicket({ destination, days, pace, interests }: TripTicketProps) {
  const range = destination ? parseDailyRange(destination.avgDailyBudget) : null;
  const total = range ? `${inr(range[0] * days)} \u2013 ${inr(range[1] * days)}` : null;

  return (
    <aside className="trip-ticket" aria-label="Your trip summary" aria-live="polite">
      <div className="trip-ticket__main">
        <p className="ledger-label">Route ticket / Voyager</p>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="trip-ticket__field-label">From</p>
            <p className="font-display text-3xl leading-none text-[var(--text-muted)]">YOU</p>
          </div>
          <span className="trip-ticket__route" aria-hidden="true" />
          <div className="text-right">
            <p className="trip-ticket__field-label">To</p>
            <p
              className={`font-display text-3xl leading-none ${destination ? 'text-accent-500' : 'text-[var(--text-muted)]'}`}
            >
              {destination ? routeCode(destination.name) : '???'}
            </p>
          </div>
        </div>

        <p className="mt-4 font-display text-xl leading-snug text-[var(--text-primary)]">
          {destination ? `${destination.name}, ${destination.country}` : 'Choose a destination'}
        </p>

        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
          <div>
            <dt className="trip-ticket__field-label">Duration</dt>
            <dd className="trip-ticket__field-value">
              {days} {days === 1 ? 'day' : 'days'}
            </dd>
          </div>
          <div>
            <dt className="trip-ticket__field-label">Pace</dt>
            <dd className="trip-ticket__field-value">{PACE_LABEL[pace]}</dd>
          </div>
          <div className="col-span-2">
            <dt className="trip-ticket__field-label">Estimated spend</dt>
            <dd className="trip-ticket__field-value">{total ?? 'Pick a destination to estimate'}</dd>
          </div>
          <div className="col-span-2">
            <dt className="trip-ticket__field-label">Interests</dt>
            <dd className="trip-ticket__field-value">
              {interests.length > 0 ? interests.join(', ') : 'Anything goes'}
            </dd>
          </div>
        </dl>
      </div>

      {/* Perforation with notches */}
      <div className="trip-ticket__tear" aria-hidden="true" />

      <div className="trip-ticket__stub">
        {destination ? (
          <AtlasMap key={destination.id} compact focusId={destination.id} visibleIds={[destination.id]} />
        ) : (
          <p className="text-sm text-[var(--text-muted)] py-6 text-center">
            Your destination will appear on the map here.
          </p>
        )}
        <span className="trip-ticket__barcode" aria-hidden="true" />
      </div>
    </aside>
  );
}
