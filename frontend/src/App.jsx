import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage, RegisterPage, VerifyEmailPage } from './pages/Auth';
import { DashboardPage } from './pages/Dashboard';
import { ComplaintsPage } from './pages/Complaints';
import { NewComplaintPage } from './pages/NewComplaint';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminComplaints } from './pages/AdminComplaints';
import { AdminUsers } from './pages/AdminUsers';
import { Spinner } from './components/UI';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size={40} /></div>;
  return user ? children : <Navigate to="/login" replace />;
};

// Admin uniquement (gestion users)
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size={40} /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/admin/dashboard" replace />;
  return children;
};

// Admin OU Direction (dashboard, plaintes, stats)
const AdminOrDirectionRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size={40} /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!['admin', 'direction'].includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size={40} /></div>;
  if (user) {
    if (user.role === 'commercial') return <Navigate to="/dashboard" replace />;
    return <Navigate to="/admin/dashboard" replace />;
  }
  return children;
};

const AppRoutes = () => (
  <Routes>
    {/* Public */}
    <Route path="/login"        element={<PublicRoute><LoginPage /></PublicRoute>} />
    <Route path="/register"     element={<PublicRoute><RegisterPage /></PublicRoute>} />
    <Route path="/verify-email" element={<VerifyEmailPage />} />

    {/* Commercial */}
    <Route path="/dashboard"       element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
    <Route path="/complaints"      element={<PrivateRoute><ComplaintsPage /></PrivateRoute>} />
    <Route path="/complaints/new"  element={<PrivateRoute><NewComplaintPage /></PrivateRoute>} />
    <Route path="/history"         element={<PrivateRoute><ComplaintsPage /></PrivateRoute>} />

    {/* Admin + Direction */}
    <Route path="/admin/dashboard"  element={<AdminOrDirectionRoute><AdminDashboard /></AdminOrDirectionRoute>} />
    <Route path="/admin/complaints" element={<AdminOrDirectionRoute><AdminComplaints /></AdminOrDirectionRoute>} />

    {/* Admin uniquement */}
    <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />

    {/* Default */}
    <Route path="/" element={<Navigate to="/login" replace />} />
    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
);

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#ffffff',
              color: '#1e293b',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              fontSize: '14px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.07)',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#ffffff' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#ffffff' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
