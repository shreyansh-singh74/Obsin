import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Node } from 'unist';

const WIKI_IMAGE_EMBED = /!\[\[[^\]]*\]\]/g;
const WIKI_LINK = /\[\[([^\]|#]+)(?:#([^\]|]+))?(?:\|([^\]]+))?\]\]/g;

/**
 * Splits a text node's value into segments around `![[...]]` embeds so that
 * wiki-LINK parsing (`[[...]]`) never consumes the brackets of an image embed.
 */
function splitAroundWikiImages(text: string): { segment: string; isEmbed: boolean }[] {
  const segments: { segment: string; isEmbed: boolean }[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  WIKI_IMAGE_EMBED.lastIndex = 0;

  while ((match = WIKI_IMAGE_EMBED.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ segment: text.slice(lastIndex, match.index), isEmbed: false });
    }
    segments.push({ segment: match[0], isEmbed: true });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    segments.push({ segment: text.slice(lastIndex), isEmbed: false });
  }
  return segments.length > 0 ? segments : [{ segment: text, isEmbed: false }];
}

export const remarkWikiLinks: Plugin = () => {
  return (tree: Node) => {
    visit(tree, 'text', (node: any, index, parent: any) => {
      if (!node.value || typeof node.value !== 'string') return;
      if (!node.value.includes('[[')) return;

      const text = node.value;

      // Contains `![[...]]` embeds: parse links segment-by-segment so the
      // embeds are preserved verbatim for remarkWikiImages (which runs after
      // this plugin).
      if (text.includes('![[')) {
        const segments = splitAroundWikiImages(text);
        const hasLinks = segments.some((s) => !s.isEmbed && s.segment.includes('[['));
        const hasEmbeds = segments.some((s) => s.isEmbed);

        if (hasEmbeds && !hasLinks) {
          // Nothing to parse — leave the node untouched for remarkWikiImages.
          return;
        }

        if (hasLinks) {
          const children: any[] = [];
          for (const seg of segments) {
            if (seg.isEmbed) {
              children.push({ type: 'text', value: seg.segment });
              continue;
            }
            const segNodes = parseWikiLinksInText(seg.segment);
            children.push(...segNodes);
          }

          if (parent && typeof index === 'number') {
            parent.children.splice(index, 1, ...children);
          }
        }
        return;
      }

      // Plain wiki links only.
      const children = parseWikiLinksInText(text);
      if (children.length > 0 && parent && typeof index === 'number') {
        parent.children.splice(index, 1, ...children);
      }
    });
  };
};

/** Parses `[[Note]]`, `[[Note#heading]]`, `[[Note|alias]]` in a text value. */
function parseWikiLinksInText(text: string): any[] {
  if (!text.includes('[[')) return text ? [{ type: 'text', value: text }] : [];

  const children: any[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  WIKI_LINK.lastIndex = 0;

  while ((match = WIKI_LINK.exec(text)) !== null) {
    const matchStart = match.index;
    const matchEnd = WIKI_LINK.lastIndex;

    if (matchStart > lastIndex) {
      children.push({ type: 'text', value: text.slice(lastIndex, matchStart) });
    }

    const rawTarget = match[1].trim();
    const headingAnchor = match[2] ? match[2].trim() : undefined;
    const displayText = match[3] ? match[3].trim() : rawTarget;

    children.push({
      type: 'wikiLink',
      data: {
        hName: 'span',
        hProperties: {
          className: 'wikilink-item',
          'data-wikilink-target': rawTarget,
          'data-wikilink-heading': headingAnchor || '',
        },
      },
      children: [
        {
          type: 'text',
          value: displayText,
        },
      ],
    });

    lastIndex = matchEnd;
  }

  if (lastIndex < text.length) {
    children.push({ type: 'text', value: text.slice(lastIndex) });
  }

  return children.length > 0 ? children : [{ type: 'text', value: text }];
}
