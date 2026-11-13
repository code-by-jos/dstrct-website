import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PhotoSlideshow } from '@/components/ui/PhotoSlideshow';

const photos = Array.from({ length: 6 }, (_, index) => `/photo-${index + 1}.jpg`);
const displayedPhotos = () => screen.getAllByRole('img').map((image) => image.getAttribute('src'));

function swipe(area: HTMLElement, from: { x: number; y: number }, to: { x: number; y: number }) {
  fireEvent.touchStart(area, { touches: [{ clientX: from.x, clientY: from.y }] });
  fireEvent.touchMove(area, { touches: [{ clientX: to.x, clientY: to.y }] });
  fireEvent.touchEnd(area, { changedTouches: [{ clientX: to.x, clientY: to.y }] });
}

afterEach(() => vi.unstubAllGlobals());

describe.each(['page', 'dialog'] as const)('%s photo slideshow', (layout) => {
  it('shows the opening photo, then pairs, centers a final single photo, and wraps', async () => {
    vi.stubGlobal('innerWidth', 1440);
    const user = userEvent.setup();
    render(<PhotoSlideshow photos={photos} layout={layout} />);
    expect(displayedPhotos()).toEqual([photos[0]]);
    expect(screen.getAllByRole('button', { name: /Go to slide/ })).toHaveLength(4);
    await user.click(screen.getByRole('button', { name: 'Next slide' }));
    expect(displayedPhotos()).toEqual(photos.slice(1, 3));
    await user.click(screen.getByRole('button', { name: 'Next slide' }));
    expect(displayedPhotos()).toEqual(photos.slice(3, 5));
    await user.click(screen.getByRole('button', { name: 'Next slide' }));
    expect(displayedPhotos()).toEqual([photos[5]]);
    await user.click(screen.getByRole('button', { name: 'Next slide' }));
    expect(displayedPhotos()).toEqual([photos[0]]);
    await user.click(screen.getByRole('button', { name: 'Previous slide' }));
    expect(displayedPhotos()).toEqual([photos[5]]);
    await user.click(screen.getByRole('button', { name: 'Go to slide 2' }));
    expect(displayedPhotos()).toEqual(photos.slice(1, 3));
  });

  it('supports swipes and mouse drags, ignores vertical scrolling, and cancels interrupted gestures', () => {
    vi.stubGlobal('innerWidth', 1440);
    const { unmount } = render(<PhotoSlideshow photos={photos} layout={layout} />);
    const area = screen.getByRole('img').parentElement!.parentElement!;
    swipe(area, { x: 200, y: 100 }, { x: 100, y: 105 });
    expect(displayedPhotos()).toEqual(photos.slice(1, 3));
    swipe(area, { x: 200, y: 100 }, { x: 100, y: 300 });
    expect(displayedPhotos()).toEqual(photos.slice(1, 3));
    swipe(area, { x: 100, y: 100 }, { x: 200, y: 105 });
    expect(displayedPhotos()).toEqual([photos[0]]);
    fireEvent.touchStart(area, { touches: [{ clientX: 200, clientY: 100 }] });
    fireEvent.touchMove(area, { touches: [{ clientX: 100, clientY: 105 }] });
    fireEvent.touchCancel(area);
    fireEvent.touchEnd(area, { changedTouches: [{ clientX: 100, clientY: 105 }] });
    expect(displayedPhotos()).toEqual([photos[0]]);
    fireEvent.mouseDown(area, { button: 0, clientX: 200 });
    fireEvent.mouseMove(area, { clientX: 100 });
    fireEvent.mouseUp(area);
    expect(displayedPhotos()).toEqual(photos.slice(1, 3));
    fireEvent.mouseDown(area, { button: 0, clientX: 200 });
    unmount();
    expect(document.body.classList.contains('cursor-grabbing')).toBe(false);
  });

  it('uses one photo per slide on mobile and resets safely when resized to desktop', async () => {
    vi.stubGlobal('innerWidth', 390);
    render(<PhotoSlideshow photos={photos} layout={layout} />);
    await waitFor(() => expect(screen.getAllByRole('button', { name: /Go to slide/ })).toHaveLength(6));
    const area = screen.getByRole('img').parentElement!.parentElement!;
    swipe(area, { x: 200, y: 100 }, { x: 100, y: 105 });
    expect(displayedPhotos()).toEqual([photos[1]]);
    await userEvent.click(screen.getByRole('button', { name: 'Go to slide 6' }));
    expect(displayedPhotos()).toEqual([photos[5]]);
    vi.stubGlobal('innerWidth', 1440);
    fireEvent.resize(window);
    await waitFor(() => expect(screen.getAllByRole('button', { name: /Go to slide/ })).toHaveLength(4));
    expect(displayedPhotos()).toEqual([photos[0]]);
  });
});
