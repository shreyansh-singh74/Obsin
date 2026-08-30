import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeSlug from 'rehype-slug';
import { remarkWikiLinks, remarkCallouts, remarkWikiImages } from '@/engine/markdown';
import { WikiLink } from './WikiLink';
import { Copy, Check } from 'lucide-react';
import { Callout } from './Callout';
import { Backlinks } from './Backlinks';
import { resolveImageUrl, type ImageResolveContext } from '@/engine/github/images';
import { fetchCachedImage } from '@/engine/cache/imageCache';
import { useVaultStore } from '@/store/useVaultStore';
import { useAuthStore } from '@/store/useAuthStore';
import 'katex/dist/katex.min.css';

interface MarkdownRendererProps {
  content: string;
  notePath: string;
  noteName: string;
  className?: string;
}

/**
 * Resolves and caches an image URL, returning a data URL or the original URL.
 */function useResolvedImage(src: string, ctx: ImageResolveContext | null): string {
  const [resolvedSrc, setResolvedSrc] = useState<string>('');

  useEffect(() => {
    if (!src || !ctx) {
      setResolvedSrc(src);
      return;
    }

    // Skip data URIs and absolute URLs that don't need resolution
    if (src.startsWith('data:') || src.startsWith('http://') || src.startsWith('https://')) {
      setResolvedSrc(src);
      return;
    }

    let cancelled = false;
    const { owner, repo, branch, notePath, token } = ctx;

    async function resolve() {
      try {
        const fullUrl = resolveImageUrl(src, { owner, repo, branch, notePath, token });
        const cachedDataUrl = await fetchCachedImage(fullUrl, token);
        if (!cancelled) {
          setResolvedSrc(cachedDataUrl);
        }
      } catch (err) {
        console.warn('Failed to resolve image:', src, err);
        if (!cancelled) {
          // Fallback to direct URL
          setResolvedSrc(resolveImageUrl(src, { owner, repo, branch, notePath, token }));
        }
      }
    }

    resolve();
    return () => { cancelled = true; };
  }, [src, ctx?.owner, ctx?.repo, ctx?.branch, ctx?.notePath]);

  return resolvedSrc;
}

/**
 * ResolvedImage component that handles async image loading with caching.
 */const ResolvedImage: React.FC<{ src: string; alt?: string }> = ({ src, alt }) => {
  const { activeVault } = useVaultStore();
  const token = useAuthStore((s) => s.token);
  const activeNotePath = useVaultStore((s) => s.activeNotePath);

  const ctx: ImageResolveContext | null = activeVault && activeNotePath
    ? {
        owner: activeVault.owner,
        repo: activeVault.repo,
        branch: activeVault.branch,
        notePath: activeNotePath,
        token: token || undefined,
      }
    : null;

  const resolvedSrc = useResolvedImage(src, ctx);

  if (!resolvedSrc) {
    return (
      <div className="my-6 flex items-center justify-center p-8 rounded-[var(--radius-md)] bg-[var(--surface-card)] border border-[var(--border-subtle)]">
        <span className="text-xs text-[var(--text-muted)] font-mono">Loading image...</span>
      </div>
    );
  }

  return (
    <figure className="my-6">
      <img
        src={resolvedSrc}
        alt={alt || ''}
        className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] shadow-[var(--shadow-sm)] max-w-full h-auto mx-auto block cursor-zoom-in"
        loading="lazy"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.alt = `Failed to load: ${alt || src}`;
          target.classList.add('opacity-50');
        }}
      />
      {alt && <figcaption className="text-xs text-[var(--text-muted)] text-center mt-2 font-sans italic">{alt}</figcaption>}
    </figure>
  );
};


/** CodeBlock with copy button and language label */
const CodeBlock: React.FC<{ language: string; code: string }> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = code;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="my-4 rounded-[var(--radius-md)] border border-[var(--border-subtle)] overflow-hidden bg-[#0d0d0d]">
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[var(--surface-card)] border-b border-[var(--border-subtle)]">
        <span className="text-[10px] font-mono font-semibold text-[var(--text-muted)] uppercase tracking-wider">
          {language}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
          title="Copy code"
        >
          {copied ? (
            <><Check className="w-3 h-3 text-emerald-400" /> <span className="text-emerald-400">Copied</span></>
          ) : (
            <><Copy className="w-3 h-3" /> Copy</>
          )}
        </button>
      </div>
      {/* Code content */}
      <pre className="p-4 overflow-x-auto text-[13px] leading-relaxed font-mono text-[var(--text-secondary)]">
        <code>{code}</code>
      </pre>
    </div>
  );
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, noteName, className = '' }) => {
  return (
    <div className={`prose ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath, remarkWikiLinks, remarkCallouts, remarkWikiImages]}
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
          img({ src, alt }) {
            // Use ResolvedImage for all images (handles relative paths + caching)
            return <ResolvedImage src={src || ''} alt={alt || ''} />;
          },
          code({ node, inline, className: codeClass, children, ...props }: any) {
            const match = /language-(\w+)/.exec(codeClass || '');
            if (!inline && match) {
              const codeText = String(children).replace(/\n$/, '');
              return <CodeBlock language={match[1]} code={codeText} />;
            }
            // Inline code
            return (
              <code className="px-1.5 py-0.5 rounded-md bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--accent-text)] font-mono text-[0.85em]" {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>

      {/* Render O(1) Precomputed Backlinks */}
      <Backlinks noteName={noteName} />
    </div>
  );
};
