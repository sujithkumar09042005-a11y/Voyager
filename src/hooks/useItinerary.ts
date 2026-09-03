import { useCallback, useState } from 'react';
import { generateItinerary } from '../lib/gemini';
import type { Destination, Itinerary, ItineraryFormValues } from '../types';

export type ItineraryState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: Itinerary }
  | { status: 'error'; message: string };

export function useItinerary() {
  const [state, setState] = useState<ItineraryState>({ status: 'idle' });

  const generate = useCallback(
    async (formValues: ItineraryFormValues, destination: Destination) => {
      setState({ status: 'loading' });

      try {
        const itinerary = await generateItinerary({
          formValues,
          destinationData: {
            name:            destination.name,
            country:         destination.country,
            description:     destination.description,
            tags:            destination.tags,
            places:          destination.places.map((p) => ({
              name:        p.name,
              category:    p.category,
              description: p.description,
            })),
            bestTimeToVisit: destination.bestTimeToVisit,
            avgDailyBudget:  destination.avgDailyBudget,
          },
        });

        setState({ status: 'success', data: itinerary });
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Failed to generate itinerary. Please try again.';
        setState({ status: 'error', message });
      }
    },
    [],
  );

  const reset = useCallback(() => setState({ status: 'idle' }), []);

  return { state, generate, reset };
}
