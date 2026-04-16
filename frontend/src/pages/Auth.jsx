import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, AlertTriangle, ArrowRight, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const AuthLayout = ({ children, title, subtitle }) => (
  <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
    {/* Animated background blobs */}
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-red-600/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl" />
    </div>

    <div className="relative w-full max-w-md">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-red-600 shadow-2xl shadow-blue-900/40 mb-4">
          <AlertTriangle size={28} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        <p className="text-slate-400 mt-1 text-sm">{subtitle}</p>
      </div>

      <div className="card-glass p-8 shadow-2xl">
        {children}
      </div>
    </div>
  </div>
);

// ── Login Page ────────────────────────────────────────────────
export const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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
      setError(err.response?.data?.error || 'Identifiants incorrects');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Connexion" subtitle="Accédez à votre espace de gestion">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-900/30 border border-red-700/50 rounded-xl text-red-300 text-sm">
            <AlertTriangle size={16} className="flex-shrink-0" />
            {error}
          </div>
        )}

        <div>
          <label className="label">Adresse email</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <input
              type="email" required
              className="input-field pl-10"
              placeholder="votre@email.com"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            />
          </div>
        </div>

        <div>
          <label className="label">Mot de passe</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <input
              type={showPwd ? 'text' : 'password'} required
              className="input-field pl-10 pr-10"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
            />
            <button type="button" onClick={() => setShowPwd(!showPwd)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
          {loading ? <Loader size={18} className="animate-spin" /> : <><span>Se connecter</span><ArrowRight size={16} /></>}
        </button>

        <p className="text-center text-sm text-slate-400">
          Pas encore de compte ?{' '}
          <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
            S'inscrire gratuitement
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
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) return setError('Les mots de passe ne correspondent pas');
    if (form.password.length < 8) return setError('Mot de passe trop court (8 caractères minimum)');
    setLoading(true);
    try {
      await register(form.email, form.password, form.full_name);
      toast.success('Compte créé avec succès ! Bienvenue 🎉');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  const strength = form.password.length >= 12 ? 3 : form.password.length >= 8 ? 2 : form.password.length >= 4 ? 1 : 0;
  const strengthColors = ['bg-slate-700', 'bg-red-500', 'bg-amber-500', 'bg-emerald-500'];
  const strengthLabels = ['', 'Faible', 'Correct', 'Fort'];

  return (
    <AuthLayout title="Créer un compte" subtitle="Rejoignez la plateforme de gestion des plaintes">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-900/30 border border-red-700/50 rounded-xl text-red-300 text-sm">
            <AlertTriangle size={16} className="flex-shrink-0" />{error}
          </div>
        )}

        <div>
          <label className="label">Nom complet <span className="text-red-400">*</span></label>
          <div className="relative">
            <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <input type="text" required className="input-field pl-10" placeholder="Jean Dupont"
              value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} />
          </div>
        </div>

        <div>
          <label className="label">Email personnel <span className="text-red-400">*</span></label>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <input type="email" required className="input-field pl-10" placeholder="votre@email.com"
              value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
          </div>
        </div>

        <div>
          <label className="label">Mot de passe <span className="text-red-400">*</span></label>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <input type={showPwd ? 'text' : 'password'} required className="input-field pl-10 pr-10"
              placeholder="8 caractères minimum" value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
            <button type="button" onClick={() => setShowPwd(!showPwd)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {form.password && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex gap-1 flex-1">
                {[1,2,3].map(i => (
                  <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColors[strength] : 'bg-slate-700'}`} />
                ))}
              </div>
              <span className="text-xs text-slate-400">{strengthLabels[strength]}</span>
            </div>
          )}
        </div>

        <div>
          <label className="label">Confirmer le mot de passe <span className="text-red-400">*</span></label>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <input type={showPwd ? 'text' : 'password'} required className="input-field pl-10"
              placeholder="Répétez le mot de passe" value={form.confirm}
              onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))} />
          </div>
          {form.confirm && form.confirm !== form.password && (
            <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertTriangle size={12} />Mots de passe différents</p>
          )}
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
          {loading ? <Loader size={18} className="animate-spin" /> : <><span>Créer mon compte</span><ArrowRight size={16} /></>}
        </button>

        <p className="text-center text-sm text-slate-400">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">Se connecter</Link>
        </p>
      </form>
    </AuthLayout>
  );
};
