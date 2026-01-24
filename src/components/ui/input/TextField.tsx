import { TextField as AriaTextField, Label, Input, FieldError, Text, type TextFieldProps as AriaTextFieldProps } from 'react-aria-components';
import { tv } from 'tailwind-variants';

const textFieldVariants = tv({
  slots: {
    root: 'flex flex-col gap-1',
    label: 'text-sm text-gray-500 font-light',
    input:
      'w-full border-b border-gray-200 bg-transparent py-2 text-black placeholder:text-gray-300 outline-none focus:border-black transition-colors',
    error: 'text-sm text-red-500',
    description: 'text-xs text-gray-500',
  },
});

export interface TextFieldProps extends Omit<AriaTextFieldProps, 'children'> {
  label: string;
  placeholder?: string;
  description?: string;
  errorMessage?: string;
  className?: string;
}

export function TextField({ label, placeholder, description, errorMessage, className, ...props }: TextFieldProps) {
  const styles = textFieldVariants();

  return (
    <AriaTextField {...props} className={styles.root({ className })} isInvalid={!!errorMessage}>
      <Label className={styles.label()}>{label}</Label>
      <Input className={styles.input()} placeholder={placeholder} />
      {description && (
        <Text slot='description' className={styles.description()}>
          {description}
        </Text>
      )}
      {errorMessage && <FieldError className={styles.error()}>{errorMessage}</FieldError>}
    </AriaTextField>
  );
}
