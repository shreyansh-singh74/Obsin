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

  let icon = <Info className="w-4 h-4 text-blue-400" />;
  let borderClass = 'border-blue-500/40 bg-blue-950/20 text-blue-200';
  let headerClass = 'text-blue-300 font-semibold';

  switch (normalizedType) {
    case 'warning':
    case 'caution':
    case 'attention':
      icon = <AlertTriangle className="w-4 h-4 text-amber-400" />;
      borderClass = 'border-amber-500/40 bg-amber-950/20 text-amber-200';
      headerClass = 'text-amber-300 font-semibold';
      break;

    case 'danger':
    case 'error':
    case 'bug':
      icon = <Flame className="w-4 h-4 text-rose-400" />;
      borderClass = 'border-rose-500/40 bg-rose-950/20 text-rose-200';
      headerClass = 'text-rose-300 font-semibold';
      break;

    case 'tip':
    case 'hint':
    case 'important':
      icon = <Lightbulb className="w-4 h-4 text-emerald-400" />;
      borderClass = 'border-emerald-500/40 bg-emerald-950/20 text-emerald-200';
      headerClass = 'text-emerald-300 font-semibold';
      break;

    case 'success':
    case 'check':
    case 'done':
      icon = <CheckCircle2 className="w-4 h-4 text-teal-400" />;
      borderClass = 'border-teal-500/40 bg-teal-950/20 text-teal-200';
      headerClass = 'text-teal-300 font-semibold';
      break;

    case 'question':
    case 'faq':
    case 'help':
      icon = <HelpCircle className="w-4 h-4 text-purple-400" />;
      borderClass = 'border-purple-500/40 bg-purple-950/20 text-purple-200';
      headerClass = 'text-purple-300 font-semibold';
      break;

    case 'quote':
    case 'cite':
      icon = <Quote className="w-4 h-4 text-slate-400" />;
      borderClass = 'border-slate-600/40 bg-slate-900/40 text-slate-300';
      headerClass = 'text-slate-300 font-semibold';
      break;

    default:
      icon = <FileText className="w-4 h-4 text-indigo-400" />;
      borderClass = 'border-indigo-500/40 bg-indigo-950/20 text-indigo-200';
      headerClass = 'text-indigo-300 font-semibold';
      break;
  }

  return (
    <div className={`my-4 p-4 rounded-xl border ${borderClass} shadow-lg space-y-2`}>
      <div className={`flex items-center gap-2 text-sm ${headerClass}`}>
        {icon}
        <span className="capitalize">{title}</span>
      </div>
      <div className="text-sm leading-relaxed text-slate-300 opacity-90 pl-6 border-l border-slate-700/50">
        {children}
      </div>
    </div>
  );
};
