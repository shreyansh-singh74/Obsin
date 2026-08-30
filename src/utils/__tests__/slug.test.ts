import { describe, it, expect } from 'vitest';
import { slugifyWikiLink, parseFilePath } from '../slug';

describe('slugifyWikiLink', () => {
  it('lowercases simple names', () => {
    expect(slugifyWikiLink('Docker')).toBe('docker');
  });

  it('strips .md extension', () => {
    expect(slugifyWikiLink('Docker.md')).toBe('docker');
  });

  it('strips directory paths', () => {
    expect(slugifyWikiLink('Programming/Docker.md')).toBe('docker');
  });

  it('strips anchors', () => {
    expect(slugifyWikiLink('Docker#Containers')).toBe('docker');
  });

  it('handles multi-word names with hyphens', () => {
    expect(slugifyWikiLink('My-Cool Note')).toBe('my-cool note');
  });

  it('handles complex paths with anchors', () => {
    expect(slugifyWikiLink('Web/React Hooks.md#useState')).toBe('react hooks');
  });

  it('trims whitespace', () => {
    expect(slugifyWikiLink('  Docker  ')).toBe('docker');
  });
});

describe('parseFilePath', () => {
  it('parses nested paths', () => {
    expect(parseFilePath('Programming/Web/React.md')).toEqual({
      folder: 'Programming/Web',
      name: 'React',
    });
  });

  it('parses root-level notes', () => {
    expect(parseFilePath('RootNote.md')).toEqual({
      folder: '',
      name: 'RootNote',
    });
  });

  it('handles files without extension', () => {
    expect(parseFilePath('Programming/Readme')).toEqual({
      folder: 'Programming',
      name: 'Readme',
    });
  });

  it('handles deeply nested paths', () => {
    expect(parseFilePath('a/b/c/d/file.md')).toEqual({
      folder: 'a/b/c/d',
      name: 'file',
    });
  });
});
