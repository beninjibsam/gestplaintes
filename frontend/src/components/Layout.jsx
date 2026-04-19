import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, PlusCircle, History,
  Users, LogOut, Shield, ChevronRight, TrendingUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const NavItem = ({ to, icon: Icon, label, badge }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
       ${isActive
         ? 'bg-blue-50 text-blue-700 border border-blue-200'
         : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`
    }
  >
    <Icon size={18} className="flex-shrink-0" />
    <span className="flex-1">{label}</span>
    {badge > 0 && (
      <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
        {badge > 9 ? '9+' : badge}
      </span>
    )}
  </NavLink>
);

const RoleBadge = ({ role }) => {
  if (role === 'admin') return (
    <div className="flex items-center gap-1">
      <Shield size={10} className="text-red-500" />
      <span className="text-xs text-red-500 font-medium">Administrateur</span>
    </div>
  );
  if (role === 'direction') return (
    <div className="flex items-center gap-1">
      <TrendingUp size={10} className="text-purple-500" />
      <span className="text-xs text-purple-500 font-medium">Direction</span>
    </div>
  );
  return (
    <div className="flex items-center gap-1">
      <ChevronRight size={10} className="text-blue-500" />
      <span className="text-xs text-blue-500 font-medium">Commercial</span>
    </div>
  );
};

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Déconnexion réussie');
    navigate('/login');
  };

  const isAdminOrDirection = ['admin', 'direction'].includes(user?.role);

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-slate-200 flex flex-col">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-slate-200">
        <img
          src="https://coris-assurances.com/wp-content/uploads/2023/03/Fichier-1@2x.png"
          alt="Coris Assurances" className="h-10 w-auto object-contain"
        />
      </div>

      {/* User info */}
      <div className={`px-4 py-3 mx-3 mt-4 rounded-xl border
        ${user?.role === 'direction' ? 'bg-purple-50 border-purple-100' :
          user?.role === 'admin' ? 'bg-red-50 border-red-100' :
          'bg-slate-50 border-slate-200'}`}>
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0
            ${user?.role === 'direction' ? 'bg-gradient-to-br from-purple-500 to-purple-700' :
              user?.role === 'admin' ? 'bg-gradient-to-br from-red-500 to-red-700' :
              'bg-gradient-to-br from-blue-500 to-blue-700'}`}>
            {user?.full_name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-slate-800 truncate">{user?.full_name}</div>
            <RoleBadge role={user?.role} />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {isAdminOrDirection ? (
          <>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
              {user?.role === 'direction' ? 'Direction' : 'Administration'}
            </p>
            <NavItem to="/admin/dashboard"  icon={LayoutDashboard} label="Tableau de bord" />
            <NavItem to="/admin/complaints" icon={FileText}         label="Toutes les plaintes" />
            {/* Gestion users : admin seulement */}
            {user?.role === 'admin' && (
              <NavItem to="/admin/users" icon={Users} label="Utilisateurs" />
            )}
          </>
        ) : (
          <>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">Votre espace</p>
            <NavItem to="/dashboard"      icon={LayoutDashboard} label="Tableau de bord" />
            <NavItem to="/complaints/new" icon={PlusCircle}      label="Nouvelle plainte" />
            <NavItem to="/complaints"     icon={FileText}         label="Mes plaintes" />
            <NavItem to="/history"        icon={History}          label="Historique" />
          </>
        )}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-slate-200">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
        >
          <LogOut size={18} />
          Déconnexion
        </button>
      </div>
    </aside>
  );
};

export const Header = ({ title, subtitle, actions }) => (
  <div className="flex items-center justify-between mb-8">
    <div>
      <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
      {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
    {actions && <div className="flex items-center gap-3">{actions}</div>}
  </div>
);
