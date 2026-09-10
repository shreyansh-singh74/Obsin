import { isImagePath, getMimeType } from '@/utils/assets';

/** Common attachment folder names used by Obsidian vaults. */
const ATTACHMENT_FOLDER_HINTS = [
  'Attachments',
  'attachments',
  'Assets',
  'assets',
  'Images',
  'images',
  'Media',
  'media',
  'Files',
  'files',
];

/**
 * Resolves an image reference from markdown to a full GitHub raw URL.
 * Handles:
 * - Absolute URLs (http/https) → pass through
 * - Relative paths (./image.png, ../assets/photo.jpg) → resolve against note path
 * - Root-relative paths (/assets/image.png) → resolve from repo root
 * - Wiki-image embeds (![[image.png]]) → resolve from repo root
 *
 * This is the *heuristic* fallback used when the vault asset index cannot
 * resolve a reference. Prefer `resolveVaultImagePath` (asset index) first.
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
    // Bare filename: try note directory first, then common attachment folders
    const noteDir = notePath.includes('/') ? notePath.substring(0, notePath.lastIndexOf('/')) : '';
    resolvedPath = noteDir ? `${noteDir}/${cleanSrc}` : cleanSrc;
  }

  return buildAssetFetchUrls(owner, repo, branch, resolvedPath)[0];
}

/**
 * Returns multiple candidate URLs for a bare filename reference.
 * Tries the note directory first, then common attachment folder locations.
 */
export function resolveImageUrlCandidates(
  rawSrc: string,
  ctx: ImageResolveContext
): string[] {
  // Already an absolute URL — pass through
  if (rawSrc.startsWith('http://') || rawSrc.startsWith('https://')) {
    return [rawSrc];
  }

  // Data URI — pass through
  if (rawSrc.startsWith('data:')) {
    return [rawSrc];
  }

  const { owner, repo, branch, notePath } = ctx;

  // Strip wiki-image embed wrapper if present: ![[image.png]] → image.png
  const cleanSrc = rawSrc.replace(/^!\[\[|\]\]$/g, '').trim();

  // For relative/root-relative paths, only one candidate
  if (cleanSrc.startsWith('/') || cleanSrc.includes('/') || cleanSrc.startsWith('./') || cleanSrc.startsWith('../')) {
    let resolvedPath: string;
    if (cleanSrc.startsWith('/')) {
      resolvedPath = cleanSrc.slice(1);
    } else {
      const noteDir = notePath.includes('/') ? notePath.substring(0, notePath.lastIndexOf('/')) : '';
      resolvedPath = resolveRelativePath(noteDir, cleanSrc);
    }
    return buildAssetFetchUrls(owner, repo, branch, resolvedPath);
  }

  // Bare filename: try multiple locations
  const candidates: string[] = [];
  const noteDir = notePath.includes('/') ? notePath.substring(0, notePath.lastIndexOf('/')) : '';

  // 1. Same directory as the note
  if (noteDir) {
    candidates.push(...buildAssetFetchUrls(owner, repo, branch, `${noteDir}/${cleanSrc}`));
  }

  // 2. Common attachment folders at repo root
  for (const folder of ATTACHMENT_FOLDER_HINTS) {
    candidates.push(...buildAssetFetchUrls(owner, repo, branch, `${folder}/${cleanSrc}`));
  }

  // 3. Attachment folders one level up from the note
  if (noteDir) {
    const parentDir = noteDir.includes('/') ? noteDir.substring(0, noteDir.lastIndexOf('/')) : '';
    if (parentDir) {
      for (const folder of ATTACHMENT_FOLDER_HINTS) {
        candidates.push(...buildAssetFetchUrls(owner, repo, branch, `${parentDir}/${folder}/${cleanSrc}`));
      }
    }
  }

  // 4. Bare filename at root (last resort)
  candidates.push(...buildAssetFetchUrls(owner, repo, branch, cleanSrc));

  return candidates;
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
 * Builds ordered fetch URL candidates for a repo-relative asset path.
 *
 * 1. `media.githubusercontent.com/media/...` — GitHub's raw media host. It honors
 *    the `Authorization` header, so it works for **private** repositories too.
 * 2. `raw.githubusercontent.com/...` — classic raw host; fallback for edge cases
 *    where the media host is unavailable.
 *
 * Neither host counts against the REST API rate limit.
 */
export function buildAssetFetchUrls(owner: string, repo: string, branch: string, path: string): string[] {
  const encodedPath = path
    .split('/')
    .map((seg) => encodeURIComponent(seg))
    .join('/');

  const ownerEnc = encodeURIComponent(owner);
  const repoEnc = encodeURIComponent(repo);
  const branchEnc = encodeURIComponent(branch);

  return [
    `https://media.githubusercontent.com/media/${ownerEnc}/${repoEnc}/${branchEnc}/${encodedPath}`,
    `https://raw.githubusercontent.com/${ownerEnc}/${repoEnc}/${branchEnc}/${encodedPath}`,
  ];
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

// Re-exports kept for backwards compatibility with existing imports.
export { isImagePath as isImageUrl, getMimeType };
