import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { getStatut, getPriorite } from '../constants';

// ── Status Badge ──────────────────────────────────────────────
export const StatusBadge = ({ statut, size = 'sm' }) => {
  const s = getStatut(statut);
  const sz = size === 'lg' ? 'px-3 py-1.5 text-sm gap-2' : 'px-2.5 py-1 text-xs gap-1.5';
  // Remap dark colors to light equivalents
  const lightColor = s.color
    .replace('bg-slate-700 text-slate-200',      'bg-slate-100 text-slate-600 border border-slate-200')
    .replace('bg-blue-900/60 text-blue-300',      'bg-blue-50 text-blue-700 border border-blue-200')
    .replace('bg-indigo-900/60 text-indigo-300',  'bg-indigo-50 text-indigo-700 border border-indigo-200')
    .replace('bg-cyan-900/60 text-cyan-300',      'bg-cyan-50 text-cyan-700 border border-cyan-200')
    .replace('bg-amber-900/60 text-amber-300',    'bg-amber-50 text-amber-700 border border-amber-200')
    .replace('bg-orange-900/60 text-orange-300',  'bg-orange-50 text-orange-700 border border-orange-200')
    .replace('bg-emerald-900/60 text-emerald-300','bg-emerald-50 text-emerald-700 border border-emerald-200')
    .replace('bg-green-900/60 text-green-300',    'bg-green-50 text-green-700 border border-green-200')
    .replace('bg-red-900/60 text-red-300',        'bg-red-50 text-red-700 border border-red-200');
  const lightDot = s.dot
    .replace('bg-slate-400', 'bg-slate-400')
    .replace('bg-blue-400',    'bg-blue-500')
    .replace('bg-indigo-400',  'bg-indigo-500')
    .replace('bg-cyan-400',    'bg-cyan-500')
    .replace('bg-amber-400',   'bg-amber-500')
    .replace('bg-orange-400',  'bg-orange-500')
    .replace('bg-emerald-400', 'bg-emerald-500')
    .replace('bg-green-500',   'bg-green-500')
    .replace('bg-red-500',     'bg-red-500');
  return (
    <span className={`inline-flex items-center rounded-full font-medium ${lightColor} ${sz}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${lightDot} flex-shrink-0`} />
      {s.label}
    </span>
  );
};

// ── Priority Badge ────────────────────────────────────────────
export const PriorityBadge = ({ priorite }) => {
  const p = getPriorite(priorite);
  const lightColor = p.color
    .replace('bg-slate-700 text-slate-300',     'bg-slate-100 text-slate-600 border border-slate-200')
    .replace('bg-blue-900/60 text-blue-300',    'bg-blue-50 text-blue-700 border border-blue-200')
    .replace('bg-orange-900/60 text-orange-300','bg-orange-50 text-orange-700 border border-orange-200')
    .replace('bg-red-900/60 text-red-300',      'bg-red-50 text-red-700 border border-red-200');
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${lightColor}`}>
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
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${sizes[size]} bg-white rounded-2xl border border-slate-200 shadow-2xl animate-slide-in max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between p-6 border-b border-slate-100 flex-shrink-0">
          <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
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
    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
      <Icon size={28} className="text-slate-400" />
    </div>
    <h3 className="text-lg font-medium text-slate-600 mb-1">{title}</h3>
    <p className="text-sm text-slate-400 mb-6 max-w-xs">{description}</p>
    {action}
  </div>
);

// ── Stat Card ─────────────────────────────────────────────────
export const StatCard = ({ label, value, icon: Icon, color = 'blue', delta, subtitle }) => {
  const colors = {
    blue:   { bg: 'bg-blue-50',   icon: 'text-blue-600',   border: 'border-blue-100',   val: 'text-blue-700' },
    red:    { bg: 'bg-red-50',    icon: 'text-red-600',    border: 'border-red-100',    val: 'text-red-700' },
    green:  { bg: 'bg-emerald-50',icon: 'text-emerald-600',border: 'border-emerald-100',val: 'text-emerald-700' },
    amber:  { bg: 'bg-amber-50',  icon: 'text-amber-600',  border: 'border-amber-100',  val: 'text-amber-700' },
    purple: { bg: 'bg-purple-50', icon: 'text-purple-600', border: 'border-purple-100', val: 'text-purple-700' },
  };
  const c = colors[color] || colors.blue;
  return (
    <div className={`bg-white border ${c.border} rounded-2xl p-5 hover:shadow-sm transition-all duration-200`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center`}>
          <Icon size={20} className={c.icon} />
        </div>
        {delta !== undefined && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${delta >= 0 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
            {delta >= 0 ? '+' : ''}{delta}%
          </span>
        )}
      </div>
      <div className={`text-3xl font-bold mb-0.5 ${c.val}`}>{value}</div>
      <div className="text-sm text-slate-500 font-medium">{label}</div>
      {subtitle && <div className="text-xs text-slate-400 mt-0.5">{subtitle}</div>}
    </div>
  );
};

// ── Loading Spinner ───────────────────────────────────────────
export const Spinner = ({ size = 24 }) => (
  <div className="flex items-center justify-center p-8">
    <div
      className="border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin"
      style={{ width: size, height: size }}
    />
  </div>
);

// ── Alert ─────────────────────────────────────────────────────
export const Alert = ({ type = 'info', message }) => {
  const styles = {
    error:   { bg: 'bg-red-50 border-red-200',     icon: AlertCircle,  text: 'text-red-600' },
    success: { bg: 'bg-emerald-50 border-emerald-200', icon: CheckCircle, text: 'text-emerald-600' },
    info:    { bg: 'bg-blue-50 border-blue-200',   icon: Info,         text: 'text-blue-600' },
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
    {label && <label className="label">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>}
    <div className="relative">
      <select className="select-field pr-10" {...props}>{children}</select>
      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">▾</div>
    </div>
  </div>
);

// ── Input with label ──────────────────────────────────────────
export const InputField = ({ label, required, icon: Icon, ...props }) => (
  <div>
    {label && <label className="label">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>}
    <div className="relative">
      {Icon && <Icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />}
      <input className={`input-field ${Icon ? 'pl-10' : ''}`} {...props} />
    </div>
  </div>
);

// ── Textarea ──────────────────────────────────────────────────
export const TextareaField = ({ label, required, rows = 4, ...props }) => (
  <div>
    {label && <label className="label">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>}
    <textarea rows={rows} className="input-field resize-none" {...props} />
  </div>
);
