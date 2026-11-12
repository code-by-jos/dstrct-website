import { createFileRoute, Outlet } from '@tanstack/react-router';
import { PageLayout } from '@/components/layout/PageLayout';
import { ErrorPage } from '@/components/layout/ErrorPage';
import { BackLink } from '@/components/ui/BackLink';
import { NewsGrid } from '@/components/news/NewsGrid';
import { fetchNewsFn } from '@/server/fetchContent';
import { CACHE_DURATION } from '@/constants/cache';

export const Route = createFileRoute('/runway')({
  loader: () => fetchNewsFn({ data: { category: 'runway' } }),
  staleTime: CACHE_DURATION.SHORT,
  errorComponent: ({ error }) => <ErrorPage title='Runway news' error={error} />,
  component: RunwayPage,
});

function RunwayPage() {
  const page = Route.useLoaderData();
  return (
    <>
      <BackLink to='/news'>Back to news</BackLink>
      <PageLayout title='Runway news'>
        <NewsGrid category='runway' initialPage={page} listingPath='/runway' />
      </PageLayout>
      <Outlet />
    </>
  );
}
