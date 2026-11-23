import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';

const prose =
  'prose prose-slate max-w-none prose-headings:font-bold prose-headings:text-primary prose-a:text-brand-dark prose-strong:text-primary prose-li:marker:text-brand';

/** Renders stored Markdown safely — raw HTML is skipped, never injected. */
export default function Markdown({ children, className }) {
  if (!children) return null;
  return (
    <div className={cn(prose, className)}>
      <ReactMarkdown
        skipHtml
        components={{
          a: ({ href = '', children: text }) =>
            href.startsWith('/') ? (
              <Link to={href}>{text}</Link>
            ) : (
              <a href={href} target="_blank" rel="noopener noreferrer">
                {text}
              </a>
            ),
          img: () => null,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
