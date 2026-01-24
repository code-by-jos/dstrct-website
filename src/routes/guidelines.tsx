import { createFileRoute } from '@tanstack/react-router';
import { fetchTextContent, type TextDocument } from '@/crm/texts';
import { ErrorPage } from '@/components/layout/ErrorPage';
import { TextContentPage } from '@/components/TextContentPage';
import { CACHE_DURATION } from '@/constants/cache';

export const Route = createFileRoute('/guidelines')({
  loader: (): Promise<TextDocument | null> => fetchTextContent('guidelines'),
  staleTime: CACHE_DURATION.SHORT,
  errorComponent: ({ error }) => <ErrorPage title='Guidelines' error={error} />,
  component: () => <TextContentPage title='Guidelines' content={Route.useLoaderData()} />,
});
