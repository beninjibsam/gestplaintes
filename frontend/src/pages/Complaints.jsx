import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, Filter, FileText, Eye, Clock,
  ChevronLeft, ChevronRight, RefreshCw, X, CheckCircle2
} from 'lucide-react';
import { Sidebar, Header } from '../components/Layout';
import { StatusBadge, PriorityBadge, EmptyState, Spinner, Modal } from '../components/UI';
import { STATUTS, SERVICES } from '../constants';
import { ComplaintDetail } from './ComplaintDetail';
import api from '../api';
import toast from 'react-hot-toast';

export const ComplaintsPage = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState(null);
  const [resolving, setResolving] = useState(null);
  const [filters, setFilters] = useState({ statut: '', service: '', priorite: '', search: '' });
  const [showFilters, setShowFilters] = useState(false);

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page, limit: 15,
        ...Object.fromEntries(Object.entries(filters).filter(([,v]) => v))
      });
      const res = await api.get(`/complaints?${params}`);
      setComplaints(res.data.complaints);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => { fetchComplaints(); }, [fetchComplaints]);

  const handleResolve = async (c) => {
    if (!confirm(`Confirmer que la plainte "${c.objet}" a été résolue ?`)) return;
    setResolving(c.id);
    try {
      await api.patch(`/complaints/${c.id}/resolve`);
      toast.success('Plainte marquée comme résolue');
      fetchComplaints();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur');
    } finally {
      setResolving(null);
    }
  };

  const clearFilters = () => { setFilters({ statut: '', service: '', priorite: '', search: '' }); setPage(1); };
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  // Statuts où le commercial peut marquer comme résolu
  const canResolve = (c) => !['Résolue', 'Clôturée', 'Rejetée'].includes(c.statut);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8 page-enter">
        <Header
          title="Mes plaintes"
          subtitle={`${total} plainte${total > 1 ? 's' : ''} déclarée${total > 1 ? 's' : ''}`}
          actions={
            <div className="flex items-center gap-3">
              <button onClick={fetchComplaints} className="btn-ghost p-2.5"><RefreshCw size={16} /></button>
              <button onClick={() => setShowFilters(!showFilters)}
                className={`btn-ghost flex items-center gap-2 ${activeFilterCount > 0 ? 'border-blue-400 text-blue-600' : ''}`}>
                <Filter size={16} /> Filtres
                {activeFilterCount > 0 && (
                  <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{activeFilterCount}</span>
                )}
              </button>
              <button onClick={() => navigate('/complaints/new')} className="btn-primary flex items-center gap-2">
                <Plus size={16} /> Nouvelle plainte
              </button>
            </div>
          }
        />

        {/* Bandeau info résolution */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-2">
          <CheckCircle2 size={16} className="text-blue-500 flex-shrink-0" />
          <p className="text-sm text-blue-700">
            Vous pouvez marquer vos plaintes comme <strong>Résolues</strong> une fois le problème réglé.
            La clôture définitive intervient automatiquement après 7 jours.
          </p>
        </div>

        {/* Recherche */}
        <div className="relative mb-4">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input className="input-field pl-11 pr-4" placeholder="Rechercher par référence, objet..."
            value={filters.search}
            onChange={e => { setFilters(p => ({ ...p, search: e.target.value })); setPage(1); }} />
          {filters.search && (
            <button onClick={() => setFilters(p => ({ ...p, search: '' }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filtres */}
        {showFilters && (
          <div className="card p-4 mb-4 grid grid-cols-3 gap-4 animate-fade-in">
            <div>
              <label className="label">Statut</label>
              <div className="relative">
                <select className="select-field pr-8 text-sm" value={filters.statut}
                  onChange={e => { setFilters(p => ({ ...p, statut: e.target.value })); setPage(1); }}>
                  <option value="">Tous les statuts</option>
                  {STATUTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">▾</div>
              </div>
            </div>
            <div>
              <label className="label">Service</label>
              <div className="relative">
                <select className="select-field pr-8 text-sm" value={filters.service}
                  onChange={e => { setFilters(p => ({ ...p, service: e.target.value })); setPage(1); }}>
                  <option value="">Tous les services</option>
                  {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">▾</div>
              </div>
            </div>
            <div className="flex items-end">
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="btn-ghost text-sm flex items-center gap-2 w-full justify-center">
                  <X size={14} /> Réinitialiser
                </button>
              )}
            </div>
          </div>
        )}

        {/* Tableau */}
        <div className="card overflow-hidden">
          {loading ? <Spinner /> : complaints.length === 0 ? (
            <EmptyState icon={FileText} title="Aucune plainte trouvée"
              description={activeFilterCount > 0 ? "Aucun résultat pour ces filtres." : "Vous n'avez pas encore soumis de plainte."}
              action={
                <button onClick={() => navigate('/complaints/new')} className="btn-primary flex items-center gap-2">
                  <Plus size={16} /> Déclarer ma première plainte
                </button>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {['Référence', 'Service', 'Objet', 'Priorité', 'Statut', 'Date', 'Ancienneté', 'Actions'].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {complaints.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors duration-150 group">
                      <td className="px-5 py-4">
                        <span className="font-mono text-sm text-blue-600 font-semibold">{c.reference}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-slate-600 whitespace-nowrap">{c.service_concerne}</span>
                      </td>
                      <td className="px-5 py-4 max-w-[220px]">
                        <div className="text-sm text-slate-800 truncate font-medium">{c.objet}</div>
                        <div className="text-xs text-slate-400 truncate mt-0.5">{c.type_plainte}</div>
                      </td>
                      <td className="px-5 py-4"><PriorityBadge priorite={c.priorite} /></td>
                      <td className="px-5 py-4"><StatusBadge statut={c.statut} /></td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-500">{new Date(c.created_at).toLocaleDateString('fr-FR')}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`flex items-center gap-1 text-xs whitespace-nowrap font-medium
                          ${c.anciennete_jours > 7 ? 'text-orange-500' : c.anciennete_jours > 3 ? 'text-amber-500' : 'text-slate-400'}`}>
                          <Clock size={12} />
                          {c.anciennete_jours === 0 ? "Aujourd'hui" : `J+${c.anciennete_jours}`}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          {/* Bouton voir */}
                          <button onClick={() => setSelected(c)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-all"
                            title="Voir le détail">
                            <Eye size={15} />
                          </button>
                          {/* Bouton résoudre — visible si statut compatible */}
                          {canResolve(c) && (
                            <button
                              onClick={() => handleResolve(c)}
                              disabled={resolving === c.id}
                              title="Marquer comme résolue"
                              className="p-1.5 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 border border-transparent hover:border-emerald-200 transition-all disabled:opacity-50">
                              {resolving === c.id
                                ? <Clock size={15} className="animate-spin" />
                                : <CheckCircle2 size={15} />}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-slate-500">{total} résultats</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="btn-ghost p-2 disabled:opacity-30">
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm text-slate-600 px-3">Page {page} / {totalPages}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages} className="btn-ghost p-2 disabled:opacity-30">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.reference || ''} size="lg">
          {selected && <ComplaintDetail id={selected.id} onClose={() => setSelected(null)} />}
        </Modal>
      </main>
    </div>
  );
};
