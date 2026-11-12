import { Heading } from '@/components/ui/Heading';
import { Link } from '@/components/ui/Link';
import { NewsCard } from '@/components/news/NewsCard';
import { NewsGrid } from '@/components/news/NewsGrid';
import type { NewsPage } from '@/types/News';

export function NewsListing({ runway, recent }: { runway: NewsPage; recent: NewsPage }) {
  return (
    <div className='space-y-10 md:space-y-12'>
      <section aria-labelledby='runway-news-title'>
        <div className='mb-6 border-y border-gray-200 py-6'>
          <Heading size='h2' className='text-3xl md:text-5xl font-light' id='runway-news-title'>
            Runway news
          </Heading>
        </div>
        {runway.posts.length === 0 ? (
          <p className='py-8 text-center text-gray-500'>Runway updates are coming soon.</p>
        ) : (
          <ul id='runway-news' aria-label='Runway news' className='flex snap-x snap-mandatory gap-4 overflow-x-auto p-1 pb-2 md:gap-6'>
            {runway.posts.map((post) => (
              <li key={post.id} className='w-[85%] shrink-0 snap-start md:w-[calc(25%-1.125rem)] xl:w-[calc(16.6667%-1.25rem)]'>
                <NewsCard post={post} />
              </li>
            ))}
          </ul>
        )}
        <div className='mt-6 text-center'>
          <Link
            to='/runway'
            aria-label='Show more runway news'
            className='inline-flex border-b border-stone-400 px-4 py-2 text-xs uppercase tracking-[0.2em] hover:border-black focus-visible:ring-0 focus-visible:bg-stone-100'
          >
            Show more
          </Link>
        </div>
      </section>
      <section aria-labelledby='recent-news-title'>
        <div className='mb-8 border-y border-gray-200 py-6'>
          <Heading size='h2' className='text-3xl md:text-5xl font-light' id='recent-news-title'>
            Recent news
          </Heading>
        </div>
        <NewsGrid category='general' initialPage={recent} />
      </section>
    </div>
  );
}
