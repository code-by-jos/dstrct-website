import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';

interface MarkdownProps {
  children: string;
}

export function Markdown({ children }: MarkdownProps) {
  return (
    <div className='markdown'>
      <ReactMarkdown remarkPlugins={[remarkBreaks, remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}
