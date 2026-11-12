import { createFileRoute, Outlet } from '@tanstack/react-router';
import { PageLayout } from '@/components/layout/PageLayout';
import { ErrorPage } from '@/components/layout/ErrorPage';
import { NewsListing } from '@/components/news/NewsListing';
import { fetchNewsFn } from '@/server/fetchContent';
import { CACHE_DURATION } from '@/constants/cache';

export const Route = createFileRoute('/news')({
  loader: async () => {
    const [runway, recent] = await Promise.all([
      fetchNewsFn({ data: { category: 'runway', limit: 6 } }),
      fetchNewsFn({ data: { category: 'general' } }),
    ]);
    return { runway, recent };
  },
  staleTime: CACHE_DURATION.SHORT,
  errorComponent: ({ error }) => <ErrorPage title='News' error={error} />,
  component: NewsPage,
});

function NewsPage() {
  const { runway, recent } = Route.useLoaderData();

  return (
    <>
      <PageLayout title='News'>
        <NewsListing runway={runway} recent={recent} />
      </PageLayout>
      <Outlet />
    </>
  );
}
