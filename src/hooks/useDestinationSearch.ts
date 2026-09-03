import { useEffect, useMemo, useState } from 'react';
import type { Destination, ExplorerFilters } from '../types';
import destinations from '../data/destinations.json';

const ALL_DESTINATIONS = destinations as Destination[];

const BUDGET_RANGES: Record<ExplorerFilters['budget'], (budget: string) => boolean> = {
  all:    () => true,
  budget: (b) => {
    // Under ₹6,000/day
    const nums = b.match(/\d[\d,]*/g)?.map((n) => parseInt(n.replace(/,/g, ''), 10)) || [];
    const min = nums[0] || 0;
    return min < 6000;
  },
  mid: (b) => {
    // ₹6,000 – ₹12,000/day
    const nums = b.match(/\d[\d,]*/g)?.map((n) => parseInt(n.replace(/,/g, ''), 10)) || [];
    const val = nums[1] || nums[0] || 0;
    return val >= 6000 && val <= 14000;
  },
  luxury: (b) => {
    // Over ₹12,000/day
    const nums = b.match(/\d[\d,]*/g)?.map((n) => parseInt(n.replace(/,/g, ''), 10)) || [];
    const max = nums[1] || nums[0] || 0;
    return max > 12000;
  },
};

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export function useDestinationSearch() {
  const [filters, setFilters] = useState<ExplorerFilters>({
    query:   '',
    regions: [],
    tags:    [],
    budget:  'all',
  });

  const debouncedQuery = useDebounce(filters.query, 300);

  const results = useMemo(() => {
    let filtered = ALL_DESTINATIONS;

    // Text search across name, country, tagline, tags
    if (debouncedQuery.trim()) {
      const q = debouncedQuery.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.country.toLowerCase().includes(q) ||
          d.tagline.toLowerCase().includes(q) ||
          d.tags.some((t) => t.toLowerCase().includes(q)) ||
          d.region.toLowerCase().includes(q),
      );
    }

    // Region filter
    if (filters.regions.length > 0) {
      filtered = filtered.filter((d) => filters.regions.includes(d.region));
    }

    // Tag filter (any-match)
    if (filters.tags.length > 0) {
      filtered = filtered.filter((d) =>
        d.tags.some((t) => filters.tags.includes(t)),
      );
    }

    // Budget filter
    if (filters.budget !== 'all') {
      filtered = filtered.filter((d) =>
        BUDGET_RANGES[filters.budget](d.avgDailyBudget),
      );
    }

    return filtered;
  }, [debouncedQuery, filters.regions, filters.tags, filters.budget]);

  const allRegions = useMemo(
    () => [...new Set(ALL_DESTINATIONS.map((d) => d.region))].sort(),
    [],
  );

  const allTags = useMemo(
    () => [...new Set(ALL_DESTINATIONS.flatMap((d) => d.tags))].sort(),
    [],
  );

  const clearFilters = () =>
    setFilters({ query: '', regions: [], tags: [], budget: 'all' });

  const isFiltered =
    filters.query !== '' ||
    filters.regions.length > 0 ||
    filters.tags.length > 0 ||
    filters.budget !== 'all';

  return {
    filters,
    setFilters,
    results,
    totalCount: ALL_DESTINATIONS.length,
    allRegions,
    allTags,
    clearFilters,
    isFiltered,
  };
}
