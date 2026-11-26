// Copyright (c) 2026 ReLU Technologies Private Limited. All rights reserved.
import { Clock, ExternalLink, Landmark, Lightbulb, Ticket, BookOpen } from 'lucide-react';
import placeDetails from '../../data/placeDetails.json';
import type { EntryFee, Place, PlaceDetails } from '../../types';
import { formatInr, formatLocal, useRatesToInr } from '../../lib/currency';

const DETAILS = placeDetails as Record<string, PlaceDetails>;

function Fee({ fee }: { fee: EntryFee }) {
  const rates = useRatesToInr();

  if (fee.kind === 'free') {
    return (
      <>
        <p className="font-display text-2xl text-[var(--text-primary)]">Free</p>
        {fee.note && <p className="mt-1 text-sm text-[var(--text-secondary)]">{fee.note}</p>}
      </>
    );
  }

  if (fee.kind === 'varies') {
    return (
      <>
        <p className="font-display text-2xl text-[var(--text-primary)]">Depends</p>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">{fee.note}</p>
      </>
    );
  }

  // Paid: show rupees first (the site prices everything in INR) with the local price beside it
  const rate = rates.data?.perUnit[fee.currency];
  const local = fee.to !== undefined && fee.to !== fee.from
    ? `${formatLocal(fee.currency, fee.from)} to ${new Intl.NumberFormat('en-US').format(fee.to)}`
    : formatLocal(fee.currency, fee.from);
  const inr = rate
    ? fee.to !== undefined && fee.to !== fee.from
      ? `${formatInr(fee.from * rate)} to ${formatInr(fee.to * rate)}`
      : formatInr(fee.from * rate)
    : null;

  return (
    <>
      <p className="font-display text-2xl text-[var(--text-primary)]">{inr ?? local}</p>
      {inr && <p className="text-sm text-[var(--text-muted)]">{local} locally</p>}
      {fee.note && <p className="mt-1 text-sm text-[var(--text-secondary)]">{fee.note}</p>}
      <p className="mt-2 text-xs text-[var(--text-muted)]">
        {rate
          ? 'Approximate. Converted at a daily exchange rate; prices change, so check before you go.'
          : 'Approximate local price; prices change, so check before you go.'}
      </p>
    </>
  );
}

/** History, entry fee, hours and tips for a place, shown in the place dialog. */
export function PlaceDetailsPanel({ place }: { place: Place }) {
  const details = DETAILS[place.id];

  if (!details) {
    return (
      <p className="text-sm text-[var(--text-muted)]">
        More details for this place are coming soon.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {/* History */}
      <section aria-labelledby={`hist-${place.id}`}>
        <div className="flex items-center gap-2 mb-2">
          <BookOpen size={16} className="text-accent-500" aria-hidden="true" />
          <h3 id={`hist-${place.id}`} className="ledger-label">History</h3>
          <span className="ml-auto text-xs font-semibold text-[var(--text-muted)] border border-dashed border-[var(--line)] rounded px-2 py-0.5">
            {details.era}
          </span>
        </div>
        <p className="text-[var(--text-secondary)] leading-relaxed text-sm sm:text-base">{details.history}</p>
      </section>

      {/* Fee and hours side by side */}
      <div className="grid sm:grid-cols-2 gap-4">
        <section className="card-ledger p-4" aria-labelledby={`fee-${place.id}`}>
          <div className="flex items-center gap-2 mb-2">
            <Ticket size={16} className="text-accent-500" aria-hidden="true" />
            <h3 id={`fee-${place.id}`} className="ledger-label">Entry fee</h3>
          </div>
          <Fee fee={details.fee} />
        </section>

        <section className="card-ledger p-4" aria-labelledby={`hrs-${place.id}`}>
          <div className="flex items-center gap-2 mb-2">
            <Clock size={16} className="text-accent-500" aria-hidden="true" />
            <h3 id={`hrs-${place.id}`} className="ledger-label">Opening hours</h3>
          </div>
          <p className="font-display text-lg leading-snug text-[var(--text-primary)]">{details.hours}</p>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Plan for <strong className="text-accent-500">{place.recommendedTime}</strong>.
          </p>
          <p className="mt-2 text-xs text-[var(--text-muted)]">Hours change by season and holiday, so confirm before you go.</p>
        </section>
      </div>

      {/* Tips */}
      <section aria-labelledby={`tips-${place.id}`}>
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb size={16} className="text-accent-500" aria-hidden="true" />
          <h3 id={`tips-${place.id}`} className="ledger-label">Visitor tips</h3>
        </div>
        <ul className="space-y-2">
          {details.tips.map((tip) => (
            <li key={tip} className="flex gap-2.5 text-sm text-[var(--text-secondary)] leading-relaxed">
              <Landmark size={14} className="text-accent-500 mt-1 flex-shrink-0" aria-hidden="true" />
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Sources */}
      {(details.officialUrl || details.sourceUrl) && (
        <p className="text-xs text-[var(--text-muted)] flex flex-wrap gap-x-4 gap-y-1">
          {details.officialUrl && (
            <a href={details.officialUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-accent-500 hover:underline">
              Official website <ExternalLink size={11} aria-hidden="true" />
            </a>
          )}
          {details.sourceUrl && (
            <a href={details.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-accent-500 hover:underline">
              History source: Wikipedia <ExternalLink size={11} aria-hidden="true" />
            </a>
          )}
        </p>
      )}
    </div>
  );
}
