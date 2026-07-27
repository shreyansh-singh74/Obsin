import React from 'react';
import { FolderTree } from '@/components/tree/FolderTree';

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 border-r border-[var(--border-subtle)] bg-[var(--surface-sidebar)] flex flex-col h-full shrink-0 select-none transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)]">
      <FolderTree />
    </aside>
  );
};
