import { useCallback, useRef, useState } from 'react';
import type { Coordinates, GeolocationState } from '../types';

const GEOLOCATION_OPTIONS: PositionOptions = {
  enableHighAccuracy: false,
  timeout: 10000,
  maximumAge: 300000, // 5-minute cache
};

/**
 * Geolocation hook with explicit consent — never auto-triggers.
 * Returns a request function so the component controls when to prompt.
 */
export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    status: 'idle',
    coords: null,
    error: null,
  });

  const abortRef = useRef<(() => void) | null>(null);

  const requestLocation = useCallback(() => {
    // Check browser support
    if (!navigator.geolocation) {
      setState({
        status: 'unsupported',
        coords: null,
        error: 'Geolocation is not supported by your browser.',
      });
      return;
    }

    setState(prev => ({ ...prev, status: 'pending', error: null }));

    navigator.geolocation.getCurrentPosition(
      (position: GeolocationPosition) => {
        const coords: Coordinates = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setState({ status: 'granted', coords, error: null });
      },
      (err: GeolocationPositionError) => {
        let errorMessage = 'Unable to retrieve your location.';
        if (err.code === err.PERMISSION_DENIED) {
          errorMessage = 'Location access was denied. You can search for a location manually.';
          setState({ status: 'denied', coords: null, error: errorMessage });
        } else if (err.code === err.TIMEOUT) {
          errorMessage = 'Location request timed out. Try again or search manually.';
          setState({ status: 'idle', coords: null, error: errorMessage });
        } else {
          setState({ status: 'idle', coords: null, error: errorMessage });
        }
      },
      GEOLOCATION_OPTIONS,
    );

    abortRef.current = () => { /* getCurrentPosition can't be cancelled */ };
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.();
    setState({ status: 'idle', coords: null, error: null });
  }, []);

  return { ...state, requestLocation, reset };
}
