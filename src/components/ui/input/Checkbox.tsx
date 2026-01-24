import { Checkbox as AriaCheckbox, type CheckboxProps as AriaCheckboxProps } from 'react-aria-components';
import { tv } from 'tailwind-variants';
import { Check } from 'lucide-react';

const checkboxVariants = tv({
  slots: {
    root: 'flex items-start gap-3 group cursor-pointer',
    box: 'w-5 h-5 border border-gray-300 rounded flex items-center justify-center shrink-0 mt-0.5 transition-colors group-focus-visible:ring-2 group-focus-visible:ring-black group-focus-visible:ring-offset-2',
    check: 'w-3.5 h-3.5 text-white opacity-0 transition-opacity',
    label: 'text-sm text-gray-500 select-none',
  },
  variants: {
    isSelected: {
      true: {
        box: 'bg-black border-black',
        check: 'opacity-100',
      },
    },
    isInvalid: {
      true: {
        box: 'border-red-500',
        label: 'text-red-500',
      },
    },
  },
});

export interface CheckboxProps extends Omit<AriaCheckboxProps, 'children'> {
  children: React.ReactNode;
  errorMessage?: string;
  className?: string;
}

export function Checkbox({ children, errorMessage, className, ...props }: CheckboxProps) {
  return (
    <div className={className}>
      <AriaCheckbox {...props} className='outline-none'>
        {({ isSelected }) => {
          const styles = checkboxVariants({ isSelected, isInvalid: !!errorMessage });
          return (
            <span className={styles.root()}>
              <span className={styles.box()}>
                <Check className={styles.check()} strokeWidth={3} />
              </span>
              <span className={styles.label()}>{children}</span>
            </span>
          );
        }}
      </AriaCheckbox>
      {errorMessage && <p className='text-sm text-red-500 mt-1'>{errorMessage}</p>}
    </div>
  );
}
