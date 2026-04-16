import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { getStatut, getPriorite } from '../constants';

// ── Status Badge ──────────────────────────────────────────────
export const StatusBadge = ({ statut, size = 'sm' }) => {
  const s = getStatut(statut);
  const sz = size === 'lg' ? 'px-3 py-1.5 text-sm gap-2' : 'px-2.5 py-1 text-xs gap-1.5';
  return (
    <span className={`inline-flex items-center rounded-full font-medium ${s.color} ${sz}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot} flex-shrink-0`} />
      {s.label}
    </span>
  );
};

// ── Priority Badge ────────────────────────────────────────────
export const PriorityBadge = ({ priorite }) => {
  const p = getPriorite(priorite);
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${p.color}`}>
      <span className="text-[10px]">{p.icon}</span>
      {priorite}
    </span>
  );
};

// ── Modal ─────────────────────────────────────────────────────
export const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl', xl: 'max-w-5xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${sizes[size]} bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl animate-slide-in max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between p-6 border-b border-slate-800 flex-shrink-0">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};

// ── Empty State ───────────────────────────────────────────────
export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
      <Icon size={28} className="text-slate-500" />
    </div>
    <h3 className="text-lg font-medium text-slate-300 mb-1">{title}</h3>
    <p className="text-sm text-slate-500 mb-6 max-w-xs">{description}</p>
    {action}
  </div>
);

// ── Stat Card ─────────────────────────────────────────────────
export const StatCard = ({ label, value, icon: Icon, color = 'blue', delta, subtitle }) => {
  const colors = {
    blue:   { bg: 'bg-blue-900/30',   icon: 'text-blue-400',   border: 'border-blue-800/40' },
    red:    { bg: 'bg-red-900/30',    icon: 'text-red-400',    border: 'border-red-800/40' },
    green:  { bg: 'bg-emerald-900/30',icon: 'text-emerald-400',border: 'border-emerald-800/40' },
    amber:  { bg: 'bg-amber-900/30',  icon: 'text-amber-400',  border: 'border-amber-800/40' },
    purple: { bg: 'bg-purple-900/30', icon: 'text-purple-400', border: 'border-purple-800/40' },
  };
  const c = colors[color] || colors.blue;
  return (
    <div className={`card p-5 border ${c.border} hover:border-opacity-70 transition-all duration-200`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center`}>
          <Icon size={20} className={c.icon} />
        </div>
        {delta !== undefined && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${delta >= 0 ? 'bg-emerald-900/40 text-emerald-400' : 'bg-red-900/40 text-red-400'}`}>
            {delta >= 0 ? '+' : ''}{delta}%
          </span>
        )}
      </div>
      <div className="text-3xl font-bold text-white mb-0.5">{value}</div>
      <div className="text-sm text-slate-400">{label}</div>
      {subtitle && <div className="text-xs text-slate-500 mt-1">{subtitle}</div>}
    </div>
  );
};

// ── Loading Spinner ───────────────────────────────────────────
export const Spinner = ({ size = 24 }) => (
  <div className="flex items-center justify-center p-8">
    <div
      className="border-2 border-slate-700 border-t-blue-500 rounded-full animate-spin"
      style={{ width: size, height: size }}
    />
  </div>
);

// ── Alert ─────────────────────────────────────────────────────
export const Alert = ({ type = 'info', message }) => {
  const styles = {
    error:   { bg: 'bg-red-900/30 border-red-700/50',    icon: AlertCircle,    text: 'text-red-300' },
    success: { bg: 'bg-emerald-900/30 border-emerald-700/50', icon: CheckCircle, text: 'text-emerald-300' },
    info:    { bg: 'bg-blue-900/30 border-blue-700/50',   icon: Info,           text: 'text-blue-300' },
  };
  const s = styles[type] || styles.info;
  const Icon = s.icon;
  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border ${s.bg}`}>
      <Icon size={18} className={`${s.text} flex-shrink-0 mt-0.5`} />
      <p className={`text-sm ${s.text}`}>{message}</p>
    </div>
  );
};

// ── Select with custom arrow ──────────────────────────────────
export const SelectField = ({ label, children, required, ...props }) => (
  <div>
    {label && <label className="label">{label}{required && <span className="text-red-400 ml-1">*</span>}</label>}
    <div className="relative">
      <select className="select-field pr-10" {...props}>{children}</select>
      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">▾</div>
    </div>
  </div>
);

// ── Input with label ──────────────────────────────────────────
export const InputField = ({ label, required, icon: Icon, ...props }) => (
  <div>
    {label && <label className="label">{label}{required && <span className="text-red-400 ml-1">*</span>}</label>}
    <div className="relative">
      {Icon && <Icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />}
      <input className={`input-field ${Icon ? 'pl-10' : ''}`} {...props} />
    </div>
  </div>
);

// ── Textarea ──────────────────────────────────────────────────
export const TextareaField = ({ label, required, rows = 4, ...props }) => (
  <div>
    {label && <label className="label">{label}{required && <span className="text-red-400 ml-1">*</span>}</label>}
    <textarea
      rows={rows}
      className="input-field resize-none"
      {...props}
    />
  </div>
);
