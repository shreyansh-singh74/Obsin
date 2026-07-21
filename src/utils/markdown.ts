import yaml from 'js-yaml';

export interface ParsedFrontmatter {
  title?: string;
  tags: string[];
  aliases: string[];
  body: string;
}

/**
 * Parses YAML frontmatter from raw markdown content safely without Buffer dependence.
 */
export function parseFrontmatter(rawContent: string): ParsedFrontmatter {
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;
  const match = rawContent.match(frontmatterRegex);

  if (!match) {
    return {
      tags: [],
      aliases: [],
      body: rawContent,
    };
  }

  const yamlText = match[1];
  const body = rawContent.slice(match[0].length);

  try {
    const data = yaml.load(yamlText) as Record<string, unknown> | null;
    if (!data || typeof data !== 'object') {
      return { tags: [], aliases: [], body };
    }

    const title = typeof data.title === 'string' ? data.title : undefined;

    // Parse tags (can be array or string space/comma separated)
    let tags: string[] = [];
    if (Array.isArray(data.tags)) {
      tags = data.tags.map((t) => String(t).replace(/^#/, ''));
    } else if (typeof data.tags === 'string') {
      tags = data.tags
        .split(/[\s,]+/)
        .map((t) => t.replace(/^#/, ''))
        .filter(Boolean);
    }

    // Parse aliases (can be array or string)
    let aliases: string[] = [];
    if (Array.isArray(data.aliases)) {
      aliases = data.aliases.map((a) => String(a));
    } else if (typeof data.aliases === 'string') {
      aliases = data.aliases.split(/[\s,]+/).filter(Boolean);
    }

    return { title, tags, aliases, body };
  } catch (err) {
    console.warn('Failed to parse frontmatter YAML:', err);
    return { tags: [], aliases: [], body };
  }
}

/**
 * Extracts markdown headings (# Title, ## Section) for FlexSearch deep indexing.
 */
export function extractHeadings(markdown: string): string[] {
  const headings: string[] = [];
  const headingRegex = /^#{1,6}\s+(.+)$/gm;
  let match: RegExpExecArray | null;

  while ((match = headingRegex.exec(markdown)) !== null) {
    const cleanHeading = match[1].replace(/[*_~`]/g, '').trim();
    if (cleanHeading) {
      headings.push(cleanHeading);
    }
  }

  return headings;
}
