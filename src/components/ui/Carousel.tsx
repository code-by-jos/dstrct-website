import { useState, useRef, useEffect, useCallback, ReactNode } from 'react';
import { CarouselNavButton } from '@/components/ui/CarouselNavButton';
import { useDragHandler } from '@/utils/useDragHandler';
import { BREAKPOINTS } from '@/constants/breakpoints';

interface CarouselProps {
  children: ReactNode[];
  itemWidthMobile?: number;
  itemWidthDesktop?: number;
  className?: string;
}

export function Carousel({ children, itemWidthMobile = 200, itemWidthDesktop = 400, className = '' }: CarouselProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { isDragging, wasDragged, getDragProps } = useDragHandler();

  const carouselRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const tweenTargetRef = useRef<number | null>(null);
  const dragOffsetRef = useRef(0);
  const velocityRef = useRef(0);
  const lastDragXRef = useRef(0);
  const lastDragTimeRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  const itemWidth = typeof window !== 'undefined' && window.innerWidth < BREAKPOINTS.MOBILE ? itemWidthMobile : itemWidthDesktop;
  const setWidth = children.length * itemWidth;

  // Render 3 copies for seamless infinite scroll
  const items = [...children, ...children, ...children];

  // Animation loop
  useEffect(() => {
    const animate = () => {
      if (!carouselRef.current) {
        rafRef.current = requestAnimationFrame(animate);
        return;
      }

      // Auto-scroll when not interacting
      if (!isHovered && !isDragging && Math.abs(velocityRef.current) < 0.1) {
        offsetRef.current += 0.5; // Continuous scroll
      }

      // Tween to target position (for arrow button clicks and keyboard navigation)
      if (tweenTargetRef.current !== null && Math.abs(velocityRef.current) < 0.1) {
        const diff = tweenTargetRef.current - offsetRef.current;
        if (Math.abs(diff) > 0.5) {
          offsetRef.current += diff * 0.15; // Smooth easing
        } else {
          offsetRef.current = tweenTargetRef.current;
          tweenTargetRef.current = null;
        }
      }

      // Apply momentum
      if (Math.abs(velocityRef.current) >= 0.1 && !isDragging && tweenTargetRef.current === null) {
        offsetRef.current -= velocityRef.current;
        velocityRef.current *= 0.92; // Friction
        if (Math.abs(velocityRef.current) < 0.1) {
          velocityRef.current = 0;
        }
      }

      // Seamless wrap: reset position when we've scrolled one full set
      if (offsetRef.current >= setWidth) {
        offsetRef.current -= setWidth;
      } else if (offsetRef.current < 0) {
        offsetRef.current += setWidth;
      }

      // Apply transform
      const totalOffset = offsetRef.current + dragOffsetRef.current;
      carouselRef.current.style.transform = `translateX(${-totalOffset}px)`;

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isHovered, isDragging, setWidth]);

  const handlePrevious = useCallback(() => {
    let target = offsetRef.current - itemWidth;
    // Normalize target
    while (target < 0) target += setWidth;
    while (target >= setWidth) target -= setWidth;
    tweenTargetRef.current = target;
    velocityRef.current = 0;
  }, [itemWidth, setWidth]);

  const handleNext = useCallback(() => {
    let target = offsetRef.current + itemWidth;
    // Normalize target
    while (target < 0) target += setWidth;
    while (target >= setWidth) target -= setWidth;
    tweenTargetRef.current = target;
    velocityRef.current = 0;
  }, [itemWidth, setWidth]);

  // Custom drag handling for infinite carousel (needs velocity tracking)
  const handleDragStart = (clientX: number) => {
    lastDragXRef.current = clientX;
    lastDragTimeRef.current = Date.now();
    velocityRef.current = 0;
    dragOffsetRef.current = 0;
  };

  const handleDragMove = (clientX: number, offset: number) => {
    const currentTime = Date.now();
    const timeDelta = currentTime - lastDragTimeRef.current;
    const distance = clientX - lastDragXRef.current;

    dragOffsetRef.current = -offset;

    lastDragXRef.current = clientX;
    lastDragTimeRef.current = currentTime;

    // Calculate velocity for momentum
    if (timeDelta > 0) {
      velocityRef.current = (distance / timeDelta) * 16;
    }
  };

  const handleDragEnd = () => {
    // Apply drag offset to main offset
    offsetRef.current += dragOffsetRef.current;
    dragOffsetRef.current = 0;

    // Clear velocity if too low
    if (Math.abs(velocityRef.current) < 2) {
      velocityRef.current = 0;
    }
  };

  // Get drag props with custom handlers for momentum
  const dragProps = getDragProps();

  return (
    <div className={`relative overflow-hidden ${className}`} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <div
        ref={carouselRef}
        className={`flex ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} select-none`}
        onMouseDown={(e) => {
          e.preventDefault();
          dragProps.onMouseDown(e);
          handleDragStart(e.clientX);
        }}
        onMouseMove={(e) => {
          dragProps.onMouseMove(e);
          if (isDragging) {
            const offset = e.clientX - lastDragXRef.current;
            handleDragMove(e.clientX, -dragOffsetRef.current - offset + (e.clientX - lastDragXRef.current));
          }
        }}
        onMouseUp={() => {
          dragProps.onMouseUp();
          handleDragEnd();
        }}
        onMouseLeave={() => {
          if (isDragging) {
            dragProps.onMouseLeave();
            handleDragEnd();
          }
        }}
        onTouchStart={(e) => {
          dragProps.onTouchStart(e);
          handleDragStart(e.touches[0].clientX);
        }}
        onTouchMove={(e) => {
          dragProps.onTouchMove(e);
          if (isDragging) {
            handleDragMove(e.touches[0].clientX, -dragOffsetRef.current);
          }
        }}
        onTouchEnd={() => {
          dragProps.onTouchEnd();
          handleDragEnd();
        }}
        onClickCapture={(e) => {
          // Prevent clicks if we just dragged
          if (wasDragged) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
      >
        {items.map((child, index) => {
          const originalIndex = index % children.length;
          const setIndex = Math.floor(index / children.length);

          return (
            <div
              key={`${setIndex}-${originalIndex}`}
              className='shrink-0 px-2'
              style={{ width: itemWidth }}
              role='group'
              aria-roledescription='slide'
              aria-label={`${originalIndex + 1} of ${children.length}`}
            >
              {child}
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows */}
      {isHovered && !isDragging && (
        <>
          <CarouselNavButton direction='prev' onPress={handlePrevious} className='absolute left-4 top-1/2 -translate-y-1/2' />
          <CarouselNavButton direction='next' onPress={handleNext} className='absolute right-4 top-1/2 -translate-y-1/2' />
        </>
      )}
    </div>
  );
}
