import { PageLayout } from '@/components/layout/PageLayout';

interface ErrorPageProps {
  title: string;
  error: Error;
}

export function ErrorPage({ title, error }: ErrorPageProps) {
  console.error(`Error in ${title} route:`, error);

  return (
    <PageLayout title={title}>
      <div className='mt-8 text-center'>
        <p className='text-lg text-red-600'>Something went wrong</p>
        <p className='text-sm text-gray-600 mt-2'>{error.message}</p>
      </div>
    </PageLayout>
  );
}
