import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, PlusCircle, History,
  Users, LogOut, Bell, Shield, ChevronRight, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const NavItem = ({ to, icon: Icon, label, badge }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
       ${isActive
         ? 'bg-gradient-to-r from-blue-600/20 to-blue-500/10 text-blue-400 border border-blue-500/20'
         : 'text-slate-400 hover:text-white hover:bg-slate-800'}`
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

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Déconnexion réussie');
    navigate('/login');
  };

  return (
    <aside className="w-64 min-h-screen bg-slate-950 border-r border-slate-800/60 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-red-600 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={18} className="text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">GestPlaintes</div>
            <div className="text-xs text-slate-500">Plateforme interne</div>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="px-4 py-3 mx-3 mt-4 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user?.full_name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-white truncate">{user?.full_name}</div>
            <div className="flex items-center gap-1">
              {user?.role === 'admin'
                ? <><Shield size={10} className="text-red-400" /><span className="text-xs text-red-400">Admin</span></>
                : <><ChevronRight size={10} className="text-blue-400" /><span className="text-xs text-blue-400">Commercial</span></>
              }
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {user?.role === 'admin' ? (
          <>
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider px-3 mb-2">Administration</p>
            <NavItem to="/admin/dashboard" icon={LayoutDashboard} label="Tableau de bord" />
            <NavItem to="/admin/complaints" icon={FileText} label="Toutes les plaintes" />
            <NavItem to="/admin/users" icon={Users} label="Utilisateurs" />
          </>
        ) : (
          <>
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider px-3 mb-2">Espace commercial</p>
            <NavItem to="/dashboard" icon={LayoutDashboard} label="Tableau de bord" />
            <NavItem to="/complaints/new" icon={PlusCircle} label="Nouvelle plainte" />
            <NavItem to="/complaints" icon={FileText} label="Mes plaintes" />
            <NavItem to="/history" icon={History} label="Historique" />
          </>
        )}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-slate-800/60">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-red-400 hover:bg-red-900/20 transition-all duration-200"
        >
          <LogOut size={18} />
          Déconnexion
        </button>
      </div>
    </aside>
  );
};

// Top header bar
export const Header = ({ title, subtitle, actions }) => (
  <div className="flex items-center justify-between mb-8">
    <div>
      <h1 className="text-2xl font-bold text-white">{title}</h1>
      {subtitle && <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>}
    </div>
    {actions && <div className="flex items-center gap-3">{actions}</div>}
  </div>
);
