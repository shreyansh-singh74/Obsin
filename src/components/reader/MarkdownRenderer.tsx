import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeSlug from 'rehype-slug';
import { remarkWikiLinks, remarkCallouts } from '@/engine/markdown';
import { WikiLink } from './WikiLink';
import { Callout } from './Callout';
import { Backlinks } from './Backlinks';
import 'katex/dist/katex.min.css';

interface MarkdownRendererProps {
  content: string;
  noteName: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, noteName, className = '' }) => {
  return (
    <div className={`prose ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath, remarkWikiLinks, remarkCallouts]}
        rehypePlugins={[rehypeKatex, rehypeSlug]}
        components={{
          span({ node, className: spanClass, children, ...props }) {
            // Handle WikiLinks
            if (spanClass?.includes('wikilink-item')) {
              const target = props['data-wikilink-target' as keyof typeof props] as string;
              const heading = props['data-wikilink-heading' as keyof typeof props] as string;
              return (
                <WikiLink target={target} heading={heading}>
                  {children}
                </WikiLink>
              );
            }
            return <span className={spanClass} {...props}>{children}</span>;
          },
          div({ node, className: divClass, children, ...props }) {
            // Handle Obsidian Callouts
            if (divClass?.includes('obsidian-callout')) {
              const calloutType = (props['data-callout-type' as keyof typeof props] as string) || 'note';
              const calloutTitle = (props['data-callout-title' as keyof typeof props] as string) || 'Note';
              return (
                <Callout type={calloutType} title={calloutTitle}>
                  {children}
                </Callout>
              );
            }
            return <div className={divClass} {...props}>{children}</div>;
          },
          code({ node, inline, className: codeClass, children, ...props }: any) {
            const match = /language-(\w+)/.exec(codeClass || '');
            if (!inline && match) {
              return (
                <div className="code-block-wrapper">
                  <div className="code-block-header">
                    <span>{match[1].toUpperCase()}</span>
                  </div>
                  <pre className="code-block-content">
                    <code>{children}</code>
                  </pre>
                </div>
              );
            }
            return (
              <code {...props}>
                {children}
              </code>
            );
          },
          img: ({ src, alt }) => (
            <figure className="my-6">
              <img src={src} alt={alt || ''} className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] shadow-[var(--shadow-sm)] max-w-full h-auto mx-auto block" />
              {alt && <figcaption className="text-xs text-[var(--text-muted)] text-center mt-2 font-sans italic">{alt}</figcaption>}
            </figure>
          )
        }}
      >
        {content}
      </ReactMarkdown>

      {/* Render O(1) Precomputed Backlinks */}
      <Backlinks noteName={noteName} />
    </div>
  );
};
