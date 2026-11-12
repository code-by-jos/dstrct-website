import { useLocation } from '@tanstack/react-router';
import { Link } from '@/components/ui/Link';
import type { RouteId } from '@/constants/navigation';

interface MenuLinkProps {
  to: RouteId;
  children: React.ReactNode;
  className?: string;
}

export function MenuLink({ to, children, className = '' }: MenuLinkProps) {
  const location = useLocation();
  const isActive =
    location.pathname === to || (to !== '/' && location.pathname.startsWith(`${to}/`)) || (to === '/news' && location.pathname.startsWith('/runway'));

  return (
    <Link
      to={to}
      className={`text-md uppercase tracking-wider font-light ${className}`}
      style={
        isActive ? { textShadow: '0.5px 0 0 currentColor, -0.5px 0 0 currentColor, 0 0.5px 0 currentColor, 0 -0.5px 0 currentColor' } : undefined
      }
    >
      {children}
    </Link>
  );
}
