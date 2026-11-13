import { useMemo, useRef } from 'react';
import { PhotoSlideshow, type PhotoSlideshowHandle } from '@/components/ui/PhotoSlideshow';
import { Markdown } from '@/components/ui/Markdown';
import { NewsDialog } from '@/components/news/NewsDialog';
import type { NewsPost } from '@/types/News';

export function NewsGallery({ post }: { post: NewsPost }) {
  const slideshowRef = useRef<PhotoSlideshowHandle>(null);
  const photos = useMemo(() => post.photos.map((photo) => photo.src), [post.photos]);

  return (
    <NewsDialog
      title={post.title}
      onKeyDown={(event) => {
        if (photos.length <= 1 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault();
          if (event.key === 'ArrowLeft') slideshowRef.current?.goToPrevious();
          else slideshowRef.current?.goToNext();
        }
      }}
    >
      <div className='grid lg:grid-cols-[minmax(0,1fr)_22rem]'>
        <PhotoSlideshow ref={slideshowRef} photos={photos} photoAlts={post.photos.map((photo) => photo.alt)} layout='dialog' />

        <div className='p-6 md:p-8 lg:max-h-[calc(min(72dvh,850px)+2.5rem)] lg:overflow-y-auto'>
          <h2 className='font-serif text-3xl font-bold leading-tight'>{post.title}</h2>
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
