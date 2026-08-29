import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Node } from 'unist';

/**
 * Remark plugin to intercept Obsidian wiki-image embed syntax: ![[image.png]]
 * and convert them to HTML img elements with data attributes for the React renderer.
 *
 * Also handles: ![[image.png|alt text]]
 */
export const remarkWikiImages: Plugin = () => {
  return (tree: Node) => {
    visit(tree, 'paragraph', (node: any) => {
      if (!node.children || node.children.length === 0) return;

      const newChildren: any[] = [];
      let modified = false;

      for (const child of node.children) {
        // Check for inline code or text that might contain wiki-image syntax
        if (child.type === 'text' || child.type === 'inlineCode') {
          const text = child.value || '';
          // Match ![[filename.ext]] or ![[filename.ext|alt text]]
          const wikiImageRegex = /!\[\[([^\]|]+?)(?:\|([^\]]*))?\]\]/g;
          let lastIndex = 0;
          let match: RegExpExecArray | null;

          while ((match = wikiImageRegex.exec(text)) !== null) {
            modified = true;
            const matchStart = match.index;
            const matchEnd = wikiImageRegex.lastIndex;

            // Push text before match
            if (matchStart > lastIndex) {
              newChildren.push({
                type: 'text',
                value: text.slice(lastIndex, matchStart),
              });
            }

            const filename = match[1].trim();
            const altText = match[2]?.trim() || filename;

            // Create an image node
            newChildren.push({
              type: 'wikiImage',
              data: {
                hName: 'img',
                hProperties: {
                  className: 'wiki-image-embed',
                  'data-wiki-image': filename,
                  'data-wiki-image-alt': altText,
                  src: '', // Will be resolved by React renderer
                  alt: altText,
                },
              },
            });

            lastIndex = matchEnd;
          }

          // Push remaining text
          if (lastIndex < text.length) {
            newChildren.push({
              type: 'text',
              value: text.slice(lastIndex),
            });
          }
        } else {
          // Keep other children as-is
          newChildren.push(child);
        }
      }

      if (modified) {
        node.children = newChildren;
      }
    });
  };
};
