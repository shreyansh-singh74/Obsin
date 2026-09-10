import React, { useState, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import hljs from 'highlight.js/lib/common';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeSlug from 'rehype-slug';
import { remarkWikiLinks, remarkCallouts, remarkWikiImages } from '@/engine/markdown';
import { WikiLink } from './WikiLink';
import { Copy, Check, ImageOff } from 'lucide-react';
import { Callout } from './Callout';
import { Backlinks } from './Backlinks';
import { resolveImageUrlCandidates, buildAssetFetchUrls } from '@/engine/github/images';
import { fetchAssetImage, createObjectUrl, revokeObjectUrl } from '@/engine/cache/imageCache';
import { resolveAssetPath, getAssetMeta, hasAssetIndex } from '@/db/repository/assetsRepo';
import { normalizeAssetRef } from '@/utils/assets';
import { useVaultStore } from '@/store/useVaultStore';
import { useAuthStore } from '@/store/useAuthStore';
import 'katex/dist/katex.min.css';

interface MarkdownRendererProps {
  content: string;
  notePath: string;
  noteName: string;
  className?: string;
}

type ImageState = 'loading' | 'ok' | 'error';

/**
 * Resolves an image reference against the vault asset index, fetches (and
 * caches) the bytes, and renders the result as an object URL.
 *
 * - `data:` / `http(s):` sources render directly without resolution.
 * - Vault references (`![[Pasted image ...]]`, relative paths) resolve through
 *   the asset index built during sync, falling back to path heuristics when
 *   the index has no match yet.
 */
const ResolvedImage: React.FC<{
  src: string;
  alt?: string;
  width?: string;
  block?: boolean;
  notePath: string;
}> = ({ src, alt, width, block, notePath }) => {
  const { activeVault } = useVaultStore();
  const token = useAuthStore((s) => s.token);

  const [url, setUrl] = useState<string | null>(null);
  const [state, setState] = useState<ImageState>('loading');
  const [notIndexed, setNotIndexed] = useState(false);

  useEffect(() => {
    // Direct sources need no resolution.
    if (!src) {
      setState('error');
      return;
    }
    if (src.startsWith('data:') || src.startsWith('http://') || src.startsWith('https://')) {
      setUrl(src);
      setState('ok');
      return;
    }

    if (!activeVault) {
      setState('error');
      return;
    }

    let cancelled = false;
    let objectUrl: string | null = null;

    async function resolve() {
      const { owner, repo, branch, id: vaultId } = activeVault!;
      let indexReady = false;
      try {
        // Distinguish "index missing" (needs a sync) from a true miss.
        indexReady = await hasAssetIndex(vaultId);

        // 1. Try the vault asset index (authoritative — built from the git tree).
        const resolved = await resolveAssetPath(vaultId, src, notePath);
        let path: string;
        let sha: string | null = null;
        let urls: string[];

        if (resolved) {
          path = resolved;
          const meta = await getAssetMeta(vaultId, resolved);
          sha = meta?.sha ?? null;
          urls = buildAssetFetchUrls(owner, repo, branch, path);
        } else {
          // 2. Heuristic fallback — try multiple candidate locations.
          path = normalizeAssetRef(src);
          urls = resolveImageUrlCandidates(src, { owner, repo, branch, notePath });
        }

        console.debug('[Obsin] ResolvedImage resolving:', { src, resolved, path, sha: sha?.slice(0, 8), indexReady, vaultId: vaultId.slice(0, 8) });

        const blob = await fetchAssetImage({
          vaultId,
          path,
          sha,
          urls,
          token: token || undefined,
          owner,
          repo,
          branch,
        });

        objectUrl = createObjectUrl(blob);
        if (cancelled) {
          revokeObjectUrl(objectUrl);
          return;
        }
        setUrl(objectUrl);
        setState('ok');
        console.debug('[Obsin] ResolvedImage OK:', { src, path });
      } catch (err) {
        console.warn('[Obsin] ResolvedImage FAILED:', { src, notePath, err });
        if (!cancelled) {
          setNotIndexed(!indexReady);
          setState('error');
        }
      }
    }

    resolve();
    return () => {
      cancelled = true;
      if (objectUrl) revokeObjectUrl(objectUrl);
    };
  }, [src, notePath, activeVault?.id, activeVault?.owner, activeVault?.repo, activeVault?.branch, token]);

  function handleOpen() {
    if (url && state === 'ok') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }

  if (state === 'loading') {
    return (
      <span className={block ? 'block' : 'inline-block'} style={width ? { width: `${width}px` } : undefined}>
        <span className="my-2 flex items-center justify-center p-6 rounded-[var(--radius-md)] bg-[var(--surface-card)] border border-[var(--border-subtle)] animate-pulse">
          <span className="text-xs text-[var(--text-muted)] font-mono">Loading image…</span>
        </span>
      </span>
    );
  }

  if (state === 'error') {
    return (
      <span
        className={
          'my-2 flex items-center gap-2 p-4 rounded-[var(--radius-md)] bg-[var(--surface-card)] border border-[var(--border-subtle)] ' +
          (block ? 'block' : 'inline-block max-w-full')
        }
        title={`Image not found in vault: ${src}`}
      >
        <ImageOff className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
        <span className="text-xs text-[var(--text-muted)] font-mono truncate">
          {notIndexed
            ? `Image index not built yet — re-sync this vault to resolve: ${alt || src}`
            : `Image not found in vault: ${alt || src}`}
        </span>
      </span>
    );
  }

  const img = (
    <img
      src={url!}
      alt={alt || ''}
      title={alt || src}
      onClick={handleOpen}
      onError={() => setState('error')}
      className={
        'rounded-[var(--radius-md)] border border-[var(--border-subtle)] shadow-[var(--shadow-sm)] max-w-full h-auto cursor-zoom-in ' +
        (block ? 'mx-auto block' : 'inline-block align-middle')
      }
      style={width ? { width: `${width}px` } : undefined}
      loading="lazy"
    />
  );

  if (!block) return img;

  return (
    <figure className="my-6">
      {img}
      {alt && (
        <figcaption className="text-xs text-[var(--text-muted)] text-center mt-2 font-sans italic">
          {alt}
        </figcaption>
      )}
    </figure>
  );
};

const PLAIN_TEXT_LANGUAGES = new Set(['text', 'txt', 'plain', 'plaintext']);

const LANGUAGE_ALIASES: Record<string, string> = {
  csharp: 'cs',
  html: 'xml',
  js: 'javascript',
  jsx: 'javascript',
  py: 'python',
  rb: 'ruby',
  shell: 'bash',
  sh: 'bash',
  ts: 'typescript',
  tsx: 'typescript',
};

/** CodeBlock with copy button, language label, and language-aware highlighting. */
const CodeBlock: React.FC<{ language: string; code: string }> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);
  const highlightedCode = useMemo(() => {
    const requestedLanguage = language.toLowerCase();
    if (PLAIN_TEXT_LANGUAGES.has(requestedLanguage)) return null;

    const highlightLanguage = LANGUAGE_ALIASES[requestedLanguage] ?? requestedLanguage;
    if (!hljs.getLanguage(highlightLanguage)) return null;

    return hljs.highlight(code, {
      language: highlightLanguage,
      ignoreIllegals: true,
    }).value;
  }, [code, language]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = code;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="code-block-wrapper min-w-0">
      <div className="code-block-header">
        <span>{language}</span>
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
      <pre className="code-block-content">
        {highlightedCode ? (
          <code
            className={`hljs language-${language}`}
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />
        ) : (
          <code>{code}</code>
        )}
      </pre>
    </div>
  );
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, notePath, noteName, className = '' }) => {
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
          img(props) {
            // Wiki-image embeds (![[...]]) carry their reference in data
            // attributes; regular markdown images (![alt](path)) come through
            // `src`. Both resolve through the same pipeline, always against
            // the note being rendered (notePath prop), NOT activeNotePath.
            const wikiRef = (props as any)['data-wiki-image'] as string | undefined;
            const src = wikiRef || props.src || '';
            const alt = (props.alt as string) || ((props as any)['data-wiki-image-alt'] as string) || '';
            const width = (props as any)['data-wiki-image-width'] as string | undefined;
            const className = typeof props.className === 'string' ? props.className : '';
            const block = Boolean(wikiRef) && className.includes('wiki-image-block');
            return <ResolvedImage src={src} alt={alt} width={width} block={block} notePath={notePath} />;
          },
          code({ node, inline, className: codeClass, children, ...props }: any) {
            const match = /language-([^\s]+)/.exec(codeClass || '');
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
