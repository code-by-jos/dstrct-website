import { ReactNode } from 'react';

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

/**
 * Standard container component with consistent max-width and padding.
 * Use this for page-level content wrappers.
 */
export function Container({ children, className = '' }: ContainerProps) {
  return <div className={`max-w-450 mx-auto px-4 md:px-8 ${className}`.trim()}>{children}</div>;
}
