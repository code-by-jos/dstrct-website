import { ChevronLeft } from 'lucide-react';
import { Link } from '@/components/ui/Link';
import { Container } from '@/components/ui/Container';
import type { RouteId } from '@/constants/navigation';

interface BackLinkProps {
  to: RouteId;
  children?: React.ReactNode;
  /** Optional content to render on the right side */
  rightContent?: React.ReactNode;
}

/**
 * Navigation back link with optional right-side content.
 * Wraps content in a Container for consistent layout.
 */
export function BackLink({ to, children = 'back', rightContent }: BackLinkProps) {
  return (
    <Container className='pt-4 flex justify-between items-center'>
      <Link to={to} variant='subtle' className='inline-flex items-center gap-2 text-md'>
        <ChevronLeft className='w-4 h-4' />
        {children}
      </Link>
      {rightContent}
    </Container>
  );
}
