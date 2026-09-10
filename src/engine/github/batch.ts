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

export async function batchFetchDocuments(
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
          const { folder, name } = parseFilePath(fileItem.path);
          const isHtml = /\.html?$/i.test(fileItem.path);

          let documentName = name;
          let documentContent = content;
          let tags: string[] = [];
          let aliases: string[] = [];
          let headings: string[] = [];

          if (isHtml) {
            const titleMatch = content.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
            const htmlTitle = titleMatch?.[1].replace(/<[^>]+>/g, '').trim();
            documentName = htmlTitle || name;
          } else {
            const parsed = parseFrontmatter(content);
            documentName = parsed.title || name;
            documentContent = parsed.body;
            tags = parsed.tags;
            aliases = parsed.aliases;
            headings = extractHeadings(parsed.body);
          }

          const note: Note = {
            vaultId,
            path: fileItem.path,
            name: documentName,
            folder,
            content: documentContent,
            format: isHtml ? 'html' : 'markdown',
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
