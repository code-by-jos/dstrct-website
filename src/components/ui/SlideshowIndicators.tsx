interface SlideshowIndicatorsProps {
  /** Total number of slides */
  totalSlides: number;
  /** Current active slide index */
  currentIndex: number;
  /** Callback when a slide indicator is clicked */
  onSelect: (index: number) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Dot indicators for slideshows.
 * Shows clickable dots representing each slide.
 */
export function SlideshowIndicators({ totalSlides, currentIndex, onSelect, className = '' }: SlideshowIndicatorsProps) {
  if (totalSlides <= 1) return null;

  return (
    <div className={`flex justify-center gap-2 py-4 ${className}`.trim()}>
      {Array.from({ length: totalSlides }).map((_, index) => (
        <button
          key={index}
          type='button'
          onClick={() => onSelect(index)}
          className={`w-2 h-2 rounded-full transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2 ${index === currentIndex ? 'bg-black w-8' : 'bg-gray-300 hover:bg-gray-400'}`}
          aria-label={`Go to slide ${index + 1}`}
          aria-current={index === currentIndex ? 'true' : undefined}
        />
      ))}
    </div>
  );
}
