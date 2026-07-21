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
    <div className={`prose prose-invert max-w-none prose-slate text-slate-200 ${className}`}>
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
                <div className="relative my-4 rounded-xl border border-slate-800 bg-slate-950 overflow-hidden font-mono text-xs">
                  <div className="bg-slate-900/80 px-4 py-1.5 border-b border-slate-800 text-slate-400 font-sans text-[11px] font-semibold flex items-center justify-between">
                    <span>{match[1]}</span>
                  </div>
                  <pre className="p-4 overflow-x-auto text-slate-200">
                    <code>{children}</code>
                  </pre>
                </div>
              );
            }
            return (
              <code className="bg-slate-800/80 text-indigo-300 px-1.5 py-0.5 rounded font-mono text-xs border border-slate-700/50" {...props}>
                {children}
              </code>
            );
          },
          h1: ({ children, ...props }) => (
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight mt-8 mb-4 border-b border-slate-800/80 pb-2" {...props}>
              {children}
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2 className="text-xl font-semibold text-slate-200 tracking-tight mt-6 mb-3 border-b border-slate-800/40 pb-1.5" {...props}>
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3 className="text-lg font-medium text-slate-300 mt-5 mb-2" {...props}>
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="my-3 leading-relaxed text-slate-300 font-sans text-sm">{children}</p>
          ),
          ul: ({ children }) => <ul className="my-3 ml-6 list-disc space-y-1 text-sm text-slate-300">{children}</ul>,
          ol: ({ children }) => <ol className="my-3 ml-6 list-decimal space-y-1 text-sm text-slate-300">{children}</ol>,
          blockquote: ({ children }) => (
            <blockquote className="my-4 border-l-4 border-indigo-500/60 bg-indigo-950/20 pl-4 py-2 italic text-slate-300 rounded-r-lg">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="my-4 overflow-x-auto rounded-lg border border-slate-800">
              <table className="w-full text-xs text-left text-slate-300">{children}</table>
            </div>
          ),
          th: ({ children }) => <th className="bg-slate-900 px-4 py-2.5 font-semibold text-slate-200 border-b border-slate-800">{children}</th>,
          td: ({ children }) => <td className="px-4 py-2 border-b border-slate-800/50">{children}</td>,
        }}
      >
        {content}
      </ReactMarkdown>

      {/* Render O(1) Precomputed Backlinks */}
      <Backlinks noteName={noteName} />
    </div>
  );
};
