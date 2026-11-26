// Copyright (c) 2026 ReLU Technologies Private Limited. All rights reserved.

/**
 * Longest trip the planner accepts, in days.
 * Keep in sync with MAX_TRIP_DAYS in api/itinerary.ts and server/index.cjs.
 */
export const MAX_TRIP_DAYS = 60;

/** Quick-pick lengths shown on the ruler. Any whole number from 1 to MAX_TRIP_DAYS can also be typed. */
export const DAY_PRESETS = [1, 2, 3, 4, 5, 7, 10, 14];

/** Trips longer than this are drafted in sections and take noticeably longer. */
export const LONG_TRIP_DAYS = 14;

/** Round to a whole number and keep it inside the allowed range. */
export function clampDays(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.min(MAX_TRIP_DAYS, Math.max(1, Math.round(value)));
}
