import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Clock, Camera, ArrowRight } from 'lucide-react';
import type { Destination } from '../../types';
import { useDestinationImage } from '../../hooks/usePexelsImage';
import { formatVibeName } from '../../utils/formatters';

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

  return (
    <Link
      to={`/destination/${destination.id}`}
      className="block h-full focus-visible:outline-2 focus-visible:outline-accent-500 rounded-3xl"
    >
      <motion.article
        className="group relative h-full glass-card place-card-interactive card-glow-hover overflow-hidden flex flex-col rounded-3xl border border-[var(--glass-border)] cursor-pointer"
        whileHover={{ y: -6, scale: 1.015 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        {/* Image Container */}
        <div className="relative h-56 overflow-hidden bg-surface-200">
          <img
            src={imageSrc}
            alt={`${destination.name}, ${destination.country}`}
            loading="lazy"
            onError={() => setImgError(true)}
            className={`w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-108 ${
              imgLoading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
            }`}
          />

          {/* Region badge overlay */}
          <div className="absolute top-3 left-3">
            <span className="glass-dark text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
              {destination.region}
            </span>
          </div>

          {/* Photographer attribution badge */}
          {pexelsData?.photographer && (
            <div className="absolute bottom-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <span className="glass-dark text-white/95 text-2xs px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                <Camera size={10} />
                <span>{pexelsData.photographer}</span>
              </span>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            {/* Title & Location */}
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <h3 className="font-display font-bold text-xl text-[var(--text-primary)] leading-tight group-hover:text-accent-500 transition-colors">
                {destination.name}
              </h3>
              <div className="flex items-center gap-1 text-xs text-[var(--text-muted)] flex-shrink-0 mt-0.5 font-medium">
                <MapPin size={12} className="text-accent-500" />
                <span>{destination.country}</span>
              </div>
            </div>

            {/* Tagline */}
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] line-clamp-2 leading-relaxed mb-4">
              {destination.tagline}
            </p>
          </div>

          <div>
            {/* Meta row with Indian Rupee */}
            <div className="flex items-center justify-between py-2 border-t border-[var(--glass-border-subtle)] mb-3 text-xs text-[var(--text-secondary)]">
              <span className="flex items-center gap-1.5">
                <Clock size={12} className="text-accent-500" />
                <span>{destination.bestTimeToVisit}</span>
              </span>
              <span className="font-bold text-accent-500 text-xs sm:text-sm">
                {destination.avgDailyBudget} <span className="text-2xs font-normal text-[var(--text-muted)]">/day</span>
              </span>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5">
              {destination.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="glass-subtle text-[var(--text-secondary)] text-2xs font-semibold px-2.5 py-1 rounded-full"
                >
                  {formatVibeName(tag)}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Hover CTA Strip */}
        <div className="bg-gradient-to-r from-accent-500 to-cyan-500 text-white text-center py-2.5 text-xs font-bold tracking-wide uppercase flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <span>Explore Destination</span>
          <ArrowRight size={13} />
        </div>
      </motion.article>
    </Link>
  );
}
