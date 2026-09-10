import { createFileRoute } from '@tanstack/react-router';
import { fetchTextContentFn } from '@/server/fetchContent';
import { ErrorPage } from '@/components/layout/ErrorPage';
import { TextContentPage } from '@/components/TextContentPage';
import { CACHE_DURATION } from '@/constants/cache';

export const Route = createFileRoute('/about')({
  loader: () => fetchTextContentFn({ data: 'about' }),
  staleTime: CACHE_DURATION.SHORT,
  errorComponent: ({ error }) => <ErrorPage title='About' error={error} />,
  component: () => <TextContentPage title='About' content={Route.useLoaderData()} />,
});
