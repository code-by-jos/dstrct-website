import { Link as TanStackLink, type LinkProps as TanStackLinkProps } from '@tanstack/react-router';
import { tv, type VariantProps } from 'tailwind-variants';
import { forwardRef } from 'react';

const linkVariants = tv({
  base: 'transition-colors duration-200 outline-none focus-visible:ring-1 focus-visible:ring-offset-4 focus-visible:ring-black',
  variants: {
    variant: {
      default: 'text-black hover:text-gray-600',
      footer: 'text-sm text-gray-500 hover:text-gray-900',
      subtle: 'text-xs uppercase tracking-wider font-light hover:opacity-80 transition-opacity',
    },
    underline: {
      true: 'underline underline-offset-4',
      false: 'no-underline',
    },
  },
  defaultVariants: {
    variant: 'default',
    underline: false,
  },
});

type BaseLinkProps = VariantProps<typeof linkVariants> & {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
};

type InternalLinkProps = BaseLinkProps &
  Omit<TanStackLinkProps, 'className' | 'style'> & {
    url?: never;
  };

type ExternalLinkProps = BaseLinkProps & {
  /** External URL - renders as <a> with target="_blank" */
  url: string;
  to?: never;
};

export type LinkProps = InternalLinkProps | ExternalLinkProps;

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(({ variant, underline, className, style, ...props }, ref) => {
  const classes = linkVariants({ variant, underline, className });

  // External link
  if ('url' in props && props.url) {
    const { url, children, ...rest } = props;
    return (
      <a ref={ref} href={url} target='_blank' rel='noopener noreferrer' className={classes} style={style} {...rest}>
        {children}
      </a>
    );
  }

  // Internal link
  const { children, ...rest } = props as InternalLinkProps;
  return (
    <TanStackLink ref={ref} className={classes} style={style} {...rest}>
      {children}
    </TanStackLink>
  );
});

Link.displayName = 'Link';
