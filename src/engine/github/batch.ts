import { fetchFileContent } from './contents';
import { GitTreeItem } from './tree';
import { parseFrontmatter, extractHeadings } from '@/utils/markdown';
import { parseFilePath } from '@/utils/slug';
import type { Note } from '@/types';

export interface BatchFetchProgress {
  total: number;
  completed: number;
  currentPath: string;
}

export async function batchFetchMarkdownFiles(
  vaultId: string,
  owner: string,
  repo: string,
  branch: string,
  files: GitTreeItem[],
  token?: string,
  onProgress?: (progress: BatchFetchProgress) => void,
  concurrency = 5
): Promise<Note[]> {
  const notes: Note[] = [];
  let completed = 0;
  const total = files.length;

  // Process items in chunks of size `concurrency`
  for (let i = 0; i < files.length; i += concurrency) {
    const chunk = files.slice(i, i + concurrency);

    const results = await Promise.all(
      chunk.map(async (fileItem) => {
        try {
          if (onProgress) {
            onProgress({ total, completed: completed + 1, currentPath: fileItem.path });
          }

          const { content, sha } = await fetchFileContent(owner, repo, fileItem.path, branch, token);
          const { title, tags, aliases, body } = parseFrontmatter(content);
          const headings = extractHeadings(body);
          const { folder, name } = parseFilePath(fileItem.path);

          const note: Note = {
            vaultId,
            path: fileItem.path,
            name: title || name,
            folder,
            content: body, // Raw markdown ONLY
            sha: sha || fileItem.sha,
            updatedAt: new Date().toISOString(),
            tags,
            aliases,
            headings,
          };

          completed++;
          if (onProgress) {
            onProgress({ total, completed, currentPath: fileItem.path });
          }

          return note;
        } catch (err) {
          console.error(`Failed to fetch file: ${fileItem.path}`, err);
          completed++;
          return null;
        }
      })
    );

    for (const note of results) {
      if (note) {
        notes.push(note);
      }
    }
  }

  return notes;
}
