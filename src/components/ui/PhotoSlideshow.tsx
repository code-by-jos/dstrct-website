import { useEffect, useImperativeHandle, type Ref } from 'react';
import { CarouselNavButton } from '@/components/ui/CarouselNavButton';
import { SlideshowIndicators } from '@/components/ui/SlideshowIndicators';
import { useDragHandler } from '@/utils/useDragHandler';
import { useSlideshow } from '@/hooks/useSlideshow';
import { useImagePreloader } from '@/hooks/useImagePreloader';

export interface PhotoSlideshowHandle {
  goToPrevious: () => void;
  goToNext: () => void;
}

interface PhotoSlideshowProps {
  ref?: Ref<PhotoSlideshowHandle>;
  photoAlts?: string[];
  /** Dialogs keep their controls inside the image area. */
  layout?: 'page' | 'dialog';
  photos: string[];
  className?: string;
  initialPhotosPerSlide?: number;
}

export function PhotoSlideshow({ ref, photos, photoAlts, className = '', initialPhotosPerSlide = 2, layout = 'page' }: PhotoSlideshowProps) {
  const firstSlideItemCount = 1;

  const { currentIndex, setCurrentIndex, itemsPerSlide, totalSlides, isHydrated, isTransitioning, goToPrevious, goToNext, handleDragEnd } =
    useSlideshow({
      itemCount: photos.length,
      initialItemsPerSlide: initialPhotosPerSlide,
      firstSlideItemCount,
    });

  useImperativeHandle(ref, () => ({ goToPrevious, goToNext }), [goToPrevious, goToNext]);

  const { isDragging, getDragProps } = useDragHandler();

  // Calculate current photos for preloading
  const effectiveFirstSlideCount = Math.min(firstSlideItemCount, itemsPerSlide);

  const getStartIndex = (slideIndex: number) => {
    if (slideIndex === 0) return 0;
    return effectiveFirstSlideCount + (slideIndex - 1) * itemsPerSlide;
  };

  const getCountForSlide = (slideIndex: number) => {
    return slideIndex === 0 ? effectiveFirstSlideCount : itemsPerSlide;
  };

  const currentPhotoIndices: number[] = [];
  const preloadStart = getStartIndex(currentIndex);
  const preloadCount = getCountForSlide(currentIndex);
  for (let i = 0; i < preloadCount; i++) {
    const photoIndex = preloadStart + i;
    if (photoIndex < photos.length) {
      currentPhotoIndices.push(photoIndex);
    }
  }

  const { isLoading } = useImagePreloader({
    images: photos,
    currentIndex: getStartIndex(currentIndex),
    preloadAdjacent: itemsPerSlide,
  });

  // Preload adjacent slides
  useEffect(() => {
    const imagesToPreload: string[] = [];
    const effectiveFirst = Math.min(firstSlideItemCount, itemsPerSlide);

    const getStart = (slideIndex: number) => {
      if (slideIndex === 0) return 0;
      return effectiveFirst + (slideIndex - 1) * itemsPerSlide;
    };

    const getCount = (slideIndex: number) => {
      return slideIndex === 0 ? effectiveFirst : itemsPerSlide;
    };

    // Next slide images
    const nextIndex = (currentIndex + 1) % totalSlides;
    const nextStart = getStart(nextIndex);
    const nextCount = getCount(nextIndex);
    for (let i = 0; i < nextCount; i++) {
      const photoIndex = nextStart + i;
      if (photoIndex < photos.length) {
        imagesToPreload.push(photos[photoIndex]);
      }
    }

    // Previous slide images
    const prevIndex = (currentIndex - 1 + totalSlides) % totalSlides;
    const prevStart = getStart(prevIndex);
    const prevCount = getCount(prevIndex);
    for (let i = 0; i < prevCount; i++) {
      const photoIndex = prevStart + i;
      if (photoIndex < photos.length) {
        imagesToPreload.push(photos[photoIndex]);
      }
    }

    // Preload images
    imagesToPreload.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [currentIndex, photos, itemsPerSlide, totalSlides, firstSlideItemCount]);

  if (photos.length === 0) {
    return null;
  }

  // Always prepare 2 photos for initial render to match SSR
  const renderPhotosPerSlide = isHydrated ? itemsPerSlide : 2;
  const renderFirstSlideCount = Math.min(firstSlideItemCount, renderPhotosPerSlide);
  const renderTotalSlides =
    photos.length <= 0
      ? 0
      : photos.length <= renderFirstSlideCount
        ? 1
        : 1 + Math.ceil((photos.length - renderFirstSlideCount) / renderPhotosPerSlide);

  const renderGetStartIndex = (slideIndex: number) => {
    if (slideIndex === 0) return 0;
    return renderFirstSlideCount + (slideIndex - 1) * renderPhotosPerSlide;
  };

  const renderGetCountForSlide = (slideIndex: number) => {
    return slideIndex === 0 ? renderFirstSlideCount : renderPhotosPerSlide;
  };

  const startIdx = renderGetStartIndex(currentIndex);
  const countForSlide = renderGetCountForSlide(currentIndex);
  const currentPhotos: string[] = [];
  for (let i = 0; i < countForSlide; i++) {
    const photoIndex = startIdx + i;
    if (photoIndex < photos.length) {
      currentPhotos.push(photos[photoIndex]);
    }
  }

  const dragProps = getDragProps({
    onDragEnd: (offset) => handleDragEnd(offset),
  });

  return (
    <div className={`relative flex flex-col ${className}`} suppressHydrationWarning>
      {/* Photo display area - fixed height container */}
      <div
        className={`relative flex items-center justify-center gap-1 md:gap-2 px-2 md:px-4 ${layout === 'dialog' ? 'h-[55dvh] min-h-64 bg-gray-50 lg:h-[min(72dvh,850px)]' : ''} ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} select-none`}
        style={{ ...(layout === 'page' ? { height: 'calc(100vh - 320px)', minHeight: '400px' } : {}), touchAction: 'pan-y pinch-zoom' }}
        suppressHydrationWarning
        {...dragProps}
      >
        {currentPhotos.map((photo, index) => (
          <div
            key={`${currentIndex}-${index}`}
            className={`relative h-full flex items-center justify-center ${isTransitioning ? 'animate-fade-in' : ''} ${
              index === 1 ? 'hidden md:flex' : ''
            }`}
            style={{ flex: '0 1 auto', minWidth: 0 }}
            suppressHydrationWarning
          >
            {/* Skeleton placeholder */}
            {isLoading && <div className='absolute inset-0 bg-gray-200 animate-pulse rounded-lg' />}

            <img
              src={photo}
              alt={photoAlts?.[startIdx + index] ?? `Photo ${startIdx + index + 1}`}
              className={`max-w-full max-h-full object-contain rounded-lg transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
              loading='eager'
              draggable={false}
            />
          </div>
        ))}
        {renderTotalSlides > 1 && (
          <>
            <CarouselNavButton
              direction='prev'
              onPress={goToPrevious}
              size='sm'
              className={`absolute top-1/2 -translate-y-1/2 ${layout === 'dialog' ? 'left-3 focus-visible:bg-stone-200 focus-visible:ring-0 focus-visible:ring-offset-0' : ''}`}
              style={layout === 'page' ? { left: 'calc((100vw - 100%) / -2 + 1rem)' } : undefined}
            />
            <CarouselNavButton
              direction='next'
              onPress={goToNext}
              size='sm'
              className={`absolute top-1/2 -translate-y-1/2 ${layout === 'dialog' ? 'right-3 focus-visible:bg-stone-200 focus-visible:ring-0 focus-visible:ring-offset-0' : ''}`}
              style={layout === 'page' ? { right: 'calc((100vw - 100%) / -2 + 1rem)' } : undefined}
            />
          </>
        )}
      </div>

      {/* Slide indicators */}
      <SlideshowIndicators totalSlides={renderTotalSlides} currentIndex={currentIndex} onSelect={setCurrentIndex} />
      <p role='status' aria-live='polite' aria-atomic='true' className='sr-only'>
        Slide {currentIndex + 1} / {renderTotalSlides}
      </p>
    </div>
  );
}
