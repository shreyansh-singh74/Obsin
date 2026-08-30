import { describe, it, expect, beforeEach } from 'vitest';
import { searchEngine } from '../search';
import type { Note } from '@/types';

function createNote(overrides: Partial<Note>): Note {
  return {
    vaultId: 'test-vault',
    path: 'test.md',
    name: 'Test Note',
    folder: '',
    content: 'This is test content',
    sha: 'abc123',
    updatedAt: new Date().toISOString(),
    tags: [],
    aliases: [],
    headings: [],
    ...overrides,
  };
}

describe('SearchEngine', () => {
  const vaultId = 'test-vault';

  beforeEach(() => {
    searchEngine.clearIndex(vaultId);
  });

  it('indexes notes and finds by title', () => {
    const notes = [
      createNote({ path: 'docker.md', name: 'Docker', content: 'Docker containers and compose files' }),
      createNote({ path: 'react.md', name: 'React', content: 'React hooks and components' }),
    ];

    searchEngine.indexVault(vaultId, notes);
    const results = searchEngine.search(vaultId, 'Docker', notes);

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].title).toBe('Docker');
  });

  it('finds notes by content', () => {
    const notes = [
      createNote({ path: 'notes.md', name: 'Notes', content: 'Kubernetes is a container orchestration tool' }),
    ];

    searchEngine.indexVault(vaultId, notes);
    const results = searchEngine.search(vaultId, 'Kubernetes', notes);

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].path).toBe('notes.md');
  });

  it('finds notes by tag', () => {
    const notes = [
      createNote({ path: 'docker.md', name: 'Docker', tags: ['devops', 'containers'] }),
    ];

    searchEngine.indexVault(vaultId, notes);
    const results = searchEngine.search(vaultId, 'devops', notes);

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].matchedField).toBe('tag');
  });

  it('returns empty for no matches', () => {
    const notes = [
      createNote({ path: 'test.md', name: 'Hello', content: 'Simple content' }),
    ];

    searchEngine.indexVault(vaultId, notes);
    const results = searchEngine.search(vaultId, 'nonexistent', notes);

    expect(results).toHaveLength(0);
  });

  it('returns empty for empty query', () => {
    const notes = [createNote({ path: 'test.md', name: 'Test' })];
    searchEngine.indexVault(vaultId, notes);

    expect(searchEngine.search(vaultId, '', notes)).toHaveLength(0);
    expect(searchEngine.search(vaultId, '   ', notes)).toHaveLength(0);
  });

  it('deduplicates results across multiple field matches', () => {
    const notes = [
      createNote({
        path: 'docker.md',
        name: 'Docker',
        content: 'Docker is great for containers',
        tags: ['docker'],
      }),
    ];

    searchEngine.indexVault(vaultId, notes);
    const results = searchEngine.search(vaultId, 'docker', notes);

    // Should return only one result even though title, content, and tag all match
    const dockerResults = results.filter((r) => r.path === 'docker.md');
    expect(dockerResults).toHaveLength(1);
  });
});
