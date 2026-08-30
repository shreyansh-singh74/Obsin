import React, { useState } from 'react';
import type { TreeNode } from '@/utils/tree';
import { useVaultStore } from '@/store/useVaultStore';
import { ChevronRight, ChevronDown, Folder, FolderOpen, FileText } from 'lucide-react';

interface FileTreeNodeProps {
  node: TreeNode;
  depth?: number;
  /** Called when a note file is selected */
  onNoteSelected?: () => void;
  /** Whether this folder should be open by default (ancestor of active note) */
  defaultOpen?: boolean;
}

export const FileTreeNode: React.FC<FileTreeNodeProps> = ({ node, depth = 0, onNoteSelected, defaultOpen = false }) => {
  const { activeNotePath, setActiveNotePath } = useVaultStore();
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // Auto-open when defaultOpen changes to true (ancestor of active note)
  React.useEffect(() => {
    if (defaultOpen && !isOpen) {
      setIsOpen(true);
    }
  }, [defaultOpen]);

  const paddingLeft = `${depth * 12 + 12}px`;
  const isSelected = !node.isFolder && activeNotePath === node.path;

  /** Check if a folder path is an ancestor of the active note */
  function isAncestorOfActive(folderPath: string): boolean {
    if (!activeNotePath) return false;
    return activeNotePath.startsWith(folderPath + '/') || activeNotePath.startsWith(folderPath + '\\');
  }

  function handleNoteClick() {
    setActiveNotePath(node.path);
    onNoteSelected?.();
  }

  if (node.isFolder) {
    return (
      <div className="select-none">
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{ paddingLeft }}
          className="w-full text-left py-1.5 pr-3 text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]/60 rounded-[var(--radius-sm)] flex items-center justify-between transition-all duration-[var(--duration-fast)] cursor-pointer group "
        >
          <div className="flex items-center gap-1.5 truncate">
            {isOpen ? (
              <ChevronDown className="w-3.5 h-3.5 text-[var(--icon-muted)] group-hover:text-[var(--text-primary)] shrink-0" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-[var(--icon-muted)] group-hover:text-[var(--text-primary)] shrink-0" />
            )}
            {isOpen ? (
              <FolderOpen className="w-4 h-4 text-[var(--accent-text)] shrink-0" />
            ) : (
              <Folder className="w-4 h-4 text-[var(--icon-muted)] group-hover:text-[var(--text-secondary)] shrink-0" />
            )}
            <span className="truncate">{node.name}</span>
          </div>


        </button>

        {isOpen && (
          <div className="space-y-0.5">
            {node.children.map((child) => (
              <FileTreeNode
                key={child.path}
                node={child}
                depth={depth + 1}
                defaultOpen={child.isFolder && isAncestorOfActive(child.path)}
                onNoteSelected={onNoteSelected}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={handleNoteClick}
      style={{ paddingLeft }}
      className={`w-full text-left py-1.5 pr-3 text-[13px] rounded-[var(--radius-sm)] flex items-center gap-2 transition-all duration-[var(--duration-fast)] cursor-pointer truncate  ${
        isSelected
          ? 'bg-[var(--accent-soft)] text-[var(--text-primary)] font-semibold'
          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]/60'
      }`}
    >
      <FileText className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[var(--accent-text)]' : 'text-[var(--icon-muted)]'}`} />
      <span className="truncate">{node.name}</span>
    </button>
  );
};
