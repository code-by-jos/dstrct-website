import { createFileRoute } from '@tanstack/react-router';
import { fetchTextContentFn } from '@/server/fetchContent';
import { ErrorPage } from '@/components/layout/ErrorPage';
import { TextContentPage } from '@/components/TextContentPage';
import { CACHE_DURATION } from '@/constants/cache';

export const Route = createFileRoute('/contact')({
  loader: () => fetchTextContentFn({ data: 'contact' }),
  staleTime: CACHE_DURATION.SHORT,
  errorComponent: ({ error }) => <ErrorPage title='Contact' error={error} />,
  component: () => <TextContentPage title='Contact' content={Route.useLoaderData()} />,
});
