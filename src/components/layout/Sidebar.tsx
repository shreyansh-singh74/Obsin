import React from 'react';
import { FolderTree } from '@/components/tree/FolderTree';

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 border-r border-slate-800/80 bg-slate-950/60 flex flex-col h-full shrink-0 select-none">
      <FolderTree />
    </aside>
  );
};
