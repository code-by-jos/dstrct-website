import { createFileRoute, notFound } from '@tanstack/react-router';
import { NewsGallery } from '@/components/news/NewsGallery';
import { newsPostRouteOptions } from '@/components/news/newsPostRouteOptions';
import { fetchNewsPostFn } from '@/server/fetchContent';

export const Route = createFileRoute('/news/$slug')({
  ...newsPostRouteOptions,
  loader: async ({ params }) => {
    const post = await fetchNewsPostFn({ data: params.slug });
    if (!post) throw notFound();
    return post;
  },
  component: NewsPostPage,
});

function NewsPostPage() {
  const post = Route.useLoaderData();
  return <NewsGallery key={post.id} post={post} />;
}
