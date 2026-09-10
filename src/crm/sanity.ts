import { createClient } from '@sanity/client';
import { SanityImageSource, createImageUrlBuilder } from '@sanity/image-url';

export const sanityClient = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
  dataset: import.meta.env.VITE_SANITY_DATASET,
  apiVersion: '2026-01-23',
  useCdn: false,
});

const builder = createImageUrlBuilder(sanityClient);

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

/**
 * Wrapper for Sanity fetch with consistent error handling.
 * Logs errors and throws user-friendly messages.
 */
export async function fetchFromSanity<T>(query: string, params?: Record<string, unknown>, errorContext?: string): Promise<T> {
  try {
    return await sanityClient.fetch<T>(query, params ?? {});
  } catch (error) {
    const context = errorContext || 'data';
    console.error(`Failed to fetch ${context} from Sanity:`, error);
    throw new Error(`Failed to load ${context}. Please try again later.`);
  }
}
