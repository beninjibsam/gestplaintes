import { useState, useEffect } from 'react';
import { Users, Shield, UserCheck, UserX, Key, Search, RefreshCw } from 'lucide-react';
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
      await api.patch(`/users/${user.id}`, { is_active: !user.is_active });
      toast.success(`Compte ${!user.is_active ? 'activé' : 'suspendu'}`);
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

  const filtered = users.filter(u =>
    u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 page-enter">
        <Header
          title="Gestion des utilisateurs"
          subtitle={`${users.length} compte${users.length > 1 ? 's' : ''} enregistré${users.length > 1 ? 's' : ''}`}
          actions={<button onClick={load} className="btn-ghost p-2.5"><RefreshCw size={16} /></button>}
        />

        {/* Stats mini */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Commerciaux actifs', value: users.filter(u => u.role === 'commercial' && u.is_active).length, color: 'text-blue-400', bg: 'bg-blue-900/20' },
            { label: 'Administrateurs', value: users.filter(u => u.role === 'admin').length, color: 'text-red-400', bg: 'bg-red-900/20' },
            { label: 'Comptes suspendus', value: users.filter(u => !u.is_active).length, color: 'text-amber-400', bg: 'bg-amber-900/20' },
          ].map(s => (
            <div key={s.label} className={`card p-4 ${s.bg} border-opacity-30 flex items-center gap-4`}>
              <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-sm text-slate-400">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          <input className="input-field pl-11" placeholder="Rechercher par nom ou email..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div className="card overflow-hidden">
          {loading ? <Spinner /> : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800">
                    {['Utilisateur', 'Email', 'Rôle', 'Plaintes', 'Dernière connexion', 'Statut', 'Actions'].map(h => (
                      <th key={h} className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filtered.map(u => (
                    <tr key={u.id} className="hover:bg-slate-800/30 transition-colors group">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0
                            ${u.role === 'admin' ? 'bg-gradient-to-br from-red-600 to-red-800' : 'bg-gradient-to-br from-blue-600 to-blue-800'}`}>
                            {u.full_name.charAt(0)}
                          </div>
                          <span className="text-sm font-medium text-white">{u.full_name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-400">{u.email}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                          ${u.role === 'admin' ? 'bg-red-900/40 text-red-300' : 'bg-blue-900/40 text-blue-300'}`}>
                          {u.role === 'admin' ? <Shield size={11} /> : <UserCheck size={11} />}
                          {u.role === 'admin' ? 'Admin' : 'Commercial'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm font-medium text-slate-300">{u.complaint_count}</span>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-500 whitespace-nowrap">
                        {u.last_login ? format(new Date(u.last_login), 'dd/MM/yyyy HH:mm', { locale: fr }) : 'Jamais'}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                          ${u.is_active ? 'bg-emerald-900/40 text-emerald-300' : 'bg-red-900/40 text-red-300'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-emerald-400' : 'bg-red-400'}`} />
                          {u.is_active ? 'Actif' : 'Suspendu'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => toggleActive(u)} title={u.is_active ? 'Suspendre' : 'Activer'}
                            className={`p-1.5 rounded-lg transition-colors ${u.is_active ? 'hover:bg-red-900/40 hover:text-red-400' : 'hover:bg-emerald-900/40 hover:text-emerald-400'} text-slate-400`}>
                            {u.is_active ? <UserX size={14} /> : <UserCheck size={14} />}
                          </button>
                          <button onClick={() => toggleRole(u)} title="Changer rôle"
                            className="p-1.5 rounded-lg hover:bg-amber-900/40 hover:text-amber-400 text-slate-400 transition-colors">
                            <Shield size={14} />
                          </button>
                          <button onClick={() => resetPassword(u)} title="Réinitialiser MDP"
                            className="p-1.5 rounded-lg hover:bg-blue-900/40 hover:text-blue-400 text-slate-400 transition-colors">
                            <Key size={14} />
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

        <Modal isOpen={!!resetModal} onClose={() => { setResetModal(null); setTempPwd(''); }} title="Mot de passe réinitialisé" size="sm">
          {resetModal && (
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-300">Le mot de passe de <strong className="text-white">{resetModal.full_name}</strong> a été réinitialisé.</p>
              <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                <div className="text-xs text-slate-500 mb-1">Mot de passe temporaire</div>
                <div className="font-mono text-lg text-amber-400 font-bold tracking-wider">{tempPwd}</div>
              </div>
              <p className="text-xs text-slate-500">Communiquez ce mot de passe à l'utilisateur. Il devra le changer à sa prochaine connexion.</p>
              <button onClick={() => { setResetModal(null); setTempPwd(''); }} className="btn-primary w-full">Fermer</button>
            </div>
          )}
        </Modal>
      </main>
    </div>
  );
};
