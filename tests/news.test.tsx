import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryHistory, createRootRoute, createRoute, createRouter, Outlet, RouterProvider } from '@tanstack/react-router';
import { Route as newsRoute } from '@/routes/news';
import { Route as postRoute } from '@/routes/news/$slug';
import { Route as runwayRoute } from '@/routes/runway';
import { Route as runwayPostRoute } from '@/routes/runway/$slug';
import { fetchNewsFn, fetchNewsPostFn, fetchRunwayPostFn } from '@/server/fetchContent';
import type { NewsPage, NewsPost } from '@/types/News';

vi.mock('@/server/fetchContent', () => ({ fetchNewsFn: vi.fn(), fetchNewsPostFn: vi.fn(), fetchRunwayPostFn: vi.fn() }));

const runwayPost: NewsPost = {
  id: 'runway-1',
  slug: 'paris-runway',
  title: 'Paris runway',
  category: 'runway',
  publishedAt: '2026-01-20T12:00:00Z',
  excerpt: 'The latest from Paris.',
  coverImage: { src: '/runway.jpg', alt: 'Model on the Paris runway' },
  body: 'Photography by **DSTRCT**.',
  photos: [
    { src: '/runway.jpg', alt: 'Model on the Paris runway' },
    { src: '/backstage.jpg', alt: 'Backstage in Paris' },
  ],
};

const generalPosts: NewsPost[] = Array.from({ length: 8 }, (_, index) => ({
  ...runwayPost,
  id: `general-${index}`,
  slug: `editorial-${index}`,
  title: `Editorial ${index}`,
  category: 'general',
  photos: [runwayPost.photos[0]],
}));

async function openNews(path = '/news') {
  const root = createRootRoute({ component: Outlet });
  const news = createRoute({ ...newsRoute.options, path: '/news', getParentRoute: () => root });
  const post = createRoute({ ...postRoute.options, path: '/$slug', getParentRoute: () => news });
  const runway = createRoute({ ...runwayRoute.options, path: '/runway', getParentRoute: () => root });
  const runwayPost = createRoute({ ...runwayPostRoute.options, path: '/$slug', getParentRoute: () => runway });
  const router = createRouter({
    routeTree: root.addChildren([news.addChildren([post]), runway.addChildren([runwayPost])]),
    history: createMemoryHistory({ initialEntries: [path] }),
    defaultPendingMinMs: 0,
  });
  await router.load();
  render(<RouterProvider router={router} />);
  return router;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(fetchNewsFn).mockImplementation(async ({ data }) => ({
    posts: data.category === 'runway' ? [runwayPost] : generalPosts,
    nextCursor: null,
  }));
  vi.mocked(fetchNewsPostFn).mockImplementation(async ({ data }) => {
    return [runwayPost, ...generalPosts].find((post) => post.slug === data) || null;
  });
  vi.mocked(fetchRunwayPostFn).mockImplementation(async ({ data }) => (data === runwayPost.slug ? runwayPost : null));
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function installIntersectionObserver() {
  const active = new Set<IntersectionObserverCallback>();
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(private callback: IntersectionObserverCallback) {}
      observe() {
        active.add(this.callback);
      }
      disconnect() {
        active.delete(this.callback);
      }
      unobserve() {}
    },
  );
  return () =>
    act(() => {
      for (const callback of [...active]) callback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
    });
}

describe('news listing and URL-driven gallery', () => {
  it('loads bounded category previews and shows runway before recent news', async () => {
    await openNews();
    const sections = screen.getAllByRole('region');
    expect(sections[0].getAttribute('aria-labelledby')).toBe('runway-news-title');
    expect(sections[1].getAttribute('aria-labelledby')).toBe('recent-news-title');
    expect(fetchNewsFn).toHaveBeenCalledWith({ data: { category: 'runway', limit: 6 } });
    expect(fetchNewsFn).toHaveBeenCalledWith({ data: { category: 'general' } });
    expect(within(screen.getByRole('list', { name: 'Recent news' })).getAllByRole('link')).toHaveLength(8);
    expect(screen.getByRole('link', { name: 'Show more runway news' }).getAttribute('href')).toBe('/runway');
  });

  it('updates the URL, navigates photos by keyboard and buttons, and supports Back/Forward', async () => {
    const user = userEvent.setup();
    const router = await openNews();
    const trigger = within(screen.getByRole('list', { name: 'Runway news' })).getByRole('link');
    await user.click(trigger);
    const dialog = await screen.findByRole('dialog', { name: 'Paris runway' });
    expect(router.state.location.pathname).toBe('/news/paris-runway');
    expect(document.activeElement).toBe(within(dialog).getByRole('button', { name: 'Close news post' }));
    await user.keyboard('{ArrowRight}');
    expect(within(dialog).getByRole('img').getAttribute('alt')).toBe('Backstage in Paris');
    expect(within(dialog).getByRole('button', { name: 'Go to slide 2' }).getAttribute('aria-current')).toBe('true');
    await user.click(within(dialog).getByRole('button', { name: 'Next slide' }));
    expect(within(dialog).getByRole('button', { name: 'Go to slide 1' }).getAttribute('aria-current')).toBe('true');
    expect(within(dialog).getByRole('img').getAttribute('src')).toBe('/runway.jpg');
    await user.click(within(dialog).getByRole('button', { name: 'Go to slide 2' }));
    expect(within(dialog).getByRole('img').getAttribute('src')).toBe('/backstage.jpg');
    expect(within(dialog).getByRole('button', { name: 'Go to slide 2' }).getAttribute('aria-current')).toBe('true');
    expect(within(dialog).getByRole('button', { name: 'Go to slide 1' }).hasAttribute('aria-current')).toBe(false);
    await user.click(within(dialog).getByRole('button', { name: 'Previous slide' }));
    expect(within(dialog).getByRole('img').getAttribute('src')).toBe('/runway.jpg');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(router.state.location.pathname).toBe('/news');
    await waitFor(() => expect(document.activeElement).toBe(trigger));
    await act(async () => router.history.forward());
    await screen.findByRole('dialog', { name: 'Paris runway' });
    await act(async () => router.history.back());
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('opens a direct URL over the listing and replaces it when closed', async () => {
    const router = await openNews('/news/paris-runway');
    const dialog = await screen.findByRole('dialog', { name: 'Paris runway' });
    expect(document.querySelector('#runway-news')).not.toBeNull();
    await userEvent.click(within(dialog).getByRole('button', { name: 'Close news post' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(router.state.location.pathname).toBe('/news');
    expect(router.history.length).toBe(1);
  });

  it('supports horizontal swipes while ignoring vertical scrolling', async () => {
    await openNews('/news/paris-runway');
    const dialog = await screen.findByRole('dialog');
    const photoArea = within(dialog).getByRole('img').parentElement!;
    fireEvent.touchStart(photoArea, { touches: [{ clientX: 200, clientY: 100 }] });
    fireEvent.touchEnd(photoArea, { changedTouches: [{ clientX: 100, clientY: 105 }] });
    expect(within(dialog).getByRole('button', { name: 'Go to slide 2' }).getAttribute('aria-current')).toBe('true');
    fireEvent.touchStart(photoArea, { touches: [{ clientX: 200, clientY: 100 }] });
    fireEvent.touchEnd(photoArea, { changedTouches: [{ clientX: 100, clientY: 300 }] });
    expect(within(dialog).getByRole('button', { name: 'Go to slide 2' }).getAttribute('aria-current')).toBe('true');
  });

  it('shows a single-photo post without gallery navigation', async () => {
    await openNews('/news/editorial-0');
    const dialog = await screen.findByRole('dialog', { name: 'Editorial 0' });
    expect(within(dialog).queryByRole('button', { name: 'Next slide' })).toBeNull();
    expect(within(dialog).queryByRole('button', { name: /Go to slide/ })).toBeNull();
    expect(within(dialog).getAllByRole('img')).toHaveLength(1);
    expect(within(dialog).queryByText('General news')).toBeNull();
    expect(within(dialog).getByRole('heading', { name: 'Editorial 0' }).className).toContain('font-bold');
  });

  it('shows an unavailable post in a dismissible popup', async () => {
    const router = await openNews('/news/does-not-exist');
    const dialog = await screen.findByRole('dialog', { name: 'News post not found' });
    await userEvent.click(within(dialog).getByRole('button', { name: 'Close news post' }));
    await waitFor(() => expect(router.state.location.pathname).toBe('/news'));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('keeps both sections visible when no posts have been published', async () => {
    vi.mocked(fetchNewsFn).mockResolvedValue({ posts: [], nextCursor: null });
    await openNews();
    expect(screen.getByText('Runway updates are coming soon.')).toBeTruthy();
    expect(screen.getByText('More news from DSTRCT is coming soon.')).toBeTruthy();
  });

  it('opens the runway archive through Show more and uses runway post URLs with Back/Forward', async () => {
    const router = await openNews();
    await userEvent.click(screen.getByRole('link', { name: 'Show more runway news' }));
    await screen.findByRole('heading', { name: 'Runway news', level: 1 });
    expect(screen.queryByRole('heading', { name: 'Recent news' })).toBeNull();
    const trigger = within(screen.getByRole('list', { name: 'Runway news' })).getByRole('link');
    expect(trigger.getAttribute('href')).toBe('/runway/paris-runway');
    await userEvent.click(trigger);
    await screen.findByRole('dialog', { name: 'Paris runway' });
    expect(router.state.location.pathname).toBe('/runway/paris-runway');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(router.state.location.pathname).toBe('/runway');
    await act(async () => router.history.forward());
    await screen.findByRole('dialog', { name: 'Paris runway' });
  });

  it.each(['/runway/paris-runway', '/runway/does-not-exist', '/runway/editorial-0'])(
    'closes a direct runway post URL back to the archive: %s',
    async (path) => {
      const router = await openNews(path);
      const dialog = await screen.findByRole('dialog');
      await userEvent.click(within(dialog).getByRole('button', { name: 'Close news post' }));
      await waitFor(() => expect(router.state.location.pathname).toBe('/runway'));
      expect(router.history.length).toBe(1);
    },
  );

  it('fetches another page on intersection without duplicate requests, then stops at the end', async () => {
    const intersect = installIntersectionObserver();
    const cursor = { publishedAt: generalPosts[0].publishedAt, id: generalPosts[0].id };
    let resolvePage!: (page: NewsPage) => void;
    vi.mocked(fetchNewsFn).mockImplementation(async ({ data }) => {
      if (data.category === 'runway') return { posts: [runwayPost], nextCursor: null };
      if (!data.cursor) return { posts: [generalPosts[0]], nextCursor: cursor };
      return new Promise<NewsPage>((resolve) => {
        resolvePage = resolve;
      });
    });
    const router = await openNews();
    expect(fetchNewsFn).toHaveBeenCalledTimes(2);
    intersect();
    intersect();
    expect(fetchNewsFn).toHaveBeenCalledTimes(3);
    await act(async () => resolvePage({ posts: [generalPosts[0], generalPosts[1]], nextCursor: null }));
    expect(within(screen.getByRole('list', { name: 'Recent news' })).getAllByRole('link')).toHaveLength(2);
    intersect();
    expect(fetchNewsFn).toHaveBeenCalledTimes(3);
    // Loaded pages survive opening and closing a post.
    await userEvent.click(within(screen.getByRole('list', { name: 'Recent news' })).getAllByRole('link')[1]);
    await screen.findByRole('dialog');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(router.state.location.pathname).toBe('/news'));
    expect(within(screen.getByRole('list', { name: 'Recent news' })).getAllByRole('link')).toHaveLength(2);
  });

  it('offers a retry after a pagination failure without automatically retrying forever', async () => {
    const intersect = installIntersectionObserver();
    let fail = true;
    vi.mocked(fetchNewsFn).mockImplementation(async ({ data }) => {
      if (data.category === 'runway') return { posts: [runwayPost], nextCursor: null };
      if (!data.cursor) return { posts: [generalPosts[0]], nextCursor: { publishedAt: generalPosts[0].publishedAt, id: generalPosts[0].id } };
      if (fail) throw new Error('Network unavailable');
      return { posts: [generalPosts[1]], nextCursor: null };
    });
    await openNews();
    intersect();
    await screen.findByRole('alert');
    intersect();
    expect(fetchNewsFn).toHaveBeenCalledTimes(3);
    fail = false;
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(within(screen.getByRole('list', { name: 'Recent news' })).getAllByRole('link')).toHaveLength(2);
  });

  it.each([
    { viewportWidth: 390, columns: 2, scrollY: 5000 },
    { viewportWidth: 1440, columns: 5, scrollY: 2200 },
  ])(
    'virtualizes a long feed in $columns columns at $viewportWidth px and renders offscreen posts on scroll',
    async ({ viewportWidth, columns, scrollY }) => {
      vi.stubGlobal('innerWidth', viewportWidth);
      const intersect = installIntersectionObserver();
      const manyPosts: NewsPost[] = Array.from({ length: 60 }, (_, index) => ({
        ...generalPosts[0],
        id: `post-${index}`,
        slug: `post-${index}`,
        title: `Post ${index}`,
      }));
      vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
        x: 0,
        y: 0,
        left: 0,
        top: 0,
        right: 960,
        bottom: 500,
        width: 960,
        height: 500,
        toJSON: () => ({}),
      });
      vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(500);
      vi.mocked(fetchNewsFn).mockImplementation(async ({ data }) => {
        if (data.category === 'runway') return { posts: [runwayPost], nextCursor: null };
        const start = data.cursor ? Number(data.cursor.id.split('-')[1]) + 1 : 0;
        const end = start + 12;
        return {
          posts: manyPosts.slice(start, end),
          nextCursor: end < manyPosts.length ? { publishedAt: manyPosts[0].publishedAt, id: `post-${end - 1}` } : null,
        };
      });
      await openNews();
      const list = screen.getByRole('list', { name: 'Recent news' });
      expect(within(list).getAllByRole('link')).toHaveLength(12);
      intersect();
      await waitFor(() => expect(within(list).getAllByRole('link')).toHaveLength(24));
      intersect();
      await waitFor(() => expect(list.style.height).not.toBe(''));
      expect((list.firstElementChild as HTMLElement).style.gridTemplateColumns).toContain(`repeat(${columns},`);
      expect(within(list).getAllByRole('link').length).toBeLessThan(36);
      expect(within(list).queryByRole('heading', { name: 'Post 20' })).toBeNull();
      const previousScrollY = window.scrollY;
      try {
        Object.defineProperty(window, 'scrollY', { configurable: true, value: scrollY });
        fireEvent.scroll(window);
        await within(list).findByRole('heading', { name: 'Post 20' });
        expect(within(list).getAllByRole('link').length).toBeLessThan(36);
      } finally {
        Object.defineProperty(window, 'scrollY', { configurable: true, value: previousScrollY });
      }
      expect(fetchNewsFn).toHaveBeenCalledTimes(4);
    },
  );

  it('paginates runway posts without requesting recent posts', async () => {
    const intersect = installIntersectionObserver();
    const second = { ...runwayPost, id: 'runway-2', slug: 'second-runway', title: 'Second runway post' };
    vi.mocked(fetchNewsFn).mockImplementation(async ({ data }) => {
      expect(data.category).toBe('runway');
      return data.cursor
        ? { posts: [second], nextCursor: null }
        : {
            posts: [runwayPost],
            nextCursor: { publishedAt: runwayPost.publishedAt, id: runwayPost.id },
          };
    });
    await openNews('/runway');
    expect(fetchNewsFn).toHaveBeenCalledTimes(1);
    intersect();
    const list = screen.getByRole('list', { name: 'Runway news' });
    await within(list).findByRole('heading', { name: 'Second runway post' });
    expect(
      within(list)
        .getAllByRole('link')
        .map((link) => link.getAttribute('href')),
    ).toEqual(['/runway/paris-runway', '/runway/second-runway']);
    expect(fetchNewsFn).toHaveBeenCalledTimes(2);
  });
});
