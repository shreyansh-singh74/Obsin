/**
 * Resolves an image reference from markdown to a full GitHub raw URL.
 * Handles:
 * - Absolute URLs (http/https) → pass through
 * - Relative paths (./image.png, ../assets/photo.jpg) → resolve against note path
 * - Root-relative paths (/assets/image.png) → resolve from repo root
 * - Wiki-image embeds (![[image.png]]) → resolve from repo root
 */
export function resolveImageUrl(
  rawSrc: string,
  ctx: ImageResolveContext
): string {
  // Already an absolute URL — pass through
  if (rawSrc.startsWith('http://') || rawSrc.startsWith('https://')) {
    return rawSrc;
  }

  // Data URI — pass through
  if (rawSrc.startsWith('data:')) {
    return rawSrc;
  }

  const { owner, repo, branch, notePath } = ctx;

  // Strip wiki-image embed wrapper if present: ![[image.png]] → image.png
  const cleanSrc = rawSrc.replace(/^!\[\[|\]\]$/g, '').trim();

  let resolvedPath: string;

  if (cleanSrc.startsWith('/')) {
    // Root-relative: /assets/image.png
    resolvedPath = cleanSrc.slice(1);
  } else if (cleanSrc.includes('/') || cleanSrc.startsWith('./') || cleanSrc.startsWith('../')) {
    // Relative path: resolve against the note's directory
    const noteDir = notePath.includes('/') ? notePath.substring(0, notePath.lastIndexOf('/')) : '';
    resolvedPath = resolveRelativePath(noteDir, cleanSrc);
  } else {
    // Bare filename: image.png → search in same directory as note
    const noteDir = notePath.includes('/') ? notePath.substring(0, notePath.lastIndexOf('/')) : '';
    resolvedPath = noteDir ? `${noteDir}/${cleanSrc}` : cleanSrc;
  }

  // Encode path segments for GitHub raw URL
  const encodedPath = resolvedPath
    .split('/')
    .map((seg) => encodeURIComponent(seg))
    .join('/');

  return `https://raw.githubusercontent.com/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/${encodeURIComponent(branch)}/${encodedPath}`;
}

export interface ImageResolveContext {
  owner: string;
  repo: string;
  branch: string;
  /** Path of the note that contains the image reference (for relative path resolution) */
  notePath: string;
  token?: string;
}

/**
 * Resolves a relative path against a base directory.
 * Handles ./ and ../ prefixes correctly.
 */
function resolveRelativePath(baseDir: string, relativePath: string): string {
  // Normalize the relative path
  let clean = relativePath.replace(/^\.\//, '');

  const baseParts = baseDir ? baseDir.split('/') : [];
  const relParts = clean.split('/');

  const resultParts = [...baseParts];

  for (const part of relParts) {
    if (part === '..') {
      resultParts.pop();
    } else if (part !== '.') {
      resultParts.push(part);
    }
  }

  return resultParts.join('/');
}

/**
 * Strips wiki-image embed syntax from raw markdown content.
 * Converts ![[image.png]] to a standardized format for processing.
 */
export function parseWikiImageEmbed(content: string): { original: string; filename: string } | null {
  const match = content.match(/^!\[\[([^\]]+)\]\]$/);
  if (!match) return null;

  const filename = match[1].trim();
  // Strip any alias: ![[image.png|alt text]] → image.png
  const cleanFilename = filename.split('|')[0].trim();

  return { original: content, filename: cleanFilename };
}

/**
 * Checks if a URL is an image based on common extensions.
 */
export function isImageUrl(url: string): boolean {
  const imageExtensions = /\.(png|jpe?g|gif|webp|svg|bmp|ico|tiff?)$/i;
  return imageExtensions.test(url.split('?')[0].split('#')[0]);
}

/**
 * Gets the MIME type from a file extension.
 */
export function getMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const mimeMap: Record<string, string> = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    bmp: 'image/bmp',
    ico: 'image/x-icon',
    tiff: 'image/tiff',
    tif: 'image/tiff',
  };
  return mimeMap[ext] || 'application/octet-stream';
}
