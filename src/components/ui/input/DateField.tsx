import {
  DateInput,
  DateSegment,
  Label,
  FieldError,
  DateField as AriaDateField,
  type DateFieldProps as AriaDateFieldProps,
  type DateValue,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

const dateFieldVariants = tv({
  slots: {
    root: 'flex flex-col gap-1',
    label: 'text-sm text-gray-500 font-light',
    inputWrapper: 'flex border-b border-gray-200 bg-transparent py-2 outline-none focus-within:border-black transition-colors',
    segment: 'rounded px-0.5 outline-none focus:bg-black focus:text-white tabular-nums',
    literal: 'text-gray-500',
    error: 'text-sm text-red-500',
  },
});

export interface DateFieldProps extends Omit<AriaDateFieldProps<DateValue>, 'children'> {
  label: string;
  errorMessage?: string;
  className?: string;
}

export function DateField({ label, errorMessage, className, ...props }: DateFieldProps) {
  const styles = dateFieldVariants();

  return (
    <AriaDateField {...props} className={styles.root({ className })} isInvalid={!!errorMessage}>
      <Label className={styles.label()}>{label}</Label>
      <DateInput className={styles.inputWrapper()}>
        {(segment) => <DateSegment segment={segment} className={segment.type === 'literal' ? styles.literal() : styles.segment()} />}
      </DateInput>
      {errorMessage && <FieldError className={styles.error()}>{errorMessage}</FieldError>}
    </AriaDateField>
  );
}
