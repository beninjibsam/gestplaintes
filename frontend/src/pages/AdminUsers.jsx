import { useState, useEffect } from 'react';
import { Users, Shield, UserCheck, UserX, Key, Search, RefreshCw, Clock } from 'lucide-react';
import { Sidebar, Header } from '../components/Layout';
import { Spinner, Modal } from '../components/UI';
import api from '../api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [resetModal, setResetModal] = useState(null);
  const [tempPwd, setTempPwd] = useState('');
  const [filter, setFilter] = useState('all');

  const load = () => {
    setLoading(true);
    api.get('/users')
      .then(res => setUsers(res.data.users))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const toggleActive = async (user) => {
    try {
      // Activer = is_active true + pending_approval false
      const patch = user.is_active
        ? { is_active: false }
        : { is_active: true, pending_approval: false };
      await api.patch(`/users/${user.id}`, patch);
      toast.success(`Compte ${!user.is_active ? 'activé' : 'suspendu'}`);
      load();
    } catch { toast.error('Erreur'); }
  };

  const approveUser = async (user) => {
    try {
      await api.patch(`/users/${user.id}`, { is_active: true, pending_approval: false });
      toast.success(`Compte de ${user.full_name} validé`);
      load();
    } catch { toast.error('Erreur'); }
  };

  const toggleRole = async (user) => {
    const newRole = user.role === 'admin' ? 'commercial' : 'admin';
    if (!confirm(`Passer ${user.full_name} en ${newRole} ?`)) return;
    try {
      await api.patch(`/users/${user.id}`, { role: newRole });
      toast.success('Rôle modifié');
      load();
    } catch { toast.error('Erreur'); }
  };

  const resetPassword = async (user) => {
    try {
      const res = await api.post(`/users/${user.id}/reset-password`);
      setTempPwd(res.data.tempPassword);
      setResetModal(user);
    } catch { toast.error('Erreur'); }
  };

  const pendingCount = users.filter(u => u.pending_approval && u.email_verified).length;

  const filtered = users.filter(u => {
    const matchSearch = u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    if (filter === 'pending') return matchSearch && u.pending_approval && u.email_verified;
    if (filter === 'active') return matchSearch && u.is_active && !u.pending_approval;
    if (filter === 'suspended') return matchSearch && !u.is_active && !u.pending_approval;
    return matchSearch;
  });

  const getStatus = (u) => {
    if (!u.email_verified) return { label: 'Email non confirmé', cls: 'bg-slate-100 text-slate-500 border border-slate-200' };
    if (u.pending_approval) return { label: 'En attente', cls: 'bg-amber-50 text-amber-700 border border-amber-200' };
    if (!u.is_active) return { label: 'Suspendu', cls: 'bg-red-50 text-red-700 border border-red-200' };
    return { label: 'Actif', cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200' };
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8 page-enter overflow-y-auto">
        <Header
          title="Gestion des utilisateurs"
          subtitle={`${users.length} compte${users.length > 1 ? 's' : ''} enregistré${users.length > 1 ? 's' : ''}`}
          actions={<button onClick={load} className="btn-ghost p-2.5"><RefreshCw size={16} /></button>}
        />

        {/* Alerte comptes en attente */}
        {pendingCount > 0 && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Clock size={18} className="text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800">
                {pendingCount} compte{pendingCount > 1 ? 's' : ''} en attente de validation
              </p>
              <p className="text-xs text-amber-600 mt-0.5">Ces commerciaux ont confirmé leur email et attendent votre approbation.</p>
            </div>
            <button onClick={() => setFilter('pending')} className="text-xs font-semibold text-amber-700 hover:text-amber-900 underline">
              Voir
            </button>
          </div>
        )}

        {/* Stats mini */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Commerciaux actifs', value: users.filter(u => u.role === 'commercial' && u.is_active).length, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
            { label: 'En attente', value: pendingCount, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
            { label: 'Administrateurs', value: users.filter(u => u.role === 'admin').length, color: 'text-red-600', bg: 'bg-red-50 border-red-100' },
            { label: 'Suspendus', value: users.filter(u => !u.is_active && !u.pending_approval).length, color: 'text-slate-500', bg: 'bg-slate-100 border-slate-200' },
          ].map(s => (
            <div key={s.label} className={`card p-4 border ${s.bg} flex items-center gap-3`}>
              <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-sm text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filtres + recherche */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input className="input-field pl-11" placeholder="Rechercher par nom ou email..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-2">
            {[
              { key: 'all', label: 'Tous' },
              { key: 'pending', label: 'En attente' },
              { key: 'active', label: 'Actifs' },
              { key: 'suspended', label: 'Suspendus' },
            ].map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all border
                  ${filter === f.key
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}>
                {f.label}
                {f.key === 'pending' && pendingCount > 0 && (
                  <span className="ml-1.5 bg-amber-500 text-white text-xs rounded-full px-1.5 py-0.5">{pendingCount}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="card overflow-hidden">
          {loading ? <Spinner /> : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {['Utilisateur', 'Email', 'Rôle', 'Plaintes', 'Dernière connexion', 'Statut', 'Actions'].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.length === 0 && (
                    <tr><td colSpan={7} className="text-center py-12 text-slate-400 text-sm">Aucun utilisateur trouvé</td></tr>
                  )}
                  {filtered.map(u => {
                    const status = getStatus(u);
                    return (
                      <tr key={u.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0
                              ${u.role === 'admin' ? 'bg-gradient-to-br from-red-500 to-red-700' : 'bg-gradient-to-br from-blue-500 to-blue-700'}`}>
                              {u.full_name.charAt(0)}
                            </div>
                            <div>
                              <span className="text-sm font-medium text-slate-800">{u.full_name}</span>
                              {u.pending_approval && u.email_verified && (
                                <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">À valider</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-500">{u.email}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                            ${u.role === 'admin' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>
                            {u.role === 'admin' ? <Shield size={11} /> : <UserCheck size={11} />}
                            {u.role === 'admin' ? 'Admin' : 'Commercial'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm font-medium text-slate-700">{u.complaint_count}</span>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-400 whitespace-nowrap">
                          {u.last_login ? format(new Date(u.last_login), 'dd/MM/yyyy HH:mm', { locale: fr }) : 'Jamais'}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.cls}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            {status.label}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {/* Bouton Valider — visible uniquement si en attente */}
                            {u.pending_approval && u.email_verified && (
                              <button onClick={() => approveUser(u)} title="Valider le compte"
                                className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-colors border border-emerald-200">
                                <UserCheck size={14} />
                              </button>
                            )}
                            {/* Activer / Suspendre */}
                            {!u.pending_approval && (
                              <button onClick={() => toggleActive(u)} title={u.is_active ? 'Suspendre' : 'Réactiver'}
                                className={`p-1.5 rounded-lg transition-colors border
                                  ${u.is_active
                                    ? 'bg-red-50 hover:bg-red-100 text-red-500 border-red-200'
                                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border-emerald-200'}`}>
                                {u.is_active ? <UserX size={14} /> : <UserCheck size={14} />}
                              </button>
                            )}
                            <button onClick={() => toggleRole(u)} title="Changer rôle"
                              className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-600 transition-colors border border-amber-200">
                              <Shield size={14} />
                            </button>
                            <button onClick={() => resetPassword(u)} title="Réinitialiser MDP"
                              className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors border border-blue-200">
                              <Key size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <Modal isOpen={!!resetModal} onClose={() => { setResetModal(null); setTempPwd(''); }} title="Mot de passe réinitialisé" size="sm">
          {resetModal && (
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600">Le mot de passe de <strong className="text-slate-800">{resetModal.full_name}</strong> a été réinitialisé.</p>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="text-xs text-slate-400 mb-1">Mot de passe temporaire</div>
                <div className="font-mono text-lg text-blue-600 font-bold tracking-wider">{tempPwd}</div>
              </div>
              <p className="text-xs text-slate-400">Communiquez ce mot de passe à l'utilisateur.</p>
              <button onClick={() => { setResetModal(null); setTempPwd(''); }} className="btn-primary w-full">Fermer</button>
            </div>
          )}
        </Modal>
      </main>
    </div>
  );
};
