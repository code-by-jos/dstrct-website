import { BREAKPOINTS } from '@/constants/breakpoints';

export function isMobileDevice(userAgent: string): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
}

export function getDeviceType(): 'mobile' | 'desktop' {
  if (typeof window === 'undefined') {
    return 'desktop'; // Default for SSR
  }
  return window.innerWidth < BREAKPOINTS.MOBILE ? 'mobile' : 'desktop';
}
