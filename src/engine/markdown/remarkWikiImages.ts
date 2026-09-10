import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Node } from 'unist';

/**
 * Remark plugin to intercept Obsidian wiki-image embed syntax: ![[image.png]]
 * and convert them to img elements with data attributes for the React renderer.
 *
 * Handles:
 * - ![[image.png]]                → embed with filename as alt
 * - ![[image.png|alt text]]       → embed with alt text
 * - ![[image.png|250]]            → embed with 250px width (Obsidian size syntax)
 * - ![[Attachments/foo.png]]      → path references (resolved via the asset index)
 *
 * The reference is stored in `data-wiki-image`; `MarkdownRenderer` resolves it
 * against the vault asset index and fetches the bytes.
 */
export const remarkWikiImages: Plugin = () => {
  const wikiImageRegex = /!\[\[([^\]|]+?)(?:\|([^\]]*))?\]\]/g;

  const transform = (text: string): any[] | null => {
    wikiImageRegex.lastIndex = 0;
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    const children: any[] = [];
    let found = false;

    while ((match = wikiImageRegex.exec(text)) !== null) {
      found = true;
      const matchStart = match.index;
      const matchEnd = wikiImageRegex.lastIndex;

      if (matchStart > lastIndex) {
        children.push({ type: 'text', value: text.slice(lastIndex, matchStart) });
      }

      const rawRef = match[1].trim();
      const aliasOrSize = match[2]?.trim() || '';

      // Obsidian size syntax: the alias is purely numeric → width in px.
      const isSize = /^\d+$/.test(aliasOrSize);
      const width = isSize ? aliasOrSize : null;
      const alt = aliasOrSize && !isSize ? aliasOrSize : rawRef;

      children.push({
        type: 'wikiImage',
        data: {
          hName: 'img',
          hProperties: {
            className: 'wiki-image-embed',
            'data-wiki-image': rawRef,
            'data-wiki-image-alt': alt,
            ...(width ? { 'data-wiki-image-width': width } : {}),
            src: '',
            alt,
          },
        },
      });

      lastIndex = matchEnd;
    }

    if (lastIndex < text.length) {
      children.push({ type: 'text', value: text.slice(lastIndex) });
    }

    return found ? children : null;
  };

  return (tree: Node) => {
    // 1. Whole-paragraph embeds: unwrap the paragraph so the image renders as
    //    a block figure (styling and figcaption behave better).
    visit(tree, 'paragraph', (node: any) => {
      if (!node.children || node.children.length !== 1) return;
      const only = node.children[0];
      if (only.type === 'text' && /^!\[\[[^\]]+\]\]$/.test((only.value || '').trim())) {
        const children = transform((only.value || '').trim());
        if (children && children.length === 1) {
          // Mark as a block embed so the renderer wraps it in a figure.
          children[0].data.hProperties.className = 'wiki-image-embed wiki-image-block';
          node.children = children;
        }
      }
    });

    // 2. Inline occurrences inside mixed text nodes (callouts, list items, sentences).
    visit(tree, 'text', (node: any, index: number | null, parent: any) => {
      if (!node.value || typeof node.value !== 'string') return;
      if (!node.value.includes('![[')) return;

      const children = transform(node.value);
      if (!children) return;

      if (parent && typeof index === 'number') {
        parent.children.splice(index, 1, ...children);
      }
    });
  };
};
