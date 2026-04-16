import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Clock, CheckCircle, AlertTriangle, Plus, ArrowRight, TrendingUp } from 'lucide-react';
import { Sidebar, Header } from '../components/Layout';
import { StatCard, StatusBadge, PriorityBadge, Spinner } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/complaints?limit=5')
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const complaints = data?.complaints || [];
  const total = data?.total || 0;

  const counts = {
    active: complaints.filter(c => !['Résolue','Clôturée','Rejetée'].includes(c.statut)).length,
    resolved: complaints.filter(c => ['Résolue','Clôturée'].includes(c.statut)).length,
    critical: complaints.filter(c => c.priorite === 'Critique').length,
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 page-enter">
        <Header
          title={`Bonjour, ${user?.full_name?.split(' ')[0]} 👋`}
          subtitle="Voici l'état de vos plaintes déclarées"
          actions={
            <button onClick={() => navigate('/complaints/new')} className="btn-primary flex items-center gap-2">
              <Plus size={16} /> Nouvelle plainte
            </button>
          }
        />

        {loading ? <Spinner /> : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              <StatCard label="Total plaintes" value={total} icon={FileText} color="blue" />
              <StatCard label="En cours" value={counts.active} icon={Clock} color="amber" />
              <StatCard label="Résolues" value={counts.resolved} icon={CheckCircle} color="green" />
              <StatCard label="Critiques" value={counts.critical} icon={AlertTriangle} color="red" />
            </div>

            {/* Recent complaints */}
            <div className="card">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                  <TrendingUp size={16} className="text-blue-400" />
                  Dernières plaintes
                </h2>
                <button onClick={() => navigate('/complaints')} className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
                  Voir tout <ArrowRight size={14} />
                </button>
              </div>

              {complaints.length === 0 ? (
                <div className="p-12 text-center">
                  <FileText size={40} className="mx-auto text-slate-700 mb-3" />
                  <p className="text-slate-400 mb-4">Vous n'avez pas encore de plainte</p>
                  <button onClick={() => navigate('/complaints/new')} className="btn-primary inline-flex items-center gap-2">
                    <Plus size={16} /> Déclarer ma première plainte
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-800/60">
                  {complaints.map(c => (
                    <div key={c.id} onClick={() => navigate('/complaints')}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-slate-800/40 transition-colors cursor-pointer group">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center flex-shrink-0 border border-slate-700 group-hover:border-blue-700/50 transition-colors">
                        <FileText size={16} className="text-slate-400 group-hover:text-blue-400 transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-blue-400">{c.reference}</span>
                          <span className="text-slate-600">·</span>
                          <span className="text-xs text-slate-500 truncate">{c.service_concerne}</span>
                        </div>
                        <p className="text-sm text-slate-200 font-medium truncate mt-0.5">{c.objet}</p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <PriorityBadge priorite={c.priorite} />
                        <StatusBadge statut={c.statut} />
                        <span className="text-xs text-slate-600">
                          {formatDistanceToNow(new Date(c.created_at), { addSuffix: true, locale: fr })}
                        </span>
                        <ArrowRight size={14} className="text-slate-600 group-hover:text-blue-400 transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick action banner */}
            <div className="mt-4 p-5 rounded-2xl bg-gradient-to-r from-blue-900/40 via-blue-800/20 to-red-900/20 border border-blue-800/30 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Nouveau dysfonctionnement à signaler ?</h3>
                <p className="text-xs text-slate-400 mt-0.5">Soumettez une plainte en moins de 2 minutes</p>
              </div>
              <button onClick={() => navigate('/complaints/new')} className="btn-primary text-sm flex items-center gap-2">
                <Plus size={14} /> Déclarer maintenant
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};
