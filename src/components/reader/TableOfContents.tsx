import React, { useMemo, useState } from 'react';
import { ChevronRight, List, X } from 'lucide-react';
import { useVaultStore } from '@/store/useVaultStore';

interface TocItem {
  id: string;
  text: string;
  level: number; // 2 or 3
}

/**
 * Extracts H2/H3 headings from markdown content.
 * Returns heading text and a slugified ID matching rehype-slug output.
 */
function extractHeadings(markdown: string): TocItem[] {
  const headings: TocItem[] = [];
  const lines = markdown.split('\n');
  
  for (const line of lines) {
    const match = line.match(/^(#{2,3})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].replace(/[*_`~\[\]]/g, '').trim();
      // rehype-slug generates IDs by: lowercase, replace spaces with hyphens, remove special chars
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim();
      headings.push({ id, text, level });
    }
  }
  
  return headings;
}

interface TableOfContentsProps {
  content: string;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({ content }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeId, setActiveId] = useState<string>('');
  const activeNotePath = useVaultStore((s) => s.activeNotePath);
  
  const headings = useMemo(() => extractHeadings(content), [content]);
  
  // Track which heading is currently in view using IntersectionObserver
  React.useEffect(() => {
    if (headings.length === 0) return;
    
    const observers: IntersectionObserver[] = [];
    
    for (const heading of headings) {
      const el = document.getElementById(heading.id);
      if (!el) continue;
      
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveId(heading.id);
          }
        },
        { rootMargin: '-80px 0px -70% 0px', threshold: 0 }
      );
      observer.observe(el);
      observers.push(observer);
    }
    
    return () => observers.forEach((o) => o.disconnect());
  }, [headings]);
  
  // Reset active heading when note changes
  React.useEffect(() => {
    setActiveId('');
  }, [activeNotePath]);
  
  if (headings.length === 0) return null;
  
  function scrollToHeading(id: string) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveId(id);
    }
  }
  
  return (
    <div className="border border-[var(--border-subtle)] rounded-[var(--radius-md)] bg-[var(--surface-card)] overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
      >
        <span className="flex items-center gap-1.5">
          <List className="w-3.5 h-3.5 text-[var(--accent-text)]" />
          On this page
        </span>
        <ChevronRight
          className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
        />
      </button>
      
      {/* Headings list */}
      {isExpanded && (
        <nav className="px-3 pb-3 space-y-0.5 max-h-[50vh] overflow-y-auto">
          {headings.map((heading) => (
            <button
              key={heading.id}
              onClick={() => scrollToHeading(heading.id)}
              className={`w-full text-left text-xs py-1.5 px-2 rounded-[var(--radius-xs)] transition-all duration-150 cursor-pointer block truncate ${
                heading.level === 3 ? 'pl-5' : ''
              } ${
                activeId === heading.id
                  ? 'text-[var(--accent-text)] bg-[var(--accent-soft)] font-medium'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
              }`}
              title={heading.text}
            >
              {heading.text}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
};

/**
 * Mobile-friendly floating TOC toggle button
 */
export const MobileTocToggle: React.FC<{ content: string }> = ({ content }) => {
  const [isOpen, setIsOpen] = useState(false);
  const headings = useMemo(() => extractHeadings(content), [content]);
  const activeNotePath = useVaultStore((s) => s.activeNotePath);
  const [activeId, setActiveId] = useState('');
  
  React.useEffect(() => {
    if (headings.length === 0) return;
    const observers: IntersectionObserver[] = [];
    for (const heading of headings) {
      const el = document.getElementById(heading.id);
      if (!el) continue;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveId(heading.id);
        },
        { rootMargin: '-80px 0px -70% 0px', threshold: 0 }
      );
      observer.observe(el);
      observers.push(observer);
    }
    return () => observers.forEach((o) => o.disconnect());
  }, [headings]);
  
  React.useEffect(() => {
    setActiveId('');
    setIsOpen(false);
  }, [activeNotePath]);
  
  if (headings.length === 0) return null;
  
  function scrollToHeading(id: string) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveId(id);
      setIsOpen(false);
    }
  }
  
  return (
    <>
      {/* Floating toggle button — mobile only */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-[var(--accent)] text-white shadow-lg flex items-center justify-center hover:bg-[var(--accent-hover)] transition-colors cursor-pointer"
        aria-label="Table of Contents"
      >
        <List className="w-5 h-5" />
      </button>
      
      {/* Full-screen overlay on mobile */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
          <div
            className="absolute bottom-0 left-0 right-0 max-h-[70vh] bg-[var(--surface-page)] rounded-t-2xl border-t border-[var(--border-subtle)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)]">
              <span className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <List className="w-4 h-4 text-[var(--accent-text)]" />
                On this page
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 text-[var(--text-muted)]" />
              </button>
            </div>
            <nav className="px-4 py-3 space-y-0.5 overflow-y-auto max-h-[calc(70vh-56px)]">
              {headings.map((heading) => (
                <button
                  key={heading.id}
                  onClick={() => scrollToHeading(heading.id)}
                  className={`w-full text-left text-sm py-2 px-3 rounded-[var(--radius-xs)] transition-all duration-150 cursor-pointer block truncate ${
                    heading.level === 3 ? 'pl-7' : ''
                  } ${
                    activeId === heading.id
                      ? 'text-[var(--accent-text)] bg-[var(--accent-soft)] font-medium'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
                  }`}
                >
                  {heading.text}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
};
