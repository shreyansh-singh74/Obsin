import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Node } from 'unist';

export const remarkCallouts: Plugin = () => {
  return (tree: Node) => {
    visit(tree, 'blockquote', (node: any) => {
      if (!node.children || node.children.length === 0) return;

      const firstParagraph = node.children[0];
      if (firstParagraph.type !== 'paragraph' || !firstParagraph.children || firstParagraph.children.length === 0) return;

      const firstTextNode = firstParagraph.children[0];
      if (firstTextNode.type !== 'text' || typeof firstTextNode.value !== 'string') return;

      const calloutMatch = firstTextNode.value.match(/^\[!([A-Za-z]+)\](?:\s+(.*))?/);
      if (!calloutMatch) return;

      const calloutType = calloutMatch[1].toLowerCase();
      const calloutTitle = calloutMatch[2] ? calloutMatch[2].trim() : calloutMatch[1];

      // Remove callout header text from first paragraph
      const remainingText = firstTextNode.value.slice(calloutMatch[0].length).replace(/^\n/, '');
      if (remainingText.trim()) {
        firstTextNode.value = remainingText;
      } else {
        firstParagraph.children.shift();
      }

      node.data = {
        hName: 'div',
        hProperties: {
          className: `obsidian-callout obsidian-callout-${calloutType}`,
          'data-callout-type': calloutType,
          'data-callout-title': calloutTitle,
        },
      };
    });
  };
};
