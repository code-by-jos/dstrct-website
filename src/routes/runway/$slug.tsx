import { createFileRoute, notFound } from '@tanstack/react-router';
import { NewsGallery } from '@/components/news/NewsGallery';
import { newsPostRouteOptions } from '@/components/news/newsPostRouteOptions';
import { fetchRunwayPostFn } from '@/server/fetchContent';

export const Route = createFileRoute('/runway/$slug')({
  ...newsPostRouteOptions,
  loader: async ({ params }) => {
    const post = await fetchRunwayPostFn({ data: params.slug });
    if (!post) throw notFound();
    return post;
  },
  component: RunwayPostPage,
});

function RunwayPostPage() {
  const post = Route.useLoaderData();
  return <NewsGallery key={post.id} post={post} />;
}
