import { createFileRoute } from '@tanstack/react-router';
import { fetchTextContentFn } from '@/server/fetchContent';
import { ErrorPage } from '@/components/layout/ErrorPage';
import { TextContentPage } from '@/components/TextContentPage';
import { CACHE_DURATION } from '@/constants/cache';

export const Route = createFileRoute('/terms')({
  loader: () => fetchTextContentFn({ data: 'guidelines' }),
  staleTime: CACHE_DURATION.SHORT,
  errorComponent: ({ error }) => <ErrorPage title='Terms & conditions' error={error} />,
  component: () => <TextContentPage title='Terms & conditions' content={Route.useLoaderData()} />,
});
