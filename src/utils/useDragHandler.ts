import { useRef, useState, useCallback, useMemo, useEffect } from 'react';

interface DragHandlers {
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
  onMouseLeave: () => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: (e?: React.TouchEvent) => void;
  onTouchCancel: () => void;
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
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!isDragging) return;
    document.body.classList.add('cursor-grabbing', 'select-none');
    return () => document.body.classList.remove('cursor-grabbing', 'select-none');
  }, [isDragging]);

  const handleDragStart = useCallback((clientX: number) => {
    setIsDragging(true);
    dragStartRef.current = clientX;
    dragOffsetRef.current = 0;
    wasDraggedRef.current = false;
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
    [isDragging],
  );

  const handleDragEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

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
          if (e.button !== 0 || (e.target as HTMLElement).closest('button')) return;
          e.preventDefault();
          handleDragStart(e.clientX);
        },
        onMouseMove: (e: React.MouseEvent) => handleDragMove(e.clientX),
        onMouseUp: onDragEndWithCallback,
        onMouseLeave: () => {
          if (isDragging) onDragEndWithCallback();
        },
        onTouchStart: (e: React.TouchEvent) => {
          touchStartRef.current = null;
          if (e.touches.length !== 1 || (e.target as HTMLElement).closest('button')) {
            handleDragEnd();
            return;
          }
          const touch = e.touches[0];
          touchStartRef.current = { x: touch.clientX, y: touch.clientY };
          handleDragStart(touch.clientX);
        },
        onTouchMove: (e: React.TouchEvent) => {
          const start = touchStartRef.current;
          if (!start) return;
          if (e.touches.length !== 1) {
            touchStartRef.current = null;
            handleDragEnd();
            return;
          }
          const touch = e.touches[0];
          const horizontal = Math.abs(touch.clientX - start.x) > Math.abs(touch.clientY - start.y) * 1.5;
          handleDragMove(horizontal ? touch.clientX : start.x);
        },
        onTouchEnd: (e?: React.TouchEvent) => {
          const start = touchStartRef.current;
          touchStartRef.current = null;
          if (e && start) {
            const touch = e.changedTouches[0];
            if (!touch || Math.abs(touch.clientX - start.x) <= Math.abs(touch.clientY - start.y) * 1.5) {
              handleDragEnd();
              return;
            }
            // Use the final touch position even if the browser skipped a move event.
            handleDragMove(touch.clientX);
          }
          onDragEndWithCallback();
        },
        onTouchCancel: () => {
          touchStartRef.current = null;
          handleDragEnd();
        },
      };
    },
    [handleDragStart, handleDragMove, handleDragEnd, isDragging],
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
    [isDragging, handleDragStart, handleDragMove, handleDragEnd, getDragProps],
  );
}
