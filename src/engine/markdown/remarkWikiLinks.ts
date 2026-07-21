import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Node } from 'unist';

export const remarkWikiLinks: Plugin = () => {
  return (tree: Node) => {
    visit(tree, 'text', (node: any, index, parent: any) => {
      if (!node.value || typeof node.value !== 'string') return;

      const wikiLinkRegex = /\[\[([^\]|#]+)(?:#([^\]|]+))?(?:\|([^\]]+))?\]\]/g;
      const text = node.value;
      const children: any[] = [];
      let lastIndex = 0;
      let match: RegExpExecArray | null;

      while ((match = wikiLinkRegex.exec(text)) !== null) {
        const matchStart = match.index;
        const matchEnd = wikiLinkRegex.lastIndex;

        // Push text before match
        if (matchStart > lastIndex) {
          children.push({
            type: 'text',
            value: text.slice(lastIndex, matchStart),
          });
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

      if (children.length > 0) {
        if (lastIndex < text.length) {
          children.push({
            type: 'text',
            value: text.slice(lastIndex),
          });
        }

        // Replace node in parent with parsed children
        parent.children.splice(index, 1, ...children);
      }
    });
  };
};
