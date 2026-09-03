import { useQuery } from '@tanstack/react-query';
import { fetchWeatherByCoords } from '../lib/weather';
import type { WeatherData } from '../types';

interface UseWeatherOptions {
  lat: number;
  lng: number;
  enabled?: boolean;
}

export function useWeather({ lat, lng, enabled = true }: UseWeatherOptions) {
  return useQuery<WeatherData, Error>({
    queryKey: ['weather', lat, lng],
    queryFn: () => fetchWeatherByCoords(lat, lng),
    enabled: enabled && !!lat && !!lng,
    staleTime:    10 * 60 * 1000, // 10 minutes — no need to hammer the API
    gcTime:       30 * 60 * 1000, // Keep in cache for 30 minutes
    retry: 2,
    retryDelay:   (attempt) => Math.min(1000 * 2 ** attempt, 10000),
  });
}
