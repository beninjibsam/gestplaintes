import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Mail, Lock, User, Eye, EyeOff, AlertTriangle,
  ArrowRight, Loader, CheckCircle, Clock, Phone
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import toast from 'react-hot-toast';

const AuthLayout = ({ children, title, subtitle }) => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-60" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-red-100 rounded-full blur-3xl opacity-60" />
    </div>
    <div className="relative w-full max-w-md">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <img src="https://coris-assurances.com/wp-content/uploads/2023/03/Fichier-1@2x.png"
            alt="Coris Assurances" className="h-16 w-auto object-contain" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
        <p className="text-slate-500 mt-1 text-sm">{subtitle}</p>
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        {children}
      </div>
    </div>
  </div>
);

const WaIcon = () => (
  <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, flexShrink: 0 }} fill="#25D366">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

export const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) { setStatus('error'); setMessage('Lien invalide.'); return; }
    api.get(`/auth/verify-email?token=${token}`)
      .then(res => { setStatus('success'); setMessage(res.data.message); })
      .catch(err => { setStatus('error'); setMessage(err.response?.data?.error || 'Lien invalide ou expiré.'); });
  }, []);

  return (
    <AuthLayout title="CORIS ASSURANCES Vie BF" subtitle="Vérification de votre email">
      <div className="text-center py-4 space-y-4">
        {status === 'loading' && (
          <><Loader size={40} className="mx-auto text-blue-500 animate-spin" />
          <p className="text-slate-500">Vérification en cours...</p></>
        )}
        {status === 'success' && (
          <>
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto">
              <CheckCircle size={32} className="text-emerald-500" />
            </div>
            <h2 className="text-lg font-semibold text-slate-800">Email confirmé !</h2>
            <p className="text-slate-500 text-sm">{message}</p>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-left">
              <Clock size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700">Votre compte est en attente de validation par un administrateur. Vous recevrez un email dès que votre accès sera activé.</p>
            </div>
            <Link to="/login" className="btn-primary inline-flex items-center gap-2 mt-2">Retour à la connexion</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto">
              <AlertTriangle size={32} className="text-red-500" />
            </div>
            <h2 className="text-lg font-semibold text-slate-800">Lien invalide</h2>
            <p className="text-slate-500 text-sm">{message}</p>
            <Link to="/login" className="btn-primary inline-flex items-center gap-2">Retour à la connexion</Link>
          </>
        )}
      </div>
    </AuthLayout>
  );
};

export const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorType, setErrorType] = useState('error');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Bienvenue, ${user.full_name} !`);
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/dashboard');
    } catch (err) {
      const msg = err.response?.data?.error || 'Identifiants incorrects';
      setError(msg);
      setErrorType(msg.includes('attente') ? 'warning' : 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="CORIS ASSURANCES Vie BF" subtitle="Application de gestion des plaintes des commerciaux">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className={`flex items-start gap-2 p-3 rounded-xl text-sm border
            ${errorType === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-red-50 border-red-200 text-red-600'}`}>
            {errorType === 'warning' ? <Clock size={16} className="flex-shrink-0 mt-0.5" /> : <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />}
            {error}
          </div>
        )}
        <div>
          <label className="label">Adresse email</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input type="email" required className="input-field pl-10" placeholder="votre@email.com"
              value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
          </div>
        </div>
        <div>
          <label className="label">Mot de passe</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input type={showPwd ? 'text' : 'password'} required className="input-field pl-10 pr-10"
              placeholder="••••••••" value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
            <button type="button" onClick={() => setShowPwd(!showPwd)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
          {loading ? <Loader size={18} className="animate-spin" /> : <><span>Se connecter</span><ArrowRight size={16} /></>}
        </button>
        <p className="text-center text-sm text-slate-500">
          Pas encore de compte ?{' '}
          <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">S'inscrire</Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export const RegisterPage = () => {
  const [form, setForm] = useState({ full_name: '', email: '', whatsapp: '', telephone: '', password: '', confirm: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.whatsapp || form.whatsapp.trim().length < 8) return setError('Le numéro WhatsApp est obligatoire (minimum 8 chiffres)');
    if (form.password !== form.confirm) return setError('Les mots de passe ne correspondent pas');
    if (form.password.length < 8) return setError('Mot de passe trop court (8 caractères minimum)');
    setLoading(true);
    try {
      await api.post('/auth/register', {
        email: form.email, password: form.password, full_name: form.full_name,
        whatsapp: form.whatsapp, telephone: form.telephone || undefined,
      });
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  const strength = form.password.length >= 12 ? 3 : form.password.length >= 8 ? 2 : form.password.length >= 4 ? 1 : 0;
  const strengthColors = ['bg-slate-200', 'bg-red-400', 'bg-amber-400', 'bg-emerald-400'];
  const strengthLabels = ['', 'Faible', 'Correct', 'Fort'];

  if (done) {
    return (
      <AuthLayout title="CORIS ASSURANCES Vie BF" subtitle="Inscription en cours">
        <div className="text-center py-4 space-y-4">
          <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto">
            <Mail size={32} className="text-blue-500" />
          </div>
          <h2 className="text-lg font-semibold text-slate-800">Vérifiez votre email !</h2>
          <p className="text-slate-500 text-sm">Un lien de confirmation a été envoyé à <strong className="text-slate-700">{form.email}</strong>.</p>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-left space-y-2">
            <p className="text-sm font-medium text-blue-800">Prochaines étapes :</p>
            {["Cliquez le lien dans l'email reçu", "Un admin valide votre compte", "Vous recevez un email de confirmation d'activation"].map((s, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-blue-700">
                <span className="w-5 h-5 rounded-full bg-blue-200 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i+1}</span>
                {s}
              </div>
            ))}
          </div>
          <Link to="/login" className="text-sm text-blue-600 hover:text-blue-700 font-medium">Retour à la connexion</Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Créer un compte" subtitle="Rejoignez la plateforme de gestion des plaintes">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            <AlertTriangle size={16} className="flex-shrink-0" />{error}
          </div>
        )}

        <div>
          <label className="label">Nom complet <span className="text-red-500">*</span></label>
          <div className="relative">
            <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input type="text" required className="input-field pl-10" placeholder="Votre nom"
              value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} />
          </div>
        </div>

        <div>
          <label className="label">Email personnel <span className="text-red-500">*</span></label>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input type="email" required className="input-field pl-10" placeholder="votre@email.com"
              value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
          </div>
        </div>

        {/* WhatsApp + Téléphone */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">N° WhatsApp <span className="text-red-500">*</span></label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"><WaIcon /></span>
              <input type="tel" required className="input-field pl-10" placeholder="+226 XX XX XX XX"
                value={form.whatsapp} onChange={e => setForm(p => ({ ...p, whatsapp: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="label">N° Téléphone</label>
            <div className="relative">
              <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input type="tel" className="input-field pl-10" placeholder="+226 XX XX XX XX"
                value={form.telephone} onChange={e => setForm(p => ({ ...p, telephone: e.target.value }))} />
            </div>
            <p className="text-xs text-slate-400 mt-1">Facultatif</p>
          </div>
        </div>

        <div>
          <label className="label">Mot de passe <span className="text-red-500">*</span></label>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input type={showPwd ? 'text' : 'password'} required className="input-field pl-10 pr-10"
              placeholder="8 caractères minimum" value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
            <button type="button" onClick={() => setShowPwd(!showPwd)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {form.password && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex gap-1 flex-1">
                {[1,2,3].map(i => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColors[strength] : 'bg-slate-200'}`} />
                ))}
              </div>
              <span className="text-xs text-slate-400">{strengthLabels[strength]}</span>
            </div>
          )}
        </div>

        <div>
          <label className="label">Confirmer le mot de passe <span className="text-red-500">*</span></label>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input type={showPwd ? 'text' : 'password'} required className="input-field pl-10"
              placeholder="Répétez le mot de passe" value={form.confirm}
              onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))} />
          </div>
          {form.confirm && form.confirm !== form.password && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertTriangle size={12} />Mots de passe différents</p>
          )}
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
          {loading ? <Loader size={18} className="animate-spin" /> : <><span>Créer mon compte</span><ArrowRight size={16} /></>}
        </button>

        <p className="text-center text-sm text-slate-500">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">Se connecter</Link>
        </p>
      </form>
    </AuthLayout>
  );
};
