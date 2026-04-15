import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import { Loader2, Menu, Shield, Users } from 'lucide-react';
import { REGIONS } from '../../data/regions';

interface MainLayoutProps {
  requiredRole?: 'admin' | 'regional_leader';
}

const MainLayout: React.FC<MainLayoutProps> = ({ requiredRole }) => {
  const { user, isLoading, isAdmin } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const region = user?.regionId ? REGIONS.find(r => r.id === user.regionId) : null;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobil header */}
        <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isAdmin ? 'bg-indigo-600' : 'bg-emerald-600'
            }`}>
              {isAdmin ? (
                <Shield className="w-4 h-4 text-white" />
              ) : (
                <Users className="w-4 h-4 text-white" />
              )}
            </div>
            <div>
              <h1 className="font-semibold text-gray-900 text-sm">
                {isAdmin ? 'Admin Panel' : region?.name || 'Yetakchi'}
              </h1>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
