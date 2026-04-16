import { useState, useEffect, useCallback } from 'react';
import {
  Search, Filter, Eye, Edit, ChevronLeft, ChevronRight,
  RefreshCw, X, Clock, CheckCircle, Loader, Save
} from 'lucide-react';
import { Sidebar, Header } from '../components/Layout';
import { StatusBadge, PriorityBadge, EmptyState, Spinner, Modal } from '../components/UI';
import { STATUTS, SERVICES, PRIORITES } from '../constants';
import { ComplaintDetail } from './ComplaintDetail';
import api from '../api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const EditPanel = ({ complaint, onSave, onClose }) => {
  const [form, setForm] = useState({
    statut: complaint.statut,
    service_assigne: complaint.service_assigne || '',
    commentaire_admin: complaint.commentaire_admin || '',
    priorite: complaint.priorite,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch(`/complaints/${complaint.id}`, form);
      toast.success('Plainte mise à jour');
      onSave();
    } catch {
      toast.error('Erreur de mise à jour');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-5">
      <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/40">
        <div className="font-mono text-sm text-blue-400 mb-1">{complaint.reference}</div>
        <div className="text-white font-medium text-sm truncate">{complaint.objet}</div>
        <div className="text-xs text-slate-500 mt-0.5">{complaint.declarant_name} · {complaint.service_concerne}</div>
      </div>

      <div>
        <label className="label">Nouveau statut</label>
        <div className="relative">
          <select className="select-field pr-8" value={form.statut}
            onChange={e => setForm(p => ({ ...p, statut: e.target.value }))}>
            {STATUTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">▾</div>
        </div>
        <div className="mt-2"><StatusBadge statut={form.statut} size="lg" /></div>
      </div>

      <div>
        <label className="label">Priorité</label>
        <div className="grid grid-cols-2 gap-2">
          {PRIORITES.map(p => (
            <button key={p.value} type="button"
              onClick={() => setForm(f => ({ ...f, priorite: p.value }))}
              className={`p-2.5 rounded-xl border text-sm font-medium transition-all flex items-center gap-2
                ${form.priorite === p.value ? 'border-blue-500 bg-blue-900/30 text-blue-300' : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'}`}>
              <span>{p.icon}</span> {p.value}
              {form.priorite === p.value && <CheckCircle size={12} className="ml-auto text-blue-400" />}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="label">Assigner à un service</label>
        <div className="relative">
          <select className="select-field pr-8" value={form.service_assigne}
            onChange={e => setForm(p => ({ ...p, service_assigne: e.target.value }))}>
            <option value="">-- Aucune assignation --</option>
            {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">▾</div>
        </div>
      </div>

      <div>
        <label className="label">Commentaire / Réponse</label>
        <textarea rows={4} className="input-field resize-none"
          placeholder="Message visible par le commercial déclarant..."
          value={form.commentaire_admin}
          onChange={e => setForm(p => ({ ...p, commentaire_admin: e.target.value }))} />
      </div>

      <div className="flex gap-3 pt-2 border-t border-slate-800">
        <button onClick={onClose} className="btn-ghost flex-1">Annuler</button>
        <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
          {saving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
          Enregistrer
        </button>
      </div>
    </div>
  );
};

export const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewId, setViewId] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [filters, setFilters] = useState({ statut: '', service: '', priorite: '', search: '' });
  const [showFilters, setShowFilters] = useState(false);

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20, ...Object.fromEntries(Object.entries(filters).filter(([,v]) => v)) });
      const res = await api.get(`/complaints?${params}`);
      setComplaints(res.data.complaints);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch { } finally { setLoading(false); }
  }, [page, filters]);

  useEffect(() => { fetchComplaints(); }, [fetchComplaints]);

  const activeCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 page-enter">
        <Header
          title="Toutes les plaintes"
          subtitle={`${total} plainte${total > 1 ? 's' : ''} au total`}
          actions={
            <div className="flex items-center gap-3">
              <button onClick={fetchComplaints} className="btn-ghost p-2.5"><RefreshCw size={16} /></button>
              <button onClick={() => setShowFilters(!showFilters)}
                className={`btn-ghost flex items-center gap-2 ${activeCount ? 'border-blue-500/50 text-blue-400' : ''}`}>
                <Filter size={16} /> Filtres
                {activeCount > 0 && <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{activeCount}</span>}
              </button>
            </div>
          }
        />

        {/* Search */}
        <div className="relative mb-4">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          <input className="input-field pl-11" placeholder="Recherche — référence, objet, service..."
            value={filters.search}
            onChange={e => { setFilters(p => ({ ...p, search: e.target.value })); setPage(1); }} />
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="card p-4 mb-4 grid grid-cols-4 gap-4 animate-fade-in">
            {[
              { label: 'Statut', key: 'statut', options: STATUTS.map(s => ({ value: s.value, label: s.label })) },
              { label: 'Service', key: 'service', options: SERVICES.map(s => ({ value: s, label: s })) },
              { label: 'Priorité', key: 'priorite', options: PRIORITES.map(p => ({ value: p.value, label: p.value })) },
            ].map(({ label, key, options }) => (
              <div key={key}>
                <label className="label">{label}</label>
                <div className="relative">
                  <select className="select-field pr-8 text-sm" value={filters[key]}
                    onChange={e => { setFilters(p => ({ ...p, [key]: e.target.value })); setPage(1); }}>
                    <option value="">Tous</option>
                    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">▾</div>
                </div>
              </div>
            ))}
            <div className="flex items-end">
              {activeCount > 0 && (
                <button onClick={() => setFilters({ statut:'', service:'', priorite:'', search:'' })}
                  className="btn-ghost text-sm flex items-center gap-2 w-full justify-center">
                  <X size={14} /> Effacer
                </button>
              )}
            </div>
          </div>
        )}

        {/* Table */}
        <div className="card overflow-hidden">
          {loading ? <Spinner /> : complaints.length === 0 ? (
            <EmptyState icon={Search} title="Aucune plainte" description="Aucun résultat pour ces critères." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800">
                    {['Réf.', 'Commercial', 'Service', 'Objet', 'Priorité', 'Statut', 'Ancienneté', 'Actions'].map(h => (
                      <th key={h} className="text-left px-4 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {complaints.map(c => (
                    <tr key={c.id} className="hover:bg-slate-800/30 transition-colors group">
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-blue-400 font-medium">{c.reference}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-700 to-purple-700 flex items-center justify-center text-xs text-white font-bold flex-shrink-0">
                            {c.declarant_name?.charAt(0)}
                          </div>
                          <span className="text-sm text-slate-300 whitespace-nowrap">{c.declarant_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-400 whitespace-nowrap">{c.service_concerne}</td>
                      <td className="px-4 py-3 max-w-[180px]">
                        <div className="text-sm text-slate-200 truncate">{c.objet}</div>
                        <div className="text-xs text-slate-600 truncate">{c.type_plainte}</div>
                      </td>
                      <td className="px-4 py-3"><PriorityBadge priorite={c.priorite} /></td>
                      <td className="px-4 py-3"><StatusBadge statut={c.statut} /></td>
                      <td className="px-4 py-3">
                        <span className={`flex items-center gap-1 text-xs whitespace-nowrap font-medium
                          ${c.anciennete_jours > 14 ? 'text-red-400' : c.anciennete_jours > 7 ? 'text-orange-400' : c.anciennete_jours > 3 ? 'text-amber-400' : 'text-slate-500'}`}>
                          <Clock size={11} />
                          {c.anciennete_jours === 0 ? 'Auj.' : `J+${c.anciennete_jours}`}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setViewId(c.id)}
                            className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-blue-400 transition-colors" title="Voir">
                            <Eye size={14} />
                          </button>
                          <button onClick={() => setEditItem(c)}
                            className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-amber-400 transition-colors" title="Modifier">
                            <Edit size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-slate-500">{total} résultats</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="btn-ghost p-2 disabled:opacity-30"><ChevronLeft size={16} /></button>
              <span className="text-sm text-slate-300 px-3">Page {page} / {totalPages}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages} className="btn-ghost p-2 disabled:opacity-30"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}

        <Modal isOpen={!!viewId} onClose={() => setViewId(null)} title="Détail de la plainte" size="lg">
          {viewId && <ComplaintDetail id={viewId} onClose={() => setViewId(null)} />}
        </Modal>

        <Modal isOpen={!!editItem} onClose={() => setEditItem(null)} title="Traiter la plainte" size="md">
          {editItem && (
            <EditPanel complaint={editItem} onClose={() => setEditItem(null)}
              onSave={() => { setEditItem(null); fetchComplaints(); }} />
          )}
        </Modal>
      </main>
    </div>
  );
};
