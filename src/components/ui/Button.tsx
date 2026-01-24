import { Button as AriaButton, type ButtonProps as AriaButtonProps } from 'react-aria-components';
import { tv, type VariantProps } from 'tailwind-variants';
import { forwardRef } from 'react';

const buttonVariants = tv({
  base: 'inline-flex items-center justify-center transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black disabled:opacity-50 disabled:pointer-events-none',
  variants: {
    variant: {
      default: 'bg-black text-white hover:bg-gray-800 px-4 py-2 text-sm',
      icon: 'bg-transparent p-2',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface ButtonProps extends AriaButtonProps, VariantProps<typeof buttonVariants> {
  className?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ variant, className, ...props }, ref) => {
  return <AriaButton ref={ref} className={buttonVariants({ variant, className })} {...props} />;
});

Button.displayName = 'Button';
