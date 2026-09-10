import { describe, expect, it, vi } from 'vitest';
import { parseFrontmatter } from '../markdown';

describe('parseFrontmatter security limits', () => {
  it('parses normal Obsidian frontmatter with the restricted schema', () => {
    const parsed = parseFrontmatter(`---
title: Safe note
tags:
  - security
aliases: [Audit]
---
Body`);

    expect(parsed).toEqual({
      title: 'Safe note',
      tags: ['security'],
      aliases: ['Audit'],
      body: 'Body',
    });
  });

  it('rejects YAML-specific collection tags', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const parsed = parseFrontmatter(`---
tags: !!omap
  - dangerous: value
---
Body`);

    expect(parsed).toEqual({ tags: [], aliases: [], body: 'Body' });
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('skips oversized frontmatter before parsing', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const parsed = parseFrontmatter(`---
title: ${'a'.repeat(64 * 1024)}
---
Body`);

    expect(parsed).toEqual({ tags: [], aliases: [], body: 'Body' });
    expect(warn).toHaveBeenCalledWith('Skipping oversized frontmatter YAML');
    warn.mockRestore();
  });
});
