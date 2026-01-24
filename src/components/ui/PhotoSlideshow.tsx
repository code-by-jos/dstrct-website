import { useEffect } from 'react';
import { CarouselNavButton } from '@/components/ui/CarouselNavButton';
import { SlideshowIndicators } from '@/components/ui/SlideshowIndicators';
import { useDragHandler } from '@/utils/useDragHandler';
import { useSlideshow } from '@/hooks/useSlideshow';
import { useImagePreloader } from '@/hooks/useImagePreloader';

interface PhotoSlideshowProps {
  photos: string[];
  className?: string;
  initialPhotosPerSlide?: number;
}

export function PhotoSlideshow({ photos, className = '', initialPhotosPerSlide = 2 }: PhotoSlideshowProps) {
  const { currentIndex, setCurrentIndex, itemsPerSlide, totalSlides, isHydrated, isTransitioning, goToPrevious, goToNext, handleDragEnd } =
    useSlideshow({
      itemCount: photos.length,
      initialItemsPerSlide: initialPhotosPerSlide,
    });

  const { isDragging, getDragProps } = useDragHandler();

  // Calculate current photos for preloading
  const currentPhotoIndices: number[] = [];
  for (let i = 0; i < itemsPerSlide; i++) {
    const photoIndex = currentIndex * itemsPerSlide + i;
    if (photoIndex < photos.length) {
      currentPhotoIndices.push(photoIndex);
    }
  }

  const { isLoading } = useImagePreloader({
    images: photos,
    currentIndex: currentIndex * itemsPerSlide,
    preloadAdjacent: itemsPerSlide,
  });

  // Preload adjacent slides
  useEffect(() => {
    const imagesToPreload: string[] = [];

    // Next slide images
    const nextIndex = (currentIndex + 1) % totalSlides;
    for (let i = 0; i < itemsPerSlide; i++) {
      const photoIndex = nextIndex * itemsPerSlide + i;
      if (photoIndex < photos.length) {
        imagesToPreload.push(photos[photoIndex]);
      }
    }

    // Previous slide images
    const prevIndex = (currentIndex - 1 + totalSlides) % totalSlides;
    for (let i = 0; i < itemsPerSlide; i++) {
      const photoIndex = prevIndex * itemsPerSlide + i;
      if (photoIndex < photos.length) {
        imagesToPreload.push(photos[photoIndex]);
      }
    }

    // Preload images
    imagesToPreload.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [currentIndex, photos, itemsPerSlide, totalSlides]);

  if (photos.length === 0) {
    return null;
  }

  // Always prepare 2 photos for initial render to match SSR
  const renderPhotosPerSlide = isHydrated ? itemsPerSlide : 2;
  const renderTotalSlides = Math.ceil(photos.length / renderPhotosPerSlide);

  const currentPhotos: string[] = [];
  for (let i = 0; i < renderPhotosPerSlide; i++) {
    const photoIndex = currentIndex * renderPhotosPerSlide + i;
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
        className={`relative flex items-center justify-center gap-2 md:gap-4 px-2 md:px-4 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} select-none`}
        style={{ height: 'calc(100vh - 320px)', minHeight: '400px' }}
        suppressHydrationWarning
        {...dragProps}
      >
        {currentPhotos.map((photo, index) => (
          <div
            key={`${currentIndex}-${index}`}
            className={`relative h-full flex items-center justify-center ${isTransitioning ? 'animate-fade-in' : ''} ${
              index === 1 ? 'hidden md:flex' : ''
            }`}
            style={{ flex: '1 1 0', minWidth: 0 }}
            suppressHydrationWarning
          >
            {/* Skeleton placeholder */}
            {isLoading && <div className='absolute inset-0 bg-gray-200 animate-pulse rounded-lg' />}

            <img
              src={photo}
              alt={`Photo ${currentIndex * itemsPerSlide + index + 1}`}
              className={`max-w-full h-full object-contain rounded-lg transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
              loading='eager'
              draggable={false}
            />
          </div>
        ))}
      </div>

      {/* Navigation arrows - at screen edges horizontally, centered on photo area vertically */}
      {renderTotalSlides > 1 && (
        <>
          <CarouselNavButton
            direction='prev'
            onPress={goToPrevious}
            size='sm'
            className='absolute top-1/2 -translate-y-1/2'
            style={{ left: 'calc((100vw - 100%) / -2 + 1rem)' }}
          />
          <CarouselNavButton
            direction='next'
            onPress={goToNext}
            size='sm'
            className='absolute top-1/2 -translate-y-1/2'
            style={{ right: 'calc((100vw - 100%) / -2 + 1rem)' }}
          />
        </>
      )}

      {/* Slide indicators */}
      <SlideshowIndicators totalSlides={renderTotalSlides} currentIndex={currentIndex} onSelect={setCurrentIndex} />
    </div>
  );
}
