import { useState, useEffect } from 'react';
import {
  FileText, Users, Clock, CheckCircle,
  TrendingUp, BarChart2, RefreshCw, Flame
} from 'lucide-react';
import { Sidebar, Header } from '../components/Layout';
import { StatCard, Spinner, StatusBadge, PriorityBadge } from '../components/UI';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import api from '../api';

const COLORS = ['#3b82f6','#ef4444','#f59e0b','#10b981','#8b5cf6','#06b6d4','#f97316','#ec4899'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '10px 16px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
      <p style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ fontSize: 13, fontWeight: 600, color: p.color, margin: 0 }}>
          {p.value} plainte{p.value > 1 ? 's' : ''}
        </p>
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

  if (loading) return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8"><Spinner /></main>
    </div>
  );

  const openCount = stats.byStatut
    .filter(s => !['Résolue','Clôturée','Rejetée'].includes(s.statut))
    .reduce((a, b) => a + parseInt(b.count), 0);
  const resolvedCount = stats.byStatut
    .filter(s => ['Résolue','Clôturée'].includes(s.statut))
    .reduce((a, b) => a + parseInt(b.count), 0);
  const resolutionRate = stats.total > 0 ? Math.round((resolvedCount / stats.total) * 100) : 0;

  return (
    <div className="flex min-h-screen bg-slate-50">
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
          <StatCard label="Total plaintes"   value={stats.total}                                           icon={FileText}    color="blue"   />
          <StatCard label="En cours"         value={openCount}                                             icon={Clock}       color="amber"  />
          <StatCard label="Taux résolution"  value={`${resolutionRate}%`}                                  icon={CheckCircle} color="green"  />
          <StatCard label="Délai moyen"      value={stats.avgResolutionDays ? `${stats.avgResolutionDays}j` : 'N/A'} icon={TrendingUp}  color="purple" subtitle="De résolution" />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-2 gap-6 mb-6">

          {/* Plaintes par service */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                <BarChart2 size={15} className="text-blue-600" />
              </div>
              <h2 className="text-sm font-semibold text-slate-700">Plaintes par service</h2>
            </div>
            {stats.byService.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-52 text-slate-400">
                <BarChart2 size={32} className="mb-2 opacity-30" />
                <p className="text-sm">Aucune donnée</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stats.byService} margin={{ left: -20, bottom: 24 }}>
                  <XAxis dataKey="service_concerne"
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    angle={-30} textAnchor="end" interval={0} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[6,6,0,0]} maxBarSize={44}
                    label={{ position: 'top', fontSize: 11, fill: '#64748b', fontWeight: 600 }} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Répartition statuts */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center">
                <BarChart2 size={15} className="text-purple-600" />
              </div>
              <h2 className="text-sm font-semibold text-slate-700">Répartition des statuts</h2>
            </div>
            {stats.byStatut.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-52 text-slate-400">
                <BarChart2 size={32} className="mb-2 opacity-30" />
                <p className="text-sm">Aucune donnée</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={stats.byStatut} dataKey="count" nameKey="statut"
                    cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3}>
                    {stats.byStatut.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v, n) => [`${v} plainte${v>1?'s':''}`, n]} />
                  <Legend formatter={(v) => <span style={{ fontSize: 11, color: '#64748b' }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-3 gap-6">

          {/* Top services */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
                <Flame size={15} className="text-red-500" />
              </div>
              <h2 className="text-sm font-semibold text-slate-700">Top services signalés</h2>
            </div>
            <div className="space-y-4">
              {stats.byService.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-6">Aucune donnée</p>
              )}
              {stats.byService.slice(0, 5).map((s, i) => {
                const pct = stats.total > 0 ? Math.round((s.count / stats.total) * 100) : 0;
                return (
                  <div key={s.service_concerne}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-slate-600 truncate max-w-[150px] font-medium">{s.service_concerne}</span>
                      <span className="text-slate-500 font-semibold flex-shrink-0 ml-2">{s.count}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: COLORS[i] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top déclarants */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                <Users size={15} className="text-blue-600" />
              </div>
              <h2 className="text-sm font-semibold text-slate-700">Top déclarants</h2>
            </div>
            <div className="space-y-3">
              {stats.topDeclarants.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-6">Aucune donnée</p>
              )}
              {stats.topDeclarants.map((d, i) => (
                <div key={d.email} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                    {d.full_name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-slate-700 font-medium truncate">{d.full_name}</div>
                    <div className="text-xs text-slate-400 truncate">{d.email}</div>
                  </div>
                  <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
                    {d.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Dernières soumissions */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                <Clock size={15} className="text-amber-600" />
              </div>
              <h2 className="text-sm font-semibold text-slate-700">Dernières soumissions</h2>
            </div>
            <div className="space-y-3">
              {stats.recentComplaints.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-6">Aucune donnée</p>
              )}
              {stats.recentComplaints.map(c => (
                <div key={c.reference}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 hover:bg-white transition-all">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-mono text-xs font-semibold text-blue-600">{c.reference}</span>
                    <PriorityBadge priorite={c.priorite} />
                  </div>
                  <p className="text-xs text-slate-600 font-medium truncate mb-1">{c.objet}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-400">par {c.declarant}</p>
                    <StatusBadge statut={c.statut} />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};
