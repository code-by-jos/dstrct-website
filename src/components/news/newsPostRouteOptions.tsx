import { NewsDialog } from '@/components/news/NewsDialog';
import { CACHE_DURATION } from '@/constants/cache';
import type { NewsPost } from '@/types/News';
import { createPageMeta } from '@/utils/seo';

export const newsPostRouteOptions = {
  staleTime: CACHE_DURATION.NONE,
  head: ({ loaderData }: { loaderData?: NewsPost }) => ({
    meta: loaderData
      ? createPageMeta({
          title: `${loaderData.title} | DSTRCT`,
          description: loaderData.excerpt || loaderData.title,
          image: loaderData.coverImage.src,
          imageAlt: loaderData.coverImage.alt,
          type: 'article',
        })
      : [],
  }),
  pendingComponent: () => (
    <NewsDialog title='Loading news post'>
      <p role='status' className='p-12 text-center text-gray-500'>
        Loading news post…
      </p>
    </NewsDialog>
  ),
  notFoundComponent: () => (
    <NewsDialog title='News post not found'>
      <div className='p-12 text-center'>
        <h2 className='font-serif text-3xl font-bold'>News post not found</h2>
        <p className='mt-4 text-gray-500'>This post is unavailable or has not been published yet.</p>
      </div>
    </NewsDialog>
  ),
  errorComponent: () => (
    <NewsDialog title='Unable to load news post'>
      <p role='alert' className='p-12 text-center'>
        We couldn’t load this news post. Please try again.
      </p>
    </NewsDialog>
  ),
};
