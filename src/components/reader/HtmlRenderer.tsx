import React from 'react';

interface HtmlRendererProps {
  content: string;
  noteName: string;
}

/**
 * Renders repository HTML as a document isolated from the Obsin application.
 * Scripts, forms, popups, and parent-page access are intentionally disabled.
 */
export const HtmlRenderer: React.FC<HtmlRendererProps> = ({ content, noteName }) => {
  return (
    <iframe
      title={`${noteName} HTML preview`}
      srcDoc={content}
      sandbox=""
      referrerPolicy="no-referrer"
      className="block h-[70vh] min-h-[32rem] w-full rounded-lg border border-[var(--border-subtle)] bg-white"
    />
  );
};
