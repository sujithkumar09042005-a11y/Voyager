import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Camera, ArrowRight } from 'lucide-react';
import type { Destination } from '../../types';
import { useDestinationImage } from '../../hooks/usePexelsImage';
import { formatCoordinates, formatVibeName } from '../../utils/formatters';

interface DestinationCardProps {
  destination: Destination;
}

export function DestinationCard({ destination }: DestinationCardProps) {
  const [imgError, setImgError] = useState(false);

  // Fetch live Pexels image with fallback
  const { data: pexelsData, isLoading: imgLoading } = useDestinationImage(
    destination.name,
    destination.country,
    destination.fallbackImage,
  );

  const imageSrc = imgError
    ? destination.fallbackImage
    : (pexelsData?.url ?? destination.fallbackImage);

  const { lat, lng } = destination.coordinates;

  return (
    <Link
      to={`/destination/${destination.id}`}
      className="block h-full rounded-md"
      aria-label={`${destination.name}, ${destination.country}. ${destination.tagline}`}
    >
      <article className="group card-postcard">
        {/* Photo, with a perforated stamp and a postmark */}
        <div className="postcard-photo">
          <img
            src={imageSrc}
            alt=""
            loading="lazy"
            decoding="async"
            onError={() => setImgError(true)}
            className={`w-full h-full object-cover ${imgLoading ? 'opacity-0' : 'opacity-100'}`}
          />
          <div className="postage-stamp" aria-hidden="true">
            <div className="stamp-inner">
              <span className="stamp-code">{destination.currency.match(/[A-Z]{3}/)?.[0] ?? ''}</span>
              <span>{destination.region}</span>
            </div>
          </div>
          <div className={`postmark ${destination.country.length > 10 ? 'is-long' : ''}`} aria-hidden="true">
            {destination.country}
          </div>
          {pexelsData?.photographer && (
            <span className="absolute bottom-2 right-2 glass-dark text-xs px-2 py-0.5 rounded-sm flex items-center gap-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
              <Camera size={10} aria-hidden="true" />
              {pexelsData.photographer}
            </span>
          )}
        </div>

        {/* Message side */}
        <div className="px-2 pt-4 pb-4 flex-1 flex flex-col">
          <p className="coords mb-1.5">{formatCoordinates(lat, lng)}</p>
          <h3 className="font-display text-2xl leading-tight text-[var(--text-primary)] group-hover:text-accent-500 transition-colors">
            {destination.name}
          </h3>
          <p className="mt-1.5 text-sm text-[var(--text-secondary)] line-clamp-2 leading-relaxed italic font-display">
            {destination.tagline}
          </p>

          <dl className="mt-4 grid grid-cols-2 gap-3 pt-3 border-t border-dotted border-[var(--line)] text-xs">
            <div>
              <dt className="legend-label" style={{ fontSize: '0.62rem' }}>Best time</dt>
              <dd className="mt-0.5 text-[var(--text-primary)] font-medium">{destination.bestTimeToVisit}</dd>
            </div>
            <div>
              <dt className="legend-label" style={{ fontSize: '0.62rem' }}>Per day</dt>
              <dd className="mt-0.5 text-[var(--text-primary)] font-bold">{destination.avgDailyBudget}</dd>
            </div>
          </dl>

          <ul className="mt-4 flex flex-wrap gap-x-3 gap-y-1 text-xs text-[var(--text-muted)]" aria-label="Themes">
            {destination.tags.slice(0, 3).map((tag) => (
              <li key={tag} className="flex items-center gap-1">
                <span className="text-accent-500" aria-hidden="true">/</span>
                {formatVibeName(tag)}
              </li>
            ))}
          </ul>

          <span className="mt-auto pt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-500">
            Open destination
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </span>
        </div>
      </article>
    </Link>
  );
}
