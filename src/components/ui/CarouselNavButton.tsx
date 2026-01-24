import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

type NavDirection = 'prev' | 'next';

interface CarouselNavButtonProps {
  direction: NavDirection;
  onPress: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Inline styles for positioning */
  style?: React.CSSProperties;
  /** Size variant */
  size?: 'sm' | 'md';
}

/**
 * Navigation button for carousels and slideshows.
 * Renders a prev/next button with chevron icon.
 */
export function CarouselNavButton({ direction, onPress, className = '', style, size = 'md' }: CarouselNavButtonProps) {
  const Icon = direction === 'prev' ? ChevronLeft : ChevronRight;
  const label = direction === 'prev' ? 'Previous slide' : 'Next slide';

  const sizeClasses = {
    sm: 'p-2 md:p-3',
    md: 'p-3',
  };

  const iconSizeClasses = {
    sm: 'w-5 h-5 md:w-6 md:h-6',
    md: 'w-6 h-6',
  };

  return (
    <Button
      variant='icon'
      onPress={onPress}
      className={`bg-white/90 hover:bg-white rounded-full shadow-lg z-10 cursor-pointer transition-all ${sizeClasses[size]} ${className}`.trim()}
      style={style}
      aria-label={label}
    >
      <Icon className={`${iconSizeClasses[size]} text-black`} />
    </Button>
  );
}
