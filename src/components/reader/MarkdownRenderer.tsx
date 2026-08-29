import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeSlug from 'rehype-slug';
import { remarkWikiLinks, remarkCallouts, remarkWikiImages } from '@/engine/markdown';
import { WikiLink } from './WikiLink';
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
        }}
      >
        {content}
      </ReactMarkdown>

      {/* Render O(1) Precomputed Backlinks */}
      <Backlinks noteName={noteName} />
    </div>
  );
};
