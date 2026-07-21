import React from 'react';
import { FolderTree } from '@/components/tree/FolderTree';

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 border-r app-border sidebar-bg flex flex-col h-full shrink-0 select-none transition-colors duration-200">
      <FolderTree />
    </aside>
  );
};
