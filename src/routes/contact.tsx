import { createFileRoute } from '@tanstack/react-router';
import { fetchTextContent, type TextDocument } from '@/crm/texts';
import { ErrorPage } from '@/components/layout/ErrorPage';
import { TextContentPage } from '@/components/TextContentPage';
import { CACHE_DURATION } from '@/constants/cache';

export const Route = createFileRoute('/contact')({
  loader: (): Promise<TextDocument | null> => fetchTextContent('contact'),
  staleTime: CACHE_DURATION.SHORT,
  errorComponent: ({ error }) => <ErrorPage title='Contact' error={error} />,
  component: () => <TextContentPage title='Contact' content={Route.useLoaderData()} />,
});
