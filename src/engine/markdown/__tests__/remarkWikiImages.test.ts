import { describe, it, expect } from 'vitest';
import { remarkWikiImages } from '../remarkWikiImages';
import type { Node } from 'unist';

/** Minimal mdast builder — avoids depending on remark's parser for these unit tests. */
function tree(nodes: any[]): Node {
  return { type: 'root', children: nodes } as unknown as Node;
}

function textNode(value: string): any {
  return { type: 'text', value };
}

function paragraph(children: any[]): any {
  return { type: 'paragraph', children };
}

function run(nodes: any[]): any {
  const plugin = (remarkWikiImages as any)();
  const t = tree(nodes);
  plugin(t);
  return t;
}

describe('remarkWikiImages', () => {
  it('transforms a standalone paragraph embed into a block image node', () => {
    const result = run([paragraph([textNode('![[Pasted image 1.png]]')])]);

    expect(result.children).toHaveLength(1);
    const para = result.children[0];
    const img = para.children[0];
    expect(img.type).toBe('wikiImage');
    expect(img.data.hName).toBe('img');
    expect(img.data.hProperties['data-wiki-image']).toBe('Pasted image 1.png');
    expect(img.data.hProperties['data-wiki-image-alt']).toBe('Pasted image 1.png');
    expect(img.data.hProperties.className).toContain('wiki-image-block');
  });

  it('parses alt text aliases', () => {
    const result = run([paragraph([textNode('![[img.png|My screenshot]]')])]);
    const props = result.children[0].children[0].data.hProperties;
    expect(props['data-wiki-image']).toBe('img.png');
    expect(props['data-wiki-image-alt']).toBe('My screenshot');
  });

  it('parses Obsidian size syntax as width', () => {
    const result = run([paragraph([textNode('![[img.png|250]]')])]);
    const props = result.children[0].children[0].data.hProperties;
    expect(props['data-wiki-image-width']).toBe('250');
    // Numeric alias should not become the alt text
    expect(props['data-wiki-image-alt']).toBe('img.png');
  });

  it('transforms inline embeds inside mixed text', () => {
    const result = run([paragraph([textNode('Here is a diagram ![[img.png]] in a sentence.')])]);

    expect(result.children[0].children).toHaveLength(3);
    expect(result.children[0].children[0].value).toBe('Here is a diagram ');
    expect(result.children[0].children[1].type).toBe('wikiImage');
    expect(result.children[0].children[1].data.hProperties['data-wiki-image']).toBe('img.png');
    expect(result.children[0].children[2].value).toBe(' in a sentence.');
  });

  it('handles multiple inline embeds', () => {
    const result = run([paragraph([textNode('![[a.png]] and ![[b.png]]')])]);
    const children = result.children[0].children;
    expect(children).toHaveLength(3);
    expect(children[0].type).toBe('wikiImage');
    expect(children[1].value).toBe(' and ');
    expect(children[2].type).toBe('wikiImage');
  });

  it('leaves text without wiki images untouched', () => {
    const result = run([paragraph([textNode('Just [[a wiki link]] and plain text.')])]);
    expect(result.children[0].children[0].type).toBe('text');
  });

  it('transforms embeds inside callout text nodes', () => {
    const callout = {
      type: 'paragraph',
      data: { hName: 'div', hProperties: { className: 'obsidian-callout' } },
      children: [textNode('![[chart.png]]')],
    };
    const result = run([callout]);
    expect(result.children[0].children[0].data.hProperties['data-wiki-image']).toBe('chart.png');
  });

  it('reuses the regex safely across calls (no lastIndex leaks)', () => {
    const result = run([paragraph([textNode('![[first.png]]')]), paragraph([textNode('![[second.png]]')])]);
    expect(result.children[0].children[0].data.hProperties['data-wiki-image']).toBe('first.png');
    expect(result.children[1].children[0].data.hProperties['data-wiki-image']).toBe('second.png');
  });
});
