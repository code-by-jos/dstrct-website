import { ComponentPropsWithoutRef, createElement } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';

type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

const headingVariants = tv({
  base: 'font-helvetica font-serif',
  variants: {
    size: {
      h1: 'text-5xl md:text-8xl font-medium',
      h2: 'text-4xl md:text-6xl font-normal',
      h3: 'text-3xl md:text-5xl font-light',
      h4: 'text-2xl md:text-4xl font-light',
      h5: 'text-xl md:text-3xl font-extralight',
      h6: 'text-lg md:text-2xl font-extralight',
    },
    variant: {
      default: '',
      title: 'text-center mt-4 mb-16 md:mt-32',
    },
  },
  defaultVariants: {
    size: 'h2',
    variant: 'default',
  },
});

interface HeadingProps extends ComponentPropsWithoutRef<'h1'>, VariantProps<typeof headingVariants> {
  as?: HeadingLevel;
}

export function Heading({ size, variant, className, children, ...props }: HeadingProps) {
  return createElement(
    size || 'h2',
    {
      className: headingVariants({ size, variant, className }),
      ...props,
    },
    children,
  );
}
