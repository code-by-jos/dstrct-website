import { createFileRoute } from '@tanstack/react-router';
import { fetchTextContent, type TextDocument } from '@/crm/texts';
import { ErrorPage } from '@/components/layout/ErrorPage';
import { TextContentPage } from '@/components/TextContentPage';
import { CACHE_DURATION } from '@/constants/cache';

export const Route = createFileRoute('/about')({
  loader: (): Promise<TextDocument | null> => fetchTextContent('about'),
  staleTime: CACHE_DURATION.SHORT,
  errorComponent: ({ error }) => <ErrorPage title='About' error={error} />,
  component: () => <TextContentPage title='About' content={Route.useLoaderData()} />,
});
