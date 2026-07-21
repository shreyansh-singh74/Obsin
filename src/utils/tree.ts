import type { Note } from '@/types';

export interface TreeNode {
  name: string;
  path: string;
  isFolder: boolean;
  children: TreeNode[];
  noteCount?: number;
  note?: Note;
}

/**
 * Builds a folder tree structure from a flat array of Note items efficiently.
 * Sorts folders first, alphabetically.
 */
export function buildTreeOnce(notes: Note[]): TreeNode[] {
  const rootNodes: TreeNode[] = [];
  const folderMap = new Map<string, TreeNode>();

  // Ensure root folder exists helper
  function getOrCreateFolderNode(folderPath: string): TreeNode {
    if (folderMap.has(folderPath)) {
      return folderMap.get(folderPath)!;
    }

    const parts = folderPath.split('/');
    const folderName = parts[parts.length - 1];
    const parentPath = parts.slice(0, -1).join('/');

    const folderNode: TreeNode = {
      name: folderName,
      path: folderPath,
      isFolder: true,
      children: [],
      noteCount: 0,
    };

    folderMap.set(folderPath, folderNode);

    if (parentPath) {
      const parentNode = getOrCreateFolderNode(parentPath);
      parentNode.children.push(folderNode);
    } else {
      rootNodes.push(folderNode);
    }

    return folderNode;
  }

  // Insert notes into tree
  for (const note of notes) {
    const fileNode: TreeNode = {
      name: note.name,
      path: note.path,
      isFolder: false,
      children: [],
      note: note,
    };

    if (note.folder) {
      const parentFolder = getOrCreateFolderNode(note.folder);
      parentFolder.children.push(fileNode);

      // Increment noteCount recursively
      let currentPath = note.folder;
      while (currentPath) {
        const node = folderMap.get(currentPath);
        if (node) {
          node.noteCount = (node.noteCount || 0) + 1;
        }
        const lastSlash = currentPath.lastIndexOf('/');
        currentPath = lastSlash !== -1 ? currentPath.substring(0, lastSlash) : '';
      }
    } else {
      rootNodes.push(fileNode);
    }
  }

  // Recursive sort function (Folders first, then alphabetically)
  function sortNodes(nodes: TreeNode[]) {
    nodes.sort((a, b) => {
      if (a.isFolder && !b.isFolder) return -1;
      if (!a.isFolder && b.isFolder) return 1;
      return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
    });

    for (const node of nodes) {
      if (node.isFolder && node.children.length > 0) {
        sortNodes(node.children);
      }
    }
  }

  sortNodes(rootNodes);
  return rootNodes;
}
