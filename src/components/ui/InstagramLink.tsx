import { Instagram } from 'lucide-react';
import { Link } from '@/components/ui/Link';

interface InstagramLinkProps {
  /** Instagram handle (without @) */
  handle: string;
  /** Whether to show the Instagram icon */
  showIcon?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Link variant */
  variant?: 'default' | 'footer' | 'subtle';
}

/**
 * Instagram profile link component.
 * Renders an external link to an Instagram profile with optional icon.
 */
export function InstagramLink({ handle, showIcon = true, className = '', variant }: InstagramLinkProps) {
  return (
    <Link
      url={`https://www.instagram.com/${handle}`}
      variant={variant}
      className={`inline-flex items-center gap-1.5 ${className}`.trim()}
      aria-label={`Instagram @${handle}`}
    >
      {showIcon && <Instagram className='w-4 h-4' />}@{handle}
    </Link>
  );
}
