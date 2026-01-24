export interface InstagramPostData {
  imageUrl: string;
  postUrl: string;
  caption: string;
}

interface InstagramPostProps {
  post: InstagramPostData;
}

export function InstagramPost({ post }: InstagramPostProps) {
  return (
    <a
      href={post.postUrl}
      target='_blank'
      rel='noopener noreferrer'
      className='block group'
      aria-label={`Instagram post: ${post.caption.substring(0, 50)}...`}
      tabIndex={-1}
    >
      {/* Image */}
      <div className='relative aspect-4/5 overflow-hidden bg-gray-100'>
        <img
          src={post.imageUrl}
          alt={post.caption}
          className='w-full h-full object-cover transition-transform duration-300 group-hover:scale-105'
          loading='lazy'
        />
      </div>

      {/* Caption */}
      <div className='mt-3 px-2'>
        <p className='text-sm text-gray-600 line-clamp-3'>{post.caption}</p>
      </div>
    </a>
  );
}
