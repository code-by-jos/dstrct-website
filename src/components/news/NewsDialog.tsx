import type { KeyboardEventHandler, ReactNode } from 'react';
import { useLocation, useNavigate, useRouter } from '@tanstack/react-router';
import { Dialog, Modal, ModalOverlay } from 'react-aria-components';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface NewsDialogProps {
  title: string;
  children: ReactNode;
  onKeyDown?: KeyboardEventHandler<HTMLElement>;
}

export function NewsDialog({ title, children, onKeyDown }: NewsDialogProps) {
  const router = useRouter();
  const navigate = useNavigate();
  const location = useLocation();
  const fromListing = location.state.newsGallery;
  const listingPath = location.pathname.startsWith('/runway/') ? '/runway' : '/news';

  function close() {
    if (fromListing) {
      router.history.back();
    } else {
      // A direct link has no news listing behind it in browser history.
      void navigate({ to: listingPath, replace: true, resetScroll: false });
    }
  }

  return (
    <ModalOverlay
      isOpen
      isDismissable
      onOpenChange={(isOpen) => {
        if (!isOpen) close();
      }}
      className='fixed inset-0 z-200 flex items-center justify-center bg-black/70 p-3 md:p-8'
    >
      <Modal className='max-h-[94dvh] w-full max-w-350 overflow-y-auto bg-white shadow-2xl outline-none'>
        <Dialog aria-label={title} className='relative outline-none'>
          <div onKeyDown={onKeyDown}>
            <div className='sticky top-0 z-10 flex justify-end border-b border-gray-100 bg-white px-3 py-2'>
              <Button
                variant='icon'
                onPress={close}
                aria-label='Close news post'
                autoFocus
                className='rounded-full hover:bg-stone-100 focus-visible:bg-stone-200 focus-visible:ring-0 focus-visible:ring-offset-0'
              >
                <X className='h-6 w-6' />
              </Button>
            </div>
            {children}
          </div>
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
