import React from 'react';
import {
  Info,
  AlertTriangle,
  Flame,
  CheckCircle2,
  HelpCircle,
  Quote,
  Lightbulb,
  FileText,
} from 'lucide-react';

interface CalloutProps {
  type: string;
  title: string;
  children: React.ReactNode;
}

export const Callout: React.FC<CalloutProps> = ({ type, title, children }) => {
  const normalizedType = type.toLowerCase();

  let icon = <Info className="w-4 h-4 text-[var(--info-text)]" />;
  let borderClass = 'border-[var(--info-text)]/30 bg-[var(--info-bg)] text-[var(--text-primary)]';
  let headerClass = 'text-[var(--info-text)] font-semibold';

  switch (normalizedType) {
    case 'warning':
    case 'caution':
    case 'attention':
      icon = <AlertTriangle className="w-4 h-4 text-[var(--warning-text)]" />;
      borderClass = 'border-[var(--warning-text)]/30 bg-[var(--warning-bg)] text-[var(--text-primary)]';
      headerClass = 'text-[var(--warning-text)] font-semibold';
      break;

    case 'danger':
    case 'error':
    case 'bug':
      icon = <Flame className="w-4 h-4 text-[var(--danger-text)]" />;
      borderClass = 'border-[var(--danger-text)]/30 bg-[var(--danger-bg)] text-[var(--text-primary)]';
      headerClass = 'text-[var(--danger-text)] font-semibold';
      break;

    case 'tip':
    case 'hint':
    case 'important':
      icon = <Lightbulb className="w-4 h-4 text-[var(--success-text)]" />;
      borderClass = 'border-[var(--success-text)]/30 bg-[var(--success-bg)] text-[var(--text-primary)]';
      headerClass = 'text-[var(--success-text)] font-semibold';
      break;

    case 'success':
    case 'check':
    case 'done':
      icon = <CheckCircle2 className="w-4 h-4 text-[var(--success-text)]" />;
      borderClass = 'border-[var(--success-text)]/30 bg-[var(--success-bg)] text-[var(--text-primary)]';
      headerClass = 'text-[var(--success-text)] font-semibold';
      break;

    case 'question':
    case 'faq':
    case 'help':
      icon = <HelpCircle className="w-4 h-4 text-[var(--accent-text)]" />;
      borderClass = 'border-[var(--accent-soft)] bg-[var(--accent-soft)] text-[var(--text-primary)]';
      headerClass = 'text-[var(--accent-text)] font-semibold';
      break;

    case 'quote':
    case 'cite':
      icon = <Quote className="w-4 h-4 text-[var(--icon-muted)]" />;
      borderClass = 'border-[var(--border-subtle)] bg-[var(--surface-card)] text-[var(--text-secondary)]';
      headerClass = 'text-[var(--text-primary)] font-semibold';
      break;

    default:
      icon = <FileText className="w-4 h-4 text-[var(--accent-text)]" />;
      borderClass = 'border-[var(--accent-soft)] bg-[var(--accent-soft)] text-[var(--text-primary)]';
      headerClass = 'text-[var(--accent-text)] font-semibold';
      break;
  }

  return (
    <div className={`my-4 p-4 rounded-[var(--radius-md)] border ${borderClass} shadow-[var(--shadow-sm)] space-y-2`}>
      <div className={`flex items-center gap-2 text-sm ${headerClass}`}>
        {icon}
        <span className="capitalize">{title}</span>
      </div>
      <div className="text-sm leading-relaxed text-[var(--text-secondary)] pl-6 border-l border-[var(--border-subtle)]">
        {children}
      </div>
    </div>
  );
};
