import { Link } from '@/components/ui/Link';
import type { NewsListingPath, NewsSummary } from '@/types/News';

// Marks navigation from a card so closing the popup can restore browser history.
declare module '@tanstack/react-router' {
  interface HistoryState {
    newsGallery?: boolean;
  }
}

export function NewsCard({ post, listingPath = '/news' }: { post: NewsSummary; listingPath?: NewsListingPath }) {
  return (
    <article>
      <Link
        to={listingPath === '/runway' ? '/runway/$slug' : '/news/$slug'}
        params={{ slug: post.slug }}
        state={{ newsGallery: true }}
        resetScroll={false}
        className='group block hover:text-black focus-visible:ring-0 focus-visible:ring-offset-0'
        aria-haspopup='dialog'
      >
        <div
          className={`relative overflow-hidden rounded-lg bg-stone-100 transition-shadow duration-700 group-hover:shadow-[0_16px_40px_-18px_rgba(70,54,37,0.4)] group-focus-visible:shadow-[0_16px_40px_-18px_rgba(70,54,37,0.4)] motion-reduce:transition-none ${post.category === 'runway' ? 'aspect-2/3' : 'aspect-3/4'}`}
        >
          <img
            src={post.coverImage.src}
            alt={post.coverImage.alt}
            loading='lazy'
            decoding='async'
            width={900}
            height={post.category === 'runway' ? 1350 : 1200}
            className='h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035] group-focus-visible:scale-[1.035] motion-reduce:transition-none motion-reduce:transform-none'
          />
        </div>
        <h3 className={`mt-4 font-bold uppercase tracking-wide ${post.category === 'runway' ? 'text-sm' : 'text-lg md:text-xl'}`}>
          <span className='bg-linear-to-r from-stone-400 to-stone-400 bg-size-[0%_1px] bg-bottom-left bg-no-repeat pb-1 transition-[background-size] duration-500 group-hover:bg-size-[100%_1px] group-focus-visible:bg-size-[100%_1px] motion-reduce:transition-none'>
            {post.title}
          </span>
        </h3>
      </Link>
      {post.category === 'general' && post.excerpt && <p className='mt-2 text-sm leading-relaxed text-gray-600'>{post.excerpt}</p>}
    </article>
  );
}
