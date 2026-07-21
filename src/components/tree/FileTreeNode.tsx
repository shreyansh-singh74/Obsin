import React, { useState } from 'react';
import type { TreeNode } from '@/utils/tree';
import { useVaultStore } from '@/store/useVaultStore';
import { ChevronRight, ChevronDown, Folder, FolderOpen, FileText } from 'lucide-react';

interface FileTreeNodeProps {
  node: TreeNode;
  depth?: number;
}

export const FileTreeNode: React.FC<FileTreeNodeProps> = ({ node, depth = 0 }) => {
  const { activeNotePath, setActiveNotePath } = useVaultStore();
  const [isOpen, setIsOpen] = useState(false);

  const paddingLeft = `${depth * 12 + 12}px`;
  const isSelected = !node.isFolder && activeNotePath === node.path;

  if (node.isFolder) {
    return (
      <div className="select-none">
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{ paddingLeft }}
          className="w-full text-left py-1.5 pr-3 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 rounded-md flex items-center justify-between transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-1.5 truncate">
            {isOpen ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 shrink-0" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 shrink-0" />
            )}
            {isOpen ? (
              <FolderOpen className="w-4 h-4 text-indigo-400/80 shrink-0" />
            ) : (
              <Folder className="w-4 h-4 text-slate-500 group-hover:text-slate-400 shrink-0" />
            )}
            <span className="truncate">{node.name}</span>
          </div>

          {node.noteCount !== undefined && node.noteCount > 0 && (
            <span className="text-[10px] font-mono text-slate-600 group-hover:text-slate-500 px-1.5 py-0.2 rounded bg-slate-950/40">
              {node.noteCount}
            </span>
          )}
        </button>

        {isOpen && (
          <div className="space-y-0.5">
            {node.children.map((child) => (
              <FileTreeNode key={child.path} node={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => setActiveNotePath(node.path)}
      style={{ paddingLeft }}
      className={`w-full text-left py-1.5 pr-3 text-xs font-medium rounded-md flex items-center gap-2 transition-all cursor-pointer truncate ${
        isSelected
          ? 'bg-indigo-600/20 text-indigo-300 font-semibold border-l-2 border-indigo-500'
          : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
      }`}
    >
      <FileText className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
      <span className="truncate">{node.name}</span>
    </button>
  );
};
