import { useQuery } from '@tanstack/react-query';
import { fetchDestinationImage, fetchPlaceImage, fetchImages } from '../lib/images';
import type { ImageResult } from '../types';

/**
 * Hook to dynamically fetch a destination hero image from Pexels
 * with automatic caching and fallback support.
 */
export function useDestinationImage(destinationName?: string, country?: string, fallbackUrl?: string) {
  return useQuery<ImageResult | null>({
    queryKey: ['pexels-destination', destinationName, country],
    queryFn: async () => {
      if (!destinationName || !country) return null;
      const result = await fetchDestinationImage(destinationName, country);
      if (result) return result;
      if (fallbackUrl) {
        return {
          url: fallbackUrl,
          thumbUrl: fallbackUrl,
          photographer: 'Travel Explorer',
          photographerUrl: 'https://pexels.com',
          alt: `${destinationName}, ${country}`,
          source: 'fallback',
        };
      }
      return null;
    },
    enabled: !!destinationName && !!country,
    staleTime: 24 * 60 * 60 * 1000, // 24 hour cache
    gcTime: 48 * 60 * 60 * 1000,
  });
}

/**
 * Hook to dynamically fetch a place-specific image from Pexels.
 */
export function usePlaceImage(placeName?: string, fallbackUrl?: string) {
  return useQuery<ImageResult | null>({
    queryKey: ['pexels-place', placeName],
    queryFn: async () => {
      if (!placeName) return null;
      const result = await fetchPlaceImage(placeName);
      if (result) return result;
      if (fallbackUrl) {
        return {
          url: fallbackUrl,
          thumbUrl: fallbackUrl,
          photographer: 'Travel Explorer',
          photographerUrl: 'https://pexels.com',
          alt: placeName,
          source: 'fallback',
        };
      }
      return null;
    },
    enabled: !!placeName,
    staleTime: 24 * 60 * 60 * 1000, // 24 hour cache
    gcTime: 48 * 60 * 60 * 1000,
  });
}

/**
 * Hook to fetch multiple images for a destination gallery.
 */
export function usePexelsGallery(query?: string, count = 6) {
  return useQuery<ImageResult[]>({
    queryKey: ['pexels-gallery', query, count],
    queryFn: async () => {
      if (!query) return [];
      return await fetchImages(query, count);
    },
    enabled: !!query,
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 48 * 60 * 60 * 1000,
  });
}
