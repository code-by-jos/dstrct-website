import { useState, useCallback } from 'react';
import { DropZone, FileTrigger, Button, type DropItem } from 'react-aria-components';
import { tv } from 'tailwind-variants';
import { Upload, X } from 'lucide-react';
import { MAX_FILE_SIZE, ALLOWED_IMAGE_TYPES, ALLOWED_IMAGE_EXTENSIONS } from '@/constants/email';

const fileUploadVariants = tv({
  slots: {
    root: 'flex flex-col gap-1',
    label: 'text-sm text-gray-500 font-light',
    dropzone:
      'relative aspect-square border border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors hover:border-gray-400 focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 outline-none',
    dropzoneActive: 'border-black bg-gray-50',
    dropzoneFilled: 'border-solid border-gray-200',
    preview: 'relative aspect-square rounded-lg overflow-hidden bg-gray-100',
    previewImage: 'w-full h-full object-contain',
    removeButton: 'absolute top-2 right-2 p-1 bg-black/70 hover:bg-black rounded-full text-white transition-colors',
    uploadText: 'text-sm text-gray-600 font-medium',
    uploadHint: 'text-xs text-gray-500 text-center',
    error: 'text-sm text-red-500',
  },
});

export interface FileUploadProps {
  label?: string;
  value?: File | null;
  onChange: (file: File | null) => void;
  errorMessage?: string;
  className?: string;
  required?: boolean;
}

export function FileUpload({ label, value, onChange, errorMessage, className, required }: FileUploadProps) {
  const styles = fileUploadVariants();
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = useCallback(
    (file: File | null) => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      if (file) {
        // Validate file type
        if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
          return;
        }
        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
          return;
        }
        setPreviewUrl(URL.createObjectURL(file));
      } else {
        setPreviewUrl(null);
      }
      onChange(file);
    },
    [onChange, previewUrl],
  );

  const handleDrop = useCallback(
    (e: { items: DropItem[] }) => {
      const item = e.items.find((item: DropItem) => item.kind === 'file');
      if (item && 'getFile' in item) {
        (item as { getFile: () => Promise<File> }).getFile().then((file: File) => handleFileSelect(file));
      }
      setIsDragging(false);
    },
    [handleFileSelect],
  );

  const handleRemove = useCallback(() => {
    handleFileSelect(null);
  }, [handleFileSelect]);

  return (
    <div className={styles.root({ className })}>
      {label && (
        <span className={styles.label()}>
          {label}
          {required && ' *'}
        </span>
      )}

      {value && previewUrl ? (
        <div className={styles.preview()}>
          <img src={previewUrl} alt='Upload preview' className={styles.previewImage()} />
          <Button onPress={handleRemove} className={styles.removeButton()} aria-label='Remove photo'>
            <X className='w-4 h-4' />
          </Button>
        </div>
      ) : (
        <DropZone
          onDropEnter={() => setIsDragging(true)}
          onDropExit={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`${styles.dropzone()} ${isDragging ? styles.dropzoneActive() : ''} ${errorMessage ? 'border-red-500' : ''}`}
        >
          <FileTrigger
            acceptedFileTypes={[...ALLOWED_IMAGE_TYPES]}
            onSelect={(fileList) => {
              if (fileList && fileList.length > 0) {
                handleFileSelect(fileList[0]);
              }
            }}
          >
            <Button className='flex flex-col items-center gap-2 outline-none'>
              <Upload className='w-6 h-6 text-gray-600' />
              <span className={styles.uploadText()}>Upload photo</span>
            </Button>
          </FileTrigger>
          <span className={styles.uploadHint()}>{ALLOWED_IMAGE_EXTENSIONS.join(', ')} up to 10MB</span>
        </DropZone>
      )}

      {errorMessage && <p className={styles.error()}>{errorMessage}</p>}
    </div>
  );
}
