/**
 * Pure helpers for matching Obsidian image references (e.g. `![[Pasted image ...png]]`)
 * against the list of asset paths that exist in a vault.
 *
 * No Dexie, React, or network dependencies — fully unit-testable.
 */

const IMAGE_EXTENSIONS = /\.(png|jpe?g|gif|webp|svg|bmp|ico|tiff?|avif)$/i;

/** Asset-like folder names used by common vault setups (Obsidian defaults included). */
const ATTACHMENT_FOLDER_HINTS = [
  'attachments',
  'attachment',
  'assets',
  'images',
  'img',
  'media',
  'files',
  'static',
  'pasted',
];

export function isImagePath(path: string): boolean {
  return IMAGE_EXTENSIONS.test(path.split('?')[0].split('#')[0]);
}

export function getMimeType(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase() || '';
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
    avif: 'image/avif',
  };
  return mimeMap[ext] || 'application/octet-stream';
}

/**
 * Normalizes a raw image reference for matching:
 * strips the wiki-embed wrapper, decodes URL encoding, strips leading ./ and /.
 */
export function normalizeAssetRef(ref: string): string {
  let clean = ref.trim();
  // Strip wiki-image embed wrapper if the caller passed it raw: ![[image.png]] → image.png
  clean = clean.replace(/^!\[\[/, '').replace(/\]\]$/, '').trim();
  // Decode URL-encoded characters (e.g. %20 → space). Keep raw on malformed encoding.
  try {
    clean = decodeURIComponent(clean);
  } catch {
    // Malformed percent-encoding — fall back to the raw value.
  }
  // Strip leading ./ and / prefixes for matching purposes.
  clean = clean.replace(/^\.?\//, '');
  return clean.trim();
}

/** Directory part of a note path: "0. DSA/Note.md" → "0. DSA", "Note.md" → "" */
export function noteDirOf(notePath: string): string {
  return notePath.includes('/') ? notePath.slice(0, notePath.lastIndexOf('/')) : '';
}

/** Last path segment: "Attachments/foo.png" → "foo.png" */
export function basename(path: string): string {
  const parts = path.split('/');
  return parts[parts.length - 1] || path;
}

/** Resolves a note-relative reference against a note directory, handling ../ and ./ */
export function resolveRelativeRef(noteDir: string, ref: string): string {
  const parts = noteDir ? noteDir.split('/') : [];
  for (const seg of ref.split('/')) {
    if (seg === '..') {
      parts.pop();
    } else if (seg === '.' || seg === '') {
      continue;
    } else {
      parts.push(seg);
    }
  }
  return parts.join('/');
}

export interface AssetMatch {
  /** Repo-relative path of the matched asset. */
  path: string;
  kind:
    | 'exact' // reference is (case-insensitively) a full vault path
    | 'note-relative' // reference resolves from the note's folder
    | 'bare'; // reference is a bare filename matched by basename
}

function findCaseInsensitive(paths: string[], target: string): string | null {
  const lower = target.toLowerCase();
  for (const p of paths) {
    if (p.toLowerCase() === lower) return p;
  }
  return null;
}

function isAttachmentFolderSegment(segment: string): boolean {
  const lower = segment.toLowerCase();
  return ATTACHMENT_FOLDER_HINTS.some((hint) => lower === hint || lower.endsWith(`-${hint}`) || lower.endsWith(` ${hint}`));
}

/**
 * Ranks candidate paths for a bare/suffix match.
 * Preference order: same folder as the note → attachment-like folders → folder
 * hinted at in the reference itself → shallower paths.
 */
export function rankAssetCandidates(candidates: string[], noteDir: string, ref: string): string[] {
  const refDir = noteDirOf(ref); // e.g. "Attachments/foo.png" → "Attachments"
  const refDirLower = refDir.toLowerCase();

  function score(p: string): number {
    let s = 0;
    if (refDirLower && p.toLowerCase().startsWith(`${refDirLower}/`)) {
      s += 4; // candidate lives in the folder named by the reference
    }
    if (noteDir && p.toLowerCase().startsWith(`${noteDir.toLowerCase()}/`)) {
      s += 3; // candidate lives next to the note
    }
    const topSegment = p.split('/')[0];
    if (isAttachmentFolderSegment(topSegment)) {
      s += 2; // candidate lives in an attachments-like folder
    }
    s -= p.split('/').length * 0.1; // prefer shallower paths on ties
    return s;
  }

  return [...candidates].sort((a, b) => score(b) - score(a));
}

/**
 * Core resolver: matches a raw image reference against the vault's asset paths.
 * Returns null when nothing plausible matches.
 */
export function matchAssetReference(rawRef: string, notePath: string, assetPaths: string[]): AssetMatch | null {
  const ref = normalizeAssetRef(rawRef);
  if (!ref || assetPaths.length === 0) return null;

  const dir = noteDirOf(notePath);

  // 1. Exact (case-insensitive) full-path match.
  const exact = findCaseInsensitive(assetPaths, ref);
  if (exact) return { path: exact, kind: 'exact' };

  // 2. Note-relative match ("../Attachments/foo.png", "./img/foo.png").
  const relative = resolveRelativeRef(dir, ref);
  const relMatch = findCaseInsensitive(assetPaths, relative);
  if (relMatch) return { path: relMatch, kind: 'note-relative' };

  // 3. Bare-filename match anywhere in the vault, best candidate wins.
  const bare = basename(ref).toLowerCase();
  if (bare) {
    const candidates = assetPaths.filter((p) => basename(p).toLowerCase() === bare);
    if (candidates.length > 0) {
      const ranked = rankAssetCandidates(candidates, dir, ref);
      return { path: ranked[0], kind: 'bare' };
    }
  }

  return null;
}
