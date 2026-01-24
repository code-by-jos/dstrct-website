import type { FileRoutesByTo } from '@/routeTree.gen';

export type RouteId = keyof FileRoutesByTo;

export interface NavLink {
  to: RouteId;
  label: string;
}

export const navLinks: NavLink[] = [
  { to: '/models', label: 'Models' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
  { to: '/apply', label: 'Apply' },
];

/** Instagram handle for the company */
export const INSTAGRAM_HANDLE = 'dstrctmgmt';
