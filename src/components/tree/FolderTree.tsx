import React, { useMemo } from 'react';
import { useVaultStore } from '@/store/useVaultStore';
import { buildTreeOnce } from '@/utils/tree';
import { FileTreeNode } from './FileTreeNode';
import { FileText } from 'lucide-react';

interface FolderTreeProps {
  /** Called when a note file is selected (useful for auto-closing mobile drawer) */
  onNoteSelected?: () => void;
}

export const FolderTree: React.FC<FolderTreeProps> = ({ onNoteSelected }) => {
  const { notes, activeVault, activeNotePath } = useVaultStore();

  const treeNodes = useMemo(() => {
    if (!notes || notes.length === 0) return [];
    return buildTreeOnce(notes);
  }, [notes]);

  if (!activeVault) {
    return null;
  }

  return (
    <div className="flex flex-col h-full space-y-2">




      {/* Tree View Container */}
      <div className="flex-1 overflow-y-auto space-y-0.5">
        {treeNodes.length > 0 ? (
          treeNodes.map((node) => {
            // Auto-expand root folders that contain the active note
            const shouldOpen = activeNotePath?.startsWith(node.path + '/') || activeNotePath?.startsWith(node.path + '\\');
            return (
              <FileTreeNode
                key={node.path}
                node={node}
                onNoteSelected={onNoteSelected}
                defaultOpen={node.isFolder && shouldOpen}
              />
            );
          })
        ) : (
          <div className="p-4 text-center text-xs text-[var(--text-muted)] space-y-2">
            <FileText className="w-6 h-6 stroke-1 text-[var(--icon-muted)] mx-auto" />
            <p>No notes in this vault tree.</p>
          </div>
        )}
      </div>
    </div>
  );
};
