import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Markdown } from '@/components/ui/Markdown';
import { NewsDialog } from '@/components/news/NewsDialog';
import type { NewsPost } from '@/types/News';

export function NewsGallery({ post }: { post: NewsPost }) {
  const [index, setIndex] = useState(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const photo = post.photos[index];
  const multiplePhotos = post.photos.length > 1;

  function move(direction: number) {
    setIndex((current) => (current + direction + post.photos.length) % post.photos.length);
  }

  return (
    <NewsDialog
      title={post.title}
      onKeyDown={(event) => {
        if (!multiplePhotos || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault();
          move(event.key === 'ArrowLeft' ? -1 : 1);
        }
      }}
    >
      <div className='grid lg:grid-cols-[minmax(0,1fr)_22rem]'>
        <div>
          <div
            className='relative flex h-[55dvh] min-h-64 items-center justify-center bg-gray-50 lg:h-[min(72dvh,850px)]'
            style={{ touchAction: 'pan-y pinch-zoom' }}
            onTouchStart={(event) => {
              touchStart.current = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
            }}
            onTouchCancel={() => {
              touchStart.current = null;
            }}
            onTouchEnd={(event) => {
              if (!touchStart.current || !multiplePhotos) return;
              const dx = event.changedTouches[0].clientX - touchStart.current.x;
              const dy = event.changedTouches[0].clientY - touchStart.current.y;
              touchStart.current = null;
              if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) move(dx > 0 ? -1 : 1);
            }}
          >
            {photo && <img src={photo.src} alt={photo.alt} className='h-full w-full object-contain' draggable={false} />}
            {multiplePhotos && (
              <>
                <Button
                  variant='icon'
                  onPress={() => move(-1)}
                  aria-label='Previous photo'
                  className='absolute left-3 rounded-full bg-white/90 hover:bg-white focus-visible:bg-stone-200 focus-visible:ring-0 focus-visible:ring-offset-0'
                >
                  <ChevronLeft className='h-6 w-6' />
                </Button>
                <Button
                  variant='icon'
                  onPress={() => move(1)}
                  aria-label='Next photo'
                  className='absolute right-3 rounded-full bg-white/90 hover:bg-white focus-visible:bg-stone-200 focus-visible:ring-0 focus-visible:ring-offset-0'
                >
                  <ChevronRight className='h-6 w-6' />
                </Button>
              </>
            )}
          </div>
          <p role='status' aria-live='polite' aria-atomic='true' className='py-3 text-center text-xs tracking-wider text-gray-500'>
            Photo {index + 1} / {post.photos.length}
          </p>
        </div>

        <div className='p-6 md:p-8 lg:max-h-[calc(min(72dvh,850px)+2.5rem)] lg:overflow-y-auto'>
          <h2 className='font-serif text-3xl font-bold leading-tight'>{post.title}</h2>
          <time dateTime={post.publishedAt} className='mt-4 block text-xs uppercase tracking-wider text-gray-500'>
            {new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(post.publishedAt))}
          </time>
          {post.body ? (
            <div className='mt-6'>
              <Markdown>{post.body}</Markdown>
            </div>
          ) : (
            post.excerpt && <p className='mt-6 leading-relaxed'>{post.excerpt}</p>
          )}
        </div>
      </div>
    </NewsDialog>
  );
}
