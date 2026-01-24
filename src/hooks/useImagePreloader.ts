import { useState, useEffect } from 'react';

interface UseImagePreloaderOptions {
  /** Array of image URLs */
  images: string[];
  /** Current index for tracking which images to prioritize */
  currentIndex?: number;
  /** Number of adjacent images to preload */
  preloadAdjacent?: number;
}

interface UseImagePreloaderReturn {
  /** Whether current images are still loading */
  isLoading: boolean;
}

/**
 * Hook for preloading images with loading state.
 * Preloads current and adjacent images for smooth transitions.
 */
export function useImagePreloader({ images, currentIndex = 0, preloadAdjacent = 1 }: UseImagePreloaderOptions): UseImagePreloaderReturn {
  const [isLoading, setIsLoading] = useState(true);

  // Preload adjacent images
  useEffect(() => {
    if (images.length === 0) return;

    const imagesToPreload = new Set<string>();

    // Add current and adjacent images
    for (let offset = -preloadAdjacent; offset <= preloadAdjacent; offset++) {
      const index = (currentIndex + offset + images.length) % images.length;
      if (images[index]) {
        imagesToPreload.add(images[index]);
      }
    }

    // Preload images
    imagesToPreload.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [currentIndex, images, preloadAdjacent]);

  // Handle loading state for current image
  useEffect(() => {
    if (images.length === 0) {
      setIsLoading(false);
      return;
    }

    const currentImage = images[currentIndex];
    if (!currentImage) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const img = new Image();
    img.onload = () => setIsLoading(false);
    img.onerror = () => setIsLoading(false);
    img.src = currentImage;
  }, [currentIndex, images]);

  return { isLoading };
}
