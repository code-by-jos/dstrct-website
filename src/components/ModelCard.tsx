import { Link } from '@/components/ui/Link';
import type { Model } from '@/types/Model';

interface ModelCardProps {
  model: Model;
}

export function ModelCard({ model }: ModelCardProps) {
  return (
    <Link to='/models/$slug' params={{ slug: model.slug }} className='relative aspect-3/4 overflow-hidden group cursor-pointer w-full block'>
      <img src={model.photo} alt={model.name} className='w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300' />
      <div className='absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent pointer-events-none' />
      <div className='absolute bottom-0 left-0 right-0 p-6 flex justify-center'>
        <h3 className='text-white text-2xl font-semibold text-center'>{model.name}</h3>
      </div>
    </Link>
  );
}
