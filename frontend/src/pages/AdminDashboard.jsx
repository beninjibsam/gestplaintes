import { useState, useEffect } from 'react';
import {
  LayoutDashboard, FileText, Users, Clock, CheckCircle,
  AlertTriangle, TrendingUp, BarChart2, RefreshCw, Flame
} from 'lucide-react';
import { Sidebar, Header } from '../components/Layout';
import { StatCard, Spinner, StatusBadge, PriorityBadge } from '../components/UI';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { STATUTS } from '../constants';
import api from '../api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const COLORS = ['#3b82f6','#ef4444','#f59e0b','#10b981','#8b5cf6','#06b6d4','#f97316','#ec4899'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 shadow-2xl">
      <p className="text-sm text-slate-300 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-semibold" style={{ color: p.color }}>{p.value} plainte{p.value > 1 ? 's' : ''}</p>
      ))}
    </div>
  );
};

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get('/complaints/stats/dashboard')
      .then(res => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div className="flex min-h-screen"><Sidebar /><main className="flex-1 p-8"><Spinner /></main></div>;

  const openCount = stats.byStatut.filter(s => !['Résolue','Clôturée','Rejetée'].includes(s.statut)).reduce((a, b) => a + parseInt(b.count), 0);
  const resolvedCount = stats.byStatut.filter(s => ['Résolue','Clôturée'].includes(s.statut)).reduce((a, b) => a + parseInt(b.count), 0);
  const criticalCount = stats.byStatut.find(s => s.statut === 'Critique')?.count || 0;
  const resolutionRate = stats.total > 0 ? Math.round((resolvedCount / stats.total) * 100) : 0;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 page-enter overflow-y-auto">
        <Header
          title="Tableau de bord"
          subtitle="Vue globale — pilotage des plaintes internes"
          actions={
            <button onClick={load} className="btn-ghost flex items-center gap-2">
              <RefreshCw size={15} /> Actualiser
            </button>
          }
        />

        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <StatCard label="Total plaintes" value={stats.total} icon={FileText} color="blue" />
          <StatCard label="En cours" value={openCount} icon={Clock} color="amber" />
          <StatCard label="Taux résolution" value={`${resolutionRate}%`} icon={CheckCircle} color="green" />
          <StatCard label="Délai moyen" value={stats.avgResolutionDays ? `${stats.avgResolutionDays}j` : 'N/A'} icon={TrendingUp} color="purple" subtitle="De résolution" />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Plaintes par service */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-6">
              <BarChart2 size={16} className="text-blue-400" />
              <h2 className="text-sm font-semibold text-white">Plaintes par service</h2>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.byService} margin={{ left: -20, bottom: 20 }}>
                <XAxis dataKey="service_concerne" tick={{ fontSize: 11, fill: '#64748b' }}
                  angle={-30} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#3b82f6" radius={[4,4,0,0]} maxBarSize={40}
                  label={{ position: 'top', fontSize: 11, fill: '#94a3b8' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Répartition statuts */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-6">
              <BarChart2 size={16} className="text-purple-400" />
              <h2 className="text-sm font-semibold text-white">Répartition des statuts</h2>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={stats.byStatut} dataKey="count" nameKey="statut" cx="50%" cy="50%"
                  innerRadius={55} outerRadius={85} paddingAngle={3}>
                  {stats.byStatut.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [`${v} plainte${v>1?'s':''}`, n]} />
                <Legend formatter={(v) => <span style={{ fontSize: 11, color: '#94a3b8' }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-3 gap-6">
          {/* Top services les plus "plaignés" */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-5">
              <Flame size={16} className="text-red-400" />
              <h2 className="text-sm font-semibold text-white">Top services signalés</h2>
            </div>
            <div className="space-y-3">
              {stats.byService.slice(0, 5).map((s, i) => {
                const pct = Math.round((s.count / stats.total) * 100);
                return (
                  <div key={s.service_concerne}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-300 truncate max-w-[160px]">{s.service_concerne}</span>
                      <span className="text-slate-400 font-medium flex-shrink-0">{s.count}</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: COLORS[i] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top commerciaux déclarants */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-5">
              <Users size={16} className="text-blue-400" />
              <h2 className="text-sm font-semibold text-white">Top déclarants</h2>
            </div>
            <div className="space-y-3">
              {stats.topDeclarants.map((d, i) => (
                <div key={d.email} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                    {d.full_name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-slate-200 truncate">{d.full_name}</div>
                    <div className="text-xs text-slate-500 truncate">{d.email}</div>
                  </div>
                  <span className="text-sm font-bold text-blue-400">{d.count}</span>
                </div>
              ))}
              {stats.topDeclarants.length === 0 && <p className="text-sm text-slate-500">Aucune donnée</p>}
            </div>
          </div>

          {/* Recent complaints */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-5">
              <Clock size={16} className="text-amber-400" />
              <h2 className="text-sm font-semibold text-white">Dernières soumissions</h2>
            </div>
            <div className="space-y-3">
              {stats.recentComplaints.map(c => (
                <div key={c.reference} className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/40 hover:border-slate-600/60 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-blue-400">{c.reference}</span>
                      <PriorityBadge priorite={c.priorite} />
                    </div>
                    <p className="text-xs text-slate-300 truncate">{c.objet}</p>
                    <p className="text-xs text-slate-500 mt-0.5">par {c.declarant}</p>
                  </div>
                  <StatusBadge statut={c.statut} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
