import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import MainLayout from './components/Layout/MainLayout';
import LoginPage from './pages/LoginPage';
import PublicSubmitProject from './pages/PublicSubmitProject';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProjects from './pages/admin/AdminProjects';
import AdminTeams from './pages/admin/AdminTeams';
import AdminRegions from './pages/admin/AdminRegions';
import UserDashboard from './pages/user/UserDashboard';
import UserProjects from './pages/user/UserProjects';
import UserTeams from './pages/user/UserTeams';
import ProfilePage from './pages/ProfilePage';

// Protected Route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Public Route wrapper (redirect if logged in)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route path="/submit-project" element={<PublicSubmitProject />} />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <MainLayout requiredRole="admin" />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="regions" element={<AdminRegions />} />
        <Route path="projects" element={<AdminProjects />} />
        <Route path="teams" element={<AdminTeams />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* User Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <MainLayout requiredRole="regional_leader" />
          </ProtectedRoute>
        }
      >
        <Route index element={<UserDashboard />} />
        <Route path="projects" element={<UserProjects />} />
        <Route path="teams" element={<UserTeams />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter basename="/yetakchiplatformasi">
      <AuthProvider>
        <DataProvider>
          <AppRoutes />
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
