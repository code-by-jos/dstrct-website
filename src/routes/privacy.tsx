import { createFileRoute } from '@tanstack/react-router';
import { fetchTextContent, type TextDocument } from '@/crm/texts';
import { ErrorPage } from '@/components/layout/ErrorPage';
import { TextContentPage } from '@/components/TextContentPage';
import { CACHE_DURATION } from '@/constants/cache';

export const Route = createFileRoute('/privacy')({
  loader: (): Promise<TextDocument | null> => fetchTextContent('privacy'),
  staleTime: CACHE_DURATION.SHORT,
  errorComponent: ({ error }) => <ErrorPage title='Privacy' error={error} />,
  component: () => <TextContentPage title='Privacy' content={Route.useLoaderData()} />,
});
