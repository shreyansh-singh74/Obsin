import { describe, it, expect } from 'vitest';
import {
  matchAssetReference,
  normalizeAssetRef,
  resolveRelativeRef,
  rankAssetCandidates,
  isImagePath,
  getMimeType,
  basename,
} from '../assets';

const VAULT_ASSETS = [
  'Attachments/Pasted image 20260523105624.png',
  'Attachments/Pasted image 20260524122958.png',
  'Attachments/diagram.svg',
  '0. DSA/arrays.png',
  '1. Computer Fundamentals/os-overview.jpg',
  'assets/deep/nested/photo.jpeg',
  'README.png',
];

describe('matchAssetReference', () => {
  it('matches a bare pasted-image filename stored in another folder (the core vault case)', () => {
    const match = matchAssetReference(
      'Pasted image 20260523105624.png',
      '0. DSA/Two Pointers.md',
      VAULT_ASSETS
    );
    expect(match).not.toBeNull();
    expect(match!.path).toBe('Attachments/Pasted image 20260523105624.png');
    expect(match!.kind).toBe('bare');
  });

  it('matches exact vault paths case-insensitively', () => {
    const match = matchAssetReference('attachments/pasted image 20260523105624.png', 'Note.md', VAULT_ASSETS);
    expect(match!.path).toBe('Attachments/Pasted image 20260523105624.png');
    expect(match!.kind).toBe('exact');
  });

  it('matches note-relative references', () => {
    const match = matchAssetReference('./arrays.png', '0. DSA/Two Pointers.md', VAULT_ASSETS);
    expect(match!.path).toBe('0. DSA/arrays.png');
    expect(match!.kind).toBe('note-relative');
  });

  it('matches parent-directory references (../)', () => {
    const match = matchAssetReference('../Attachments/diagram.svg', '0. DSA/Sub/Note.md', VAULT_ASSETS);
    expect(match!.path).toBe('Attachments/diagram.svg');
  });

  it('prefers same-folder candidates on bare-name ambiguity', () => {
    const assets = [...VAULT_ASSETS, '0. DSA/extra/diagram.svg'];
    const match = matchAssetReference('diagram.svg', '0. DSA/Note.md', assets);
    expect(match!.path).toBe('0. DSA/extra/diagram.svg');
  });

  it('prefers attachment-like folders over deep folders for bare names', () => {
    const match = matchAssetReference('photo.jpeg', 'Some/Note.md', VAULT_ASSETS);
    expect(match!.path).toBe('assets/deep/nested/photo.jpeg');
    // only candidate — kind is bare
    expect(match!.kind).toBe('bare');
  });

  it('matches a folder-qualified reference via exact path (case-insensitive)', () => {
    const match = matchAssetReference('Attachments/diagram.svg', 'Whatever/Note.md', VAULT_ASSETS);
    expect(match!.path).toBe('Attachments/diagram.svg');
    expect(match!.kind).toBe('exact');
  });

  it('decodes URL-encoded references (%20)', () => {
    const match = matchAssetReference('Pasted%20image%2020260523105624.png', 'Note.md', VAULT_ASSETS);
    expect(match!.path).toBe('Attachments/Pasted image 20260523105624.png');
  });

  it('returns null when nothing matches', () => {
    expect(matchAssetReference('missing.png', 'Note.md', VAULT_ASSETS)).toBeNull();
    expect(matchAssetReference('', 'Note.md', VAULT_ASSETS)).toBeNull();
  });

  it('returns null for empty asset list', () => {
    expect(matchAssetReference('anything.png', 'Note.md', [])).toBeNull();
  });
});

describe('normalizeAssetRef', () => {
  it('strips the wiki embed wrapper', () => {
    expect(normalizeAssetRef('![[img.png]]')).toBe('img.png');
  });

  it('strips leading ./ and /', () => {
    expect(normalizeAssetRef('./img.png')).toBe('img.png');
    expect(normalizeAssetRef('/Attachments/img.png')).toBe('Attachments/img.png');
  });

  it('decodes %20', () => {
    expect(normalizeAssetRef('Pasted%20image%201.png')).toBe('Pasted image 1.png');
  });

  it('keeps malformed percent-encoding as-is', () => {
    expect(normalizeAssetRef('100%.png')).toBe('100%.png');
  });
});

describe('resolveRelativeRef', () => {
  it('resolves within the same directory', () => {
    expect(resolveRelativeRef('0. DSA', './arrays.png')).toBe('0. DSA/arrays.png');
  });

  it('resolves parent traversal', () => {
    expect(resolveRelativeRef('0. DSA/Sub', '../Attachments/x.png')).toBe('0. DSA/Attachments/x.png');
  });

  it('handles root notes', () => {
    expect(resolveRelativeRef('', 'img.png')).toBe('img.png');
  });
});

describe('rankAssetCandidates', () => {
  it('orders by same-folder, then attachment folders, then depth', () => {
    const ranked = rankAssetCandidates(
      ['assets/deep/nested/photo.jpeg', 'Attachments/photo.jpeg', 'Some/photo.jpeg'],
      '0. DSA',
      'photo.jpeg'
    );
    expect(ranked[0]).toBe('Attachments/photo.jpeg');
  });
});

describe('isImagePath / getMimeType / basename', () => {
  it('detects image extensions', () => {
    expect(isImagePath('a/b.PNG')).toBe(true);
    expect(isImagePath('photo.jpeg')).toBe(true);
    expect(isImagePath('anim.gif')).toBe(true);
    expect(isImagePath('doc.md')).toBe(false);
    expect(isImagePath('archive.zip')).toBe(false);
  });

  it('maps mime types', () => {
    expect(getMimeType('x.png')).toBe('image/png');
    expect(getMimeType('x.JPG')).toBe('image/jpeg');
    expect(getMimeType('x.svg')).toBe('image/svg+xml');
    expect(getMimeType('x.weird')).toBe('application/octet-stream');
  });

  it('extracts basenames', () => {
    expect(basename('Attachments/Pasted image 1.png')).toBe('Pasted image 1.png');
    expect(basename('root.png')).toBe('root.png');
  });
});
