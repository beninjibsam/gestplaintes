import { useState, useEffect } from 'react';
import { Building2, Tag, Clock, Paperclip, History, MessageSquare, User, CheckCircle } from 'lucide-react';
import { StatusBadge, PriorityBadge, Spinner } from '../components/UI';
import api from '../api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const ComplaintDetail = ({ id, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/complaints/${id}`)
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner />;
  if (!data) return <div className="p-6 text-slate-400">Erreur de chargement</div>;

  const { complaint: c, history } = data;

  return (
    <div className="p-6 space-y-6">
      {/* Header info */}
      <div className="grid grid-cols-2 gap-4">
        <InfoBlock icon={Building2} label="Service concerné" value={c.service_concerne} color="blue" />
        <InfoBlock icon={Tag} label="Type de plainte" value={c.type_plainte} color="purple" />
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <StatusBadge statut={c.statut} size="lg" />
        <PriorityBadge priorite={c.priorite} />
        {c.service_assigne && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-indigo-900/40 text-indigo-300 border border-indigo-800/40">
            <User size={12} /> Assigné : {c.service_assigne}
          </span>
        )}
      </div>

      {/* Objet + description */}
      <div className="space-y-3">
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Objet</label>
          <p className="text-white font-medium mt-1">{c.objet}</p>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</label>
          <p className="text-slate-300 text-sm mt-1 whitespace-pre-wrap leading-relaxed bg-slate-800/60 rounded-xl p-4 border border-slate-700/40">
            {c.description}
          </p>
        </div>
      </div>

      {/* Meta grid */}
      <div className="grid grid-cols-2 gap-3">
        {c.impact_metier && (
          <div className="bg-red-900/20 border border-red-800/30 rounded-xl p-3">
            <div className="text-xs text-red-400 mb-0.5">Impact métier</div>
            <div className="text-sm text-red-300 font-medium">{c.impact_metier}</div>
          </div>
        )}
        {c.date_incident && (
          <div className="bg-slate-800/60 border border-slate-700/40 rounded-xl p-3">
            <div className="text-xs text-slate-500 mb-0.5">Date incident</div>
            <div className="text-sm text-slate-300">{format(new Date(c.date_incident), 'dd MMMM yyyy', { locale: fr })}</div>
          </div>
        )}
        {c.reference_metier && (
          <div className="bg-slate-800/60 border border-slate-700/40 rounded-xl p-3">
            <div className="text-xs text-slate-500 mb-0.5">Référence métier</div>
            <div className="text-sm font-mono text-amber-400">{c.reference_metier}</div>
          </div>
        )}
        <div className="bg-slate-800/60 border border-slate-700/40 rounded-xl p-3">
          <div className="text-xs text-slate-500 mb-0.5">Soumise le</div>
          <div className="text-sm text-slate-300">{format(new Date(c.created_at), 'dd/MM/yyyy à HH:mm', { locale: fr })}</div>
        </div>
      </div>

      {/* Admin comment */}
      {c.commentaire_admin && (
        <div className="bg-blue-900/20 border border-blue-700/40 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare size={14} className="text-blue-400" />
            <span className="text-sm font-semibold text-blue-300">Réponse de l'administration</span>
          </div>
          <p className="text-sm text-blue-200 whitespace-pre-wrap">{c.commentaire_admin}</p>
        </div>
      )}

      {/* Attachment */}
      {c.piece_jointe && (
        <div className="flex items-center gap-3 p-3 bg-slate-800/60 rounded-xl border border-slate-700/40">
          <Paperclip size={16} className="text-slate-400 flex-shrink-0" />
          <span className="text-sm text-slate-300 flex-1 truncate">{c.piece_jointe}</span>
          <a href={`/uploads/${c.piece_jointe}`} target="_blank" rel="noopener noreferrer"
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium">
            Télécharger
          </a>
        </div>
      )}

      {/* History timeline */}
      {history?.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <History size={16} className="text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-300">Historique des actions</h3>
          </div>
          <div className="space-y-3">
            {history.map((h, i) => (
              <div key={h.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${i === 0 ? 'bg-blue-600' : 'bg-slate-700'}`}>
                    {i === 0 ? <CheckCircle size={12} className="text-white" /> : <Clock size={10} className="text-slate-400" />}
                  </div>
                  {i < history.length - 1 && <div className="w-px flex-1 bg-slate-800 mt-1" />}
                </div>
                <div className="pb-3 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-slate-200">{h.action}</span>
                    {h.new_value && <span className="text-xs px-2 py-0.5 bg-slate-800 text-slate-300 rounded-full">{h.new_value}</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {h.full_name && <span className="text-xs text-slate-500">par {h.full_name}</span>}
                    <span className="text-xs text-slate-600">{format(new Date(h.created_at), 'dd/MM/yyyy HH:mm', { locale: fr })}</span>
                  </div>
                  {h.commentaire && (
                    <p className="text-xs text-slate-400 mt-1 bg-slate-800/40 rounded-lg px-3 py-2 border border-slate-700/30">{h.commentaire}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const InfoBlock = ({ icon: Icon, label, value, color = 'blue' }) => {
  const colors = {
    blue: 'bg-blue-900/20 border-blue-800/30 text-blue-300',
    purple: 'bg-purple-900/20 border-purple-800/30 text-purple-300',
  };
  return (
    <div className={`border rounded-xl p-3 ${colors[color]}`}>
      <div className="flex items-center gap-2 mb-0.5">
        <Icon size={13} className="flex-shrink-0" />
        <span className="text-xs opacity-70">{label}</span>
      </div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
};
