import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, AlertTriangle, ArrowRight, Loader, CheckCircle, Clock } from 'lucide-react';
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
          <img src="/logo.png" alt="Coris Assurances" className="h-16 w-auto object-contain" />
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

// ── Page vérification email ───────────────────────────────────
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
          <><Loader size={40} className="mx-auto text-blue-500 animate-spin" /><p className="text-slate-500">Vérification en cours...</p></>
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
            <Link to="/login" className="btn-primary inline-flex items-center gap-2 mt-2">
              Retour à la connexion
            </Link>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto">
              <AlertTriangle size={32} className="text-red-500" />
            </div>
            <h2 className="text-lg font-semibold text-slate-800">Lien invalide</h2>
            <p className="text-slate-500 text-sm">{message}</p>
            <Link to="/login" className="btn-primary inline-flex items-center gap-2">
              Retour à la connexion
            </Link>
          </>
        )}
      </div>
    </AuthLayout>
  );
};

// ── Login Page ────────────────────────────────────────────────
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
            ${errorType === 'warning'
              ? 'bg-amber-50 border-amber-200 text-amber-700'
              : 'bg-red-50 border-red-200 text-red-600'}`}>
            {errorType === 'warning'
              ? <Clock size={16} className="flex-shrink-0 mt-0.5" />
              : <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />}
            {error}
          </div>
        )}

        <div>
          <label className="label">Adresse email</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input type="email" required className="input-field pl-10"
              placeholder="votre@email.com" value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
          </div>
        </div>

        <div>
          <label className="label">Mot de passe</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input type={showPwd ? 'text' : 'password'} required
              className="input-field pl-10 pr-10" placeholder="••••••••"
              value={form.password}
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
          <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
            S'inscrire
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

// ── Register Page ─────────────────────────────────────────────
export const RegisterPage = () => {
  const [form, setForm] = useState({ full_name: '', email: '', password: '', confirm: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) return setError('Les mots de passe ne correspondent pas');
    if (form.password.length < 8) return setError('Mot de passe trop court (8 caractères minimum)');
    setLoading(true);
    try {
      await api.post('/auth/register', {
        email: form.email,
        password: form.password,
        full_name: form.full_name
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
          <p className="text-slate-500 text-sm">
            Un lien de confirmation a été envoyé à <strong className="text-slate-700">{form.email}</strong>.
          </p>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-left space-y-2">
            <p className="text-sm font-medium text-blue-800">Prochaines étapes :</p>
            <div className="flex items-start gap-2 text-sm text-blue-700">
              <span className="w-5 h-5 rounded-full bg-blue-200 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
              Cliquez le lien dans l'email reçu
            </div>
            <div className="flex items-start gap-2 text-sm text-blue-700">
              <span className="w-5 h-5 rounded-full bg-blue-200 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
              Un admin valide votre compte
            </div>
            <div className="flex items-start gap-2 text-sm text-blue-700">
              <span className="w-5 h-5 rounded-full bg-blue-200 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
              Vous recevez un email de confirmation d'activation
            </div>
          </div>
          <Link to="/login" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            Retour à la connexion
          </Link>
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
            <input type="text" required className="input-field pl-10" placeholder="Jean Dupont"
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
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <AlertTriangle size={12} />Mots de passe différents
            </p>
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
