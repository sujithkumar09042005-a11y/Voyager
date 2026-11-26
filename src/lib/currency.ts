// Copyright (c) 2026 ReLU Technologies Private Limited. All rights reserved.
import { useQuery } from '@tanstack/react-query';

/** Free, key-less exchange rate feed with open CORS. Rates are daily, not live. */
const RATES_URL = 'https://open.er-api.com/v6/latest/INR';

export interface RatesToInr {
  /** How many rupees one unit of each currency is worth. */
  perUnit: Record<string, number>;
  /** When the feed last updated, as reported by the feed. */
  updatedAt: string;
}

async function fetchRates(): Promise<RatesToInr> {
  const response = await fetch(RATES_URL);
  if (!response.ok) throw new Error(`rates ${response.status}`);
  const data = await response.json();
  if (data.result !== 'success' || !data.rates) throw new Error('rates unavailable');
  // The feed gives units of each currency per 1 INR, so invert to get rupees per unit
  const perUnit: Record<string, number> = {};
  for (const [code, rate] of Object.entries(data.rates as Record<string, number>)) {
    if (rate > 0) perUnit[code] = 1 / rate;
  }
  return { perUnit, updatedAt: String(data.time_last_update_utc ?? '') };
}

/** Exchange rates to rupees, cached for six hours. Fees still show in local currency if this fails. */
export function useRatesToInr() {
  return useQuery<RatesToInr>({
    queryKey: ['rates-to-inr'],
    queryFn: fetchRates,
    staleTime: 6 * 60 * 60 * 1000,
    gcTime: 12 * 60 * 60 * 1000,
    retry: 1,
  });
}

/** Rupee amounts are rounded so that an approximate price does not look falsely exact. */
export function roundInr(amount: number): number {
  if (amount < 100) return Math.round(amount / 5) * 5;
  if (amount < 1000) return Math.round(amount / 10) * 10;
  if (amount < 10000) return Math.round(amount / 50) * 50;
  return Math.round(amount / 100) * 100;
}

const INR = new Intl.NumberFormat('en-IN');

export function formatInr(amount: number): string {
  return `\u20B9${INR.format(roundInr(amount))}`;
}

/** Local money, written with its currency code so it is never ambiguous, for example "EUR 22". */
export function formatLocal(currency: string, amount: number): string {
  return `${currency} ${new Intl.NumberFormat('en-US').format(amount)}`;
}
