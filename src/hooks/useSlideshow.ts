import { useState, useEffect, useCallback } from 'react';
import { BREAKPOINTS } from '@/constants/breakpoints';

interface UseSlideshowOptions {
  /** Total number of items */
  itemCount: number;
  /** Initial items per slide (will be adjusted on mobile) */
  initialItemsPerSlide?: number;
  /** Number of items on the first slide (defaults to itemsPerSlide) */
  firstSlideItemCount?: number;
}

interface UseSlideshowReturn {
  /** Current slide index */
  currentIndex: number;
  /** Set current slide index */
  setCurrentIndex: (index: number) => void;
  /** Number of items per slide (responsive) */
  itemsPerSlide: number;
  /** Total number of slides */
  totalSlides: number;
  /** Whether component has hydrated */
  isHydrated: boolean;
  /** Whether slide is transitioning */
  isTransitioning: boolean;
  /** Go to previous slide */
  goToPrevious: () => void;
  /** Go to next slide */
  goToNext: () => void;
  /** Handle drag end with threshold detection */
  handleDragEnd: (offset: number, threshold?: number) => void;
}

/**
 * Hook for managing slideshow state and navigation.
 * Handles responsive items per slide, transitions, and drag navigation.
 */
export function useSlideshow({ itemCount, initialItemsPerSlide = 2, firstSlideItemCount }: UseSlideshowOptions): UseSlideshowReturn {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [itemsPerSlide, setItemsPerSlide] = useState(initialItemsPerSlide);
  const [isHydrated, setIsHydrated] = useState(false);

  // Handle hydration and responsive items per slide
  useEffect(() => {
    setIsHydrated(true);

    const handleResize = () => {
      const newItemsPerSlide = window.innerWidth < BREAKPOINTS.MOBILE ? 1 : 2;
      if (newItemsPerSlide !== itemsPerSlide) {
        setItemsPerSlide(newItemsPerSlide);
        setCurrentIndex(0); // Reset on layout change
      }
    };

    // Wait a tick for hydration
    setTimeout(handleResize, 0);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [itemsPerSlide]);

  const effectiveFirstSlideCount = firstSlideItemCount != null ? Math.min(firstSlideItemCount, itemsPerSlide) : itemsPerSlide;
  const totalSlides =
    itemCount <= 0 ? 0 : itemCount <= effectiveFirstSlideCount ? 1 : 1 + Math.ceil((itemCount - effectiveFirstSlideCount) / itemsPerSlide);

  const goToPrevious = useCallback(() => {
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
    setTimeout(() => setIsTransitioning(false), 400);
  }, [totalSlides]);

  const goToNext = useCallback(() => {
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
    setTimeout(() => setIsTransitioning(false), 400);
  }, [totalSlides]);

  const handleDragEnd = useCallback(
    (offset: number, threshold = 50) => {
      if (offset > threshold) {
        goToPrevious();
      } else if (offset < -threshold) {
        goToNext();
      }
    },
    [goToPrevious, goToNext]
  );

  return {
    currentIndex,
    setCurrentIndex,
    itemsPerSlide,
    totalSlides,
    isHydrated,
    isTransitioning,
    goToPrevious,
    goToNext,
    handleDragEnd,
  };
}
