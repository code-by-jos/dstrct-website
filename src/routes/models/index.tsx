import { createFileRoute } from '@tanstack/react-router';
import { fetchModels } from '@/crm/models';
import type { Model } from '@/types/Model';
import { ModelCard } from '@/components/ModelCard';
import { PageLayout } from '@/components/layout/PageLayout';
import { ErrorPage } from '@/components/layout/ErrorPage';
import { CACHE_DURATION } from '@/constants/cache';

export const Route = createFileRoute('/models/')({
  loader: (): Promise<Model[]> => fetchModels(),
  staleTime: CACHE_DURATION.SHORT,
  errorComponent: ({ error }) => <ErrorPage title='Models' error={error} />,
  component: RouteComponent,
});

function RouteComponent() {
  const models = Route.useLoaderData();

  return (
    <PageLayout title='Models'>
      <div className='mt-12'>
        {models?.length === 0 ? (
          <p className='text-gray-600 text-center'>No models found.</p>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-[repeat(auto-fill,400px)] gap-8 justify-center'>
            {models
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((model) => (
                <ModelCard key={model.name} model={model} />
              ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
