import { useEffect, useRef, useState } from 'react';
import { useLocation } from '@tanstack/react-router';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { NewsCard } from '@/components/news/NewsCard';
import { Button } from '@/components/ui/Button';
import { useNewsFeed } from '@/hooks/useNewsFeed';
import type { NewsCategory, NewsListingPath, NewsPage } from '@/types/News';

interface NewsGridProps {
  category: NewsCategory;
  initialPage: NewsPage;
  listingPath?: NewsListingPath;
}

export function NewsGrid({ category, initialPage, listingPath = '/news' }: NewsGridProps) {
  const { posts, nextCursor, isLoading, error, loadMore } = useNewsFeed(category, initialPage);
  const gridRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const measuredRows = useRef(new Map<string, number>());
  const galleryOpen = useLocation({ select: (location) => location.pathname.replace(/\/$/, '') !== listingPath });
  const [layout, setLayout] = useState({ columns: 1, width: 0, top: 0 });
  const virtualized = posts.length > 24 && layout.width > 0;
  const label = category === 'runway' ? 'Runway news' : 'Recent news';

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    function measure() {
      if (!grid) return;
      const rect = grid.getBoundingClientRect();
      let columns = window.innerWidth >= 640 ? 2 : 1;
      if (window.innerWidth >= 1280) columns = category === 'runway' ? 5 : 3;
      else if (category === 'runway' && window.innerWidth >= 1024) columns = 3;
      // Seed virtual estimates with the rows already on screen, avoiding a
      // scroll jump when the growing regular grid switches to virtual rows.
      const cards = Array.from(grid.children).filter((child) => child.getAttribute('role') === 'listitem');
      for (let index = 0; index < cards.length; index += columns) {
        const firstId = cards[index].getAttribute('data-post-id');
        const height = Math.max(...cards.slice(index, index + columns).map((card) => card.getBoundingClientRect().height));
        if (firstId && height > 0) measuredRows.current.set(`${columns}:${rect.width}:${firstId}`, height);
      }
      const next = { columns, width: rect.width, top: rect.top + window.scrollY };
      setLayout((current) => (current.columns === next.columns && current.width === next.width && current.top === next.top ? current : next));
    }
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(grid);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [category, posts.length === 0]);

  const virtualizer = useWindowVirtualizer({
    count: Math.ceil(posts.length / layout.columns),
    estimateSize: (index) =>
      measuredRows.current.get(`${layout.columns}:${layout.width}:${posts[index * layout.columns]?.id}`) ??
      ((layout.width - (layout.columns - 1) * 32) / layout.columns) * (category === 'runway' ? 1.5 : 1) + 120,
    getItemKey: (index) => posts[index * layout.columns]?.id ?? index,
    overscan: 2,
    gap: 48,
    scrollMargin: layout.top,
    enabled: virtualized,
  });

  useEffect(() => {
    virtualizer.measure();
  }, [layout.columns, layout.width, virtualizer]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !nextCursor || isLoading || error || galleryOpen || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) void loadMore();
      },
      { rootMargin: '500px 0px' },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [nextCursor, isLoading, error, galleryOpen, loadMore]);

  if (posts.length === 0) {
    return (
      <p className='py-8 text-center text-gray-500'>
        {category === 'runway' ? 'Runway updates are coming soon.' : 'More news from DSTRCT is coming soon.'}
      </p>
    );
  }

  return (
    <>
      <div
        ref={gridRef}
        role='list'
        aria-label={label}
        className={
          virtualized
            ? 'relative'
            : category === 'runway'
              ? 'grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'
              : 'grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 xl:grid-cols-3'
        }
        style={virtualized ? { height: virtualizer.getTotalSize(), overflowAnchor: 'none' } : undefined}
      >
        {virtualized
          ? virtualizer.getVirtualItems().map((row) => (
              <div
                key={row.key}
                ref={virtualizer.measureElement}
                data-index={row.index}
                className='absolute left-0 top-0 grid w-full gap-x-8'
                style={{ gridTemplateColumns: `repeat(${layout.columns}, minmax(0, 1fr))`, transform: `translateY(${row.start - layout.top}px)` }}
              >
                {posts.slice(row.index * layout.columns, (row.index + 1) * layout.columns).map((post) => (
                  <div role='listitem' key={post.id}>
                    <NewsCard post={post} listingPath={listingPath} />
                  </div>
                ))}
              </div>
            ))
          : posts.map((post) => (
              <div role='listitem' key={post.id} data-post-id={post.id}>
                <NewsCard post={post} listingPath={listingPath} />
              </div>
            ))}
      </div>
      <div
        ref={sentinelRef}
        className={
          nextCursor || isLoading || error ? 'mt-8 flex min-h-12 flex-col items-center justify-center gap-3 text-sm text-stone-500' : undefined
        }
      >
        {isLoading ? (
          <p role='status'>Loading more posts…</p>
        ) : error ? (
          <>
            <p role='alert'>We couldn’t load more posts.</p>
            <Button
              onPress={() => {
                void loadMore();
              }}
            >
              Try again
            </Button>
          </>
        ) : nextCursor ? (
          <Button
            onPress={() => {
              void loadMore();
            }}
            className='bg-transparent text-stone-600 underline underline-offset-4 hover:bg-stone-50'
          >
            Load more
          </Button>
        ) : null}
      </div>
    </>
  );
}
