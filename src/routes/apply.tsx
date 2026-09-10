import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { ErrorPage } from '@/components/layout/ErrorPage';
import { ApplicationForm } from '@/components/ApplicationForm';
import { ApplicationSuccess } from '@/components/ApplicationSuccess';
import { PageLayout } from '@/components/layout/PageLayout';
import { Container } from '@/components/ui/Container';
import { Markdown } from '@/components/ui/Markdown';
import { fetchTextContentFn } from '@/server/fetchContent';
import { CACHE_DURATION } from '@/constants/cache';

function ApplyPage() {
  const content = Route.useLoaderData();
  const [isSuccess, setIsSuccess] = useState(false);

  if (isSuccess) {
    return (
      <PageLayout title='Application Submitted'>
        <ApplicationSuccess />
      </PageLayout>
    );
  }

  return (
    <PageLayout title='Apply'>
      {content?.text && (
        <Container className='pt-8'>
          <div className='max-w-3xl'>
            <Markdown>{content.text}</Markdown>
          </div>
        </Container>
      )}
      <ApplicationForm onSuccess={() => setIsSuccess(true)} />
    </PageLayout>
  );
}

export const Route = createFileRoute('/apply')({
  loader: () => fetchTextContentFn({ data: 'apply' }),
  staleTime: CACHE_DURATION.SHORT,
  errorComponent: ({ error }) => <ErrorPage title='Apply' error={error} />,
  component: ApplyPage,
});
