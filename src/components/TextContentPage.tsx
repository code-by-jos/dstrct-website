import { PageLayout } from '@/components/layout/PageLayout';
import { Markdown } from '@/components/ui/Markdown';
import type { TextDocument } from '@/crm/texts';

interface TextContentPageProps {
  title: string;
  content: TextDocument | null;
}

/**
 * Reusable component for text content pages (About, Contact, Privacy, etc.)
 * Renders a PageLayout with Markdown content from Sanity CMS.
 */
export function TextContentPage({ title, content }: TextContentPageProps) {
  return (
    <PageLayout title={title}>
      {content?.text && (
        <div className='mt-8 mx-auto max-w-3xl'>
          <Markdown>{content.text}</Markdown>
        </div>
      )}
    </PageLayout>
  );
}
