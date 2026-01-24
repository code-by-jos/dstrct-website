import { createFileRoute } from '@tanstack/react-router';
import { useEffect } from 'react';
import { fetchModel } from '@/crm/models';
import { PageLayout } from '@/components/layout/PageLayout';
import { ErrorPage } from '@/components/layout/ErrorPage';
import { PhotoSlideshow } from '@/components/ui/PhotoSlideshow';
import { Heading } from '@/components/ui/Heading';
import { BackLink } from '@/components/ui/BackLink';
import { Container } from '@/components/ui/Container';
import { InstagramLink } from '@/components/ui/InstagramLink';
import { isMobileDevice } from '@/utils/deviceDetection';
import { CACHE_DURATION } from '@/constants/cache';

export const Route = createFileRoute('/models/$slug')({
  loader: async ({ params, context }) => {
    const model = await fetchModel(params.slug);

    // Detect device type from request headers during SSR
    let isMobile = false;
    if (typeof window === 'undefined') {
      // Server-side: try to get user agent from context
      const userAgent = (context as any)?.userAgent || '';
      isMobile = isMobileDevice(userAgent);
    }

    return { model, isMobile };
  },
  staleTime: CACHE_DURATION.SHORT,
  errorComponent: ({ error }) => <ErrorPage title='Model' error={error} />,
  component: RouteComponent,
});

function RouteComponent() {
  const { model, isMobile: serverIsMobile } = Route.useLoaderData();

  // Reset scroll position when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Use client-side detection if available, otherwise use server detection
  const isMobile = typeof navigator !== 'undefined' ? isMobileDevice(navigator.userAgent) : serverIsMobile;
  const initialPhotosPerSlide = isMobile ? 1 : 2;

  if (!model) {
    return (
      <PageLayout title='Model Not Found'>
        <div className='mt-8 text-center'>
          <p className='text-lg text-gray-600'>Model not found.</p>
        </div>
      </PageLayout>
    );
  }

  const stats = [
    { label: 'Height', value: model.stats.height },
    { label: 'Hair', value: model.stats.hair },
    { label: 'Eyes', value: model.stats.eyes },
    { label: 'Bust', value: model.stats.bust },
    { label: 'Waist', value: model.stats.waist },
    { label: 'Hips', value: model.stats.hips },
    { label: 'Shoes', value: model.stats.shoes },
  ];

  return (
    <>
      <BackLink to='/models' rightContent={model.socials?.instagram && <InstagramLink handle={model.socials.instagram} variant='subtle' />} />

      <Container className='pt-4 pb-8'>
        {/* Model name - compact */}
        <Heading size='h4' className='text-center pb-4'>
          {model.name}
        </Heading>

        {/* Stats row */}
        <div className='mb-6'>
          <div className='flex flex-wrap gap-x-6 gap-y-4 md:gap-x-16 md:gap-y-8 justify-center'>
            {stats.map((stat) => (
              <div key={stat.label} className='flex flex-col items-center min-w-[60px]'>
                <span className='text-xs md:text-sm text-gray-400 uppercase tracking-wider mb-1 md:mb-2'>{stat.label}</span>
                <span className='text-sm md:text-lg font-normal'>{stat.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Photo slideshow */}
        <PhotoSlideshow photos={model.photos} initialPhotosPerSlide={initialPhotosPerSlide} />
      </Container>
    </>
  );
}
