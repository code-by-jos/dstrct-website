import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchNewsFn } from '@/server/fetchContent';
import type { NewsCategory, NewsPage } from '@/types/News';

export function useNewsFeed(category: NewsCategory, initialPage: NewsPage) {
  // Preserve loaded pages while a child gallery route opens/closes.
  const [page, setPage] = useState(initialPage);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const inFlight = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const loadMore = useCallback(async () => {
    if (!page.nextCursor || inFlight.current) return;
    inFlight.current = true;
    setIsLoading(true);
    setError(false);
    try {
      const next = await fetchNewsFn({ data: { category, cursor: page.nextCursor } });
      if (!mounted.current) return;
      setPage((current) => {
        const existing = new Set(current.posts.map((post) => post.id));
        return { posts: [...current.posts, ...next.posts.filter((post) => !existing.has(post.id))], nextCursor: next.nextCursor };
      });
    } catch {
      if (mounted.current) setError(true);
    } finally {
      inFlight.current = false;
      if (mounted.current) setIsLoading(false);
    }
  }, [category, page.nextCursor]);

  return { ...page, isLoading, error, loadMore };
}
