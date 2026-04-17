export const STATUTS = [
  { value: 'Soumise',                label: 'Soumise',                color: 'bg-slate-700 text-slate-200',      dot: 'bg-slate-400' },
  { value: 'En cours d\'analyse',    label: 'En cours d\'analyse',    color: 'bg-blue-900/60 text-blue-300',     dot: 'bg-blue-400' },
  { value: 'Affectée au service',    label: 'Affectée au service',    color: 'bg-indigo-900/60 text-indigo-300', dot: 'bg-indigo-400' },
  { value: 'En traitement',          label: 'En traitement',          color: 'bg-cyan-900/60 text-cyan-300',     dot: 'bg-cyan-400 animate-pulse' },
  { value: 'En attente d\'information', label: 'En attente d\'info',  color: 'bg-amber-900/60 text-amber-300',   dot: 'bg-amber-400' },
  { value: 'Résolue',                label: 'Résolue',                color: 'bg-emerald-900/60 text-emerald-300', dot: 'bg-emerald-400' },
  { value: 'Clôturée',               label: 'Clôturée',               color: 'bg-green-900/60 text-green-300',   dot: 'bg-green-500' },
  { value: 'Rejetée',                label: 'Rejetée',                color: 'bg-red-900/60 text-red-300',       dot: 'bg-red-500' },
];

export const PRIORITES = [
  { value: 'Faible',    color: 'bg-slate-700 text-slate-300',    icon: '▽' },
  { value: 'Moyenne',   color: 'bg-blue-900/60 text-blue-300',   icon: '◇' },
  { value: 'Élevée',    color: 'bg-orange-900/60 text-orange-300', icon: '△' },
  { value: 'Critique',  color: 'bg-red-900/60 text-red-300',     icon: '▲' },
];

export const SERVICES = [
  'Direction commerciale',
  'Service Bancassurance',
  'Service Comptabilité',
  'Service Trésorerie',
  'Service Informatique (SII)',
  'Service Actuariat et Réassurance',
  'Service Souscription',
  'Service Prestation',
  'Service Encaissements',
  'Direction des Finances et de la Comptabilité',
  'Direction Technique',
  'Service Ressources humaines',
  'Service Audit Interne',
  'Service Moyens Généraux',
  'Autres',
];

export const TYPES_PLAINTE = [
  'Retard de traitement',
  'Non-respect de procédure',
  'Manque de communication',
  'Erreur de traitement',
  'Blocage administratif',
  'Problème technique',
  'Comportement inapproprié',
  'Autre',
];

export const IMPACTS_METIER = [
  'Client mécontent',
  'Perte de chiffre d\'affaires',
  'Blocage de dossier',
  'Dégradation de l\'image',
  'Retard opérationnel',
  'Sans impact immédiat',
];

export const getStatut = (value) => STATUTS.find(s => s.value === value) || STATUTS[0];
export const getPriorite = (value) => PRIORITES.find(p => p.value === value) || PRIORITES[1];
