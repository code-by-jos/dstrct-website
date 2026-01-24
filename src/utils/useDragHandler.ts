import { useRef, useState, useCallback, useMemo } from 'react';

interface DragHandlers {
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
  onMouseLeave: () => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
}

interface UseDragHandlerReturn {
  isDragging: boolean;
  wasDragged: boolean;
  handleDragStart: (clientX: number) => void;
  handleDragMove: (clientX: number) => number | undefined;
  handleDragEnd: () => number | undefined;
  /** Get all drag event props to spread onto an element */
  getDragProps: (options?: { onDragEnd?: (offset: number) => void }) => DragHandlers;
}

/**
 * Hook for handling drag interactions on carousels and slideshows.
 * Returns individual handlers and a getDragProps() function for convenience.
 */
export function useDragHandler(): UseDragHandlerReturn {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef(0);
  const dragOffsetRef = useRef(0);
  const wasDraggedRef = useRef(false);

  const handleDragStart = useCallback((clientX: number) => {
    setIsDragging(true);
    dragStartRef.current = clientX;
    dragOffsetRef.current = 0;
    wasDraggedRef.current = false;
    document.body.classList.add('cursor-grabbing', 'select-none');
  }, []);

  const handleDragMove = useCallback(
    (clientX: number) => {
      if (!isDragging) return;

      const distance = clientX - dragStartRef.current;
      const totalDistance = Math.abs(distance);
      dragOffsetRef.current = distance;

      // Mark as dragged if moved more than 5px
      if (totalDistance > 5) {
        wasDraggedRef.current = true;
      }

      return dragOffsetRef.current;
    },
    [isDragging]
  );

  const handleDragEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    document.body.classList.remove('cursor-grabbing', 'select-none');

    const finalOffset = dragOffsetRef.current;
    dragOffsetRef.current = 0;

    // Reset drag flag after a short delay
    setTimeout(() => {
      wasDraggedRef.current = false;
    }, 100);

    return finalOffset;
  }, [isDragging]);

  const getDragProps = useCallback(
    (options?: { onDragEnd?: (offset: number) => void }): DragHandlers => {
      const onDragEndWithCallback = () => {
        const offset = handleDragEnd();
        if (offset !== undefined && options?.onDragEnd) {
          options.onDragEnd(offset);
        }
      };

      return {
        onMouseDown: (e: React.MouseEvent) => {
          e.preventDefault();
          handleDragStart(e.clientX);
        },
        onMouseMove: (e: React.MouseEvent) => handleDragMove(e.clientX),
        onMouseUp: onDragEndWithCallback,
        onMouseLeave: () => {
          if (isDragging) onDragEndWithCallback();
        },
        onTouchStart: (e: React.TouchEvent) => handleDragStart(e.touches[0].clientX),
        onTouchMove: (e: React.TouchEvent) => handleDragMove(e.touches[0].clientX),
        onTouchEnd: onDragEndWithCallback,
      };
    },
    [handleDragStart, handleDragMove, handleDragEnd, isDragging]
  );

  return useMemo(
    () => ({
      isDragging,
      wasDragged: wasDraggedRef.current,
      handleDragStart,
      handleDragMove,
      handleDragEnd,
      getDragProps,
    }),
    [isDragging, handleDragStart, handleDragMove, handleDragEnd, getDragProps]
  );
}
