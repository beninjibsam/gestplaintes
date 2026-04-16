import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle, Building2, Tag, FileText, AlignLeft, Zap,
  Calendar, Paperclip, Hash, ChevronRight, CheckCircle, Loader,
  TrendingDown, X
} from 'lucide-react';
import { Sidebar, Header } from '../components/Layout';
import { SelectField, InputField, TextareaField, Alert } from '../components/UI';
import { SERVICES, TYPES_PLAINTE, IMPACTS_METIER, PRIORITES } from '../constants';
import api from '../api';
import toast from 'react-hot-toast';

const STEPS = [
  { id: 1, label: 'Identification',  icon: Building2 },
  { id: 2, label: 'Description',     icon: AlignLeft },
  { id: 3, label: 'Impact & Priorité', icon: Zap },
  { id: 4, label: 'Détails',         icon: Hash },
];

export const NewComplaintPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [file, setFile] = useState(null);
  const [form, setForm] = useState({
    service_concerne: '',
    type_plainte: '',
    objet: '',
    description: '',
    impact_metier: '',
    priorite: 'Moyenne',
    date_incident: '',
    reference_metier: '',
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const canNext = () => {
    if (step === 1) return form.service_concerne && form.type_plainte;
    if (step === 2) return form.objet.trim().length >= 5 && form.description.trim().length >= 20;
    if (step === 3) return form.priorite;
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) data.append(k, v); });
      if (file) data.append('piece_jointe', file);
      await api.post('/complaints', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Plainte soumise avec succès !');
      navigate('/complaints');
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la soumission');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 page-enter">
        <Header
          title="Nouvelle plainte"
          subtitle="Déclarez un dysfonctionnement interne"
          actions={
            <button onClick={() => navigate('/complaints')} className="btn-ghost flex items-center gap-2">
              <X size={16} /> Annuler
            </button>
          }
        />

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const done = step > s.id;
            const active = step === s.id;
            return (
              <div key={s.id} className="flex items-center gap-2">
                <button
                  onClick={() => done && setStep(s.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200
                    ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' :
                      done ? 'bg-emerald-900/40 text-emerald-400 cursor-pointer hover:bg-emerald-900/60' :
                      'bg-slate-800 text-slate-500 cursor-default'}`}
                >
                  {done ? <CheckCircle size={15} /> : <Icon size={15} />}
                  <span className="hidden sm:inline">{s.label}</span>
                  <span className="sm:hidden">{s.id}</span>
                </button>
                {i < STEPS.length - 1 && (
                  <ChevronRight size={14} className={`${step > s.id ? 'text-emerald-400' : 'text-slate-700'}`} />
                )}
              </div>
            );
          })}
        </div>

        <div className="max-w-2xl">
          <div className="card p-8 space-y-6">
            {error && <Alert type="error" message={error} />}

            {/* STEP 1 — Identification */}
            {step === 1 && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-900/40 flex items-center justify-center">
                    <Building2 size={16} className="text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">Service concerné</h2>
                    <p className="text-xs text-slate-400">Quel service est à l'origine du problème ?</p>
                  </div>
                </div>

                <SelectField label="Service concerné" required
                  value={form.service_concerne} onChange={e => set('service_concerne', e.target.value)}>
                  <option value="">-- Sélectionner un service --</option>
                  {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                </SelectField>

                <SelectField label="Type de plainte" required
                  value={form.type_plainte} onChange={e => set('type_plainte', e.target.value)}>
                  <option value="">-- Catégorie du problème --</option>
                  {TYPES_PLAINTE.map(t => <option key={t} value={t}>{t}</option>)}
                </SelectField>

                {/* Visual service cards */}
                {form.service_concerne && (
                  <div className="p-4 bg-blue-900/20 border border-blue-800/40 rounded-xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center">
                      <Building2 size={18} className="text-blue-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-blue-300">{form.service_concerne}</div>
                      <div className="text-xs text-slate-500">{form.type_plainte || 'Sélectionnez un type'}</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2 — Description */}
            {step === 2 && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-900/40 flex items-center justify-center">
                    <AlignLeft size={16} className="text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">Description du problème</h2>
                    <p className="text-xs text-slate-400">Soyez précis pour faciliter le traitement</p>
                  </div>
                </div>

                <InputField label="Objet de la plainte" required icon={FileText}
                  placeholder="Ex: Retard paiement commissions mars 2026"
                  value={form.objet} onChange={e => set('objet', e.target.value)}
                  maxLength={255}
                />
                <div className="text-right text-xs text-slate-500">{form.objet.length}/255</div>

                <TextareaField label="Description détaillée" required rows={6}
                  placeholder="Décrivez le contexte, les faits, les impacts constatés...&#10;&#10;Soyez aussi précis que possible : dates, personnes impliquées, tentatives de résolution déjà effectuées..."
                  value={form.description} onChange={e => set('description', e.target.value)}
                />
                <div className="flex justify-between text-xs text-slate-500">
                  <span>{form.description.length < 20 ? `Encore ${20 - form.description.length} caractères min.` : '✓ Description suffisante'}</span>
                  <span>{form.description.length} caractères</span>
                </div>
              </div>
            )}

            {/* STEP 3 — Impact & Priorité */}
            {step === 3 && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-red-900/40 flex items-center justify-center">
                    <Zap size={16} className="text-red-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">Impact et urgence</h2>
                    <p className="text-xs text-slate-400">Ces informations guident la priorisation du traitement</p>
                  </div>
                </div>

                <SelectField label="Impact métier" value={form.impact_metier} onChange={e => set('impact_metier', e.target.value)}>
                  <option value="">-- Sélectionner l'impact --</option>
                  {IMPACTS_METIER.map(i => <option key={i} value={i}>{i}</option>)}
                </SelectField>

                <div>
                  <label className="label">Niveau de priorité <span className="text-red-400">*</span></label>
                  <div className="grid grid-cols-2 gap-3">
                    {PRIORITES.map(p => (
                      <button key={p.value} type="button"
                        onClick={() => set('priorite', p.value)}
                        className={`p-3 rounded-xl border text-sm font-medium transition-all duration-200 flex items-center gap-2
                          ${form.priorite === p.value
                            ? 'border-blue-500 bg-blue-900/30 text-blue-300'
                            : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'}`}
                      >
                        <span className="text-base">{p.icon}</span>
                        {p.value}
                        {form.priorite === p.value && <CheckCircle size={14} className="ml-auto text-blue-400" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4 — Détails optionnels */}
            {step === 4 && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-900/40 flex items-center justify-center">
                    <Hash size={16} className="text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">Informations complémentaires</h2>
                    <p className="text-xs text-slate-400">Optionnel — facilitent le traitement</p>
                  </div>
                </div>

                <InputField label="Date de l'incident" type="date" icon={Calendar}
                  value={form.date_incident} onChange={e => set('date_incident', e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                />

                <InputField label="Référence métier (numéro de police, dossier, client...)" icon={Hash}
                  placeholder="Ex: POL-2026-12345"
                  value={form.reference_metier} onChange={e => set('reference_metier', e.target.value)}
                />

                <div>
                  <label className="label">Pièce jointe (capture, mail, document)</label>
                  <div className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-colors duration-200
                    ${file ? 'border-blue-500/50 bg-blue-900/10' : 'border-slate-700 hover:border-slate-600'}`}>
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer"
                      accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xlsx,.txt"
                      onChange={e => setFile(e.target.files[0])} />
                    {file ? (
                      <div className="flex items-center justify-center gap-2 text-blue-400">
                        <Paperclip size={18} />
                        <span className="text-sm font-medium">{file.name}</span>
                        <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); }}
                          className="ml-2 text-slate-400 hover:text-red-400 transition-colors">
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Paperclip size={24} className="mx-auto text-slate-600 mb-2" />
                        <p className="text-sm text-slate-400">Glissez un fichier ou cliquez pour sélectionner</p>
                        <p className="text-xs text-slate-600 mt-1">PDF, images, documents — max 5 Mo</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-slate-800/60 rounded-xl p-4 space-y-2 border border-slate-700/50">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Récapitulatif</p>
                  {[
                    ['Service', form.service_concerne],
                    ['Type', form.type_plainte],
                    ['Objet', form.objet],
                    ['Priorité', form.priorite],
                    ['Impact', form.impact_metier || 'Non renseigné'],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between text-sm">
                      <span className="text-slate-500">{k}</span>
                      <span className="text-slate-300 font-medium max-w-[60%] text-right truncate">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between pt-4 border-t border-slate-800">
              <button type="button" onClick={() => setStep(s => s - 1)} disabled={step === 1}
                className="btn-ghost disabled:opacity-30">
                ← Précédent
              </button>
              {step < 4 ? (
                <button type="button" onClick={() => setStep(s => s + 1)} disabled={!canNext()}
                  className="btn-primary flex items-center gap-2">
                  Suivant <ChevronRight size={16} />
                </button>
              ) : (
                <button type="button" onClick={handleSubmit} disabled={loading}
                  className="btn-danger flex items-center gap-2">
                  {loading ? <Loader size={16} className="animate-spin" /> : <AlertTriangle size={16} />}
                  Soumettre la plainte
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
