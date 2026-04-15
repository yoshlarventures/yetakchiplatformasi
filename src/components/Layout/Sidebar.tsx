import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { REGIONS } from '../../data/regions';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  MapPin,
  LogOut,
  Shield,
  UserCircle,
  Eye,
  BookOpen,
  ChevronRight,
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const region = user?.regionId ? REGIONS.find(r => r.id === user.regionId) : null;

  const adminLinks = [
    { to: '/admin', icon: LayoutDashboard, label: 'Bosh sahifa' },
    { to: '/admin/regions', icon: MapPin, label: 'Hududlar' },
    { to: '/admin/projects', icon: FolderKanban, label: 'Loyihalar' },
    { to: '/admin/teams', icon: Users, label: 'Jamoalar' },
  ];

  const userLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Bosh sahifa' },
    { to: '/dashboard/projects', icon: FolderKanban, label: 'Loyihalar' },
    { to: '/dashboard/teams', icon: Users, label: 'Jamoalar' },
  ];

  const links = isAdmin ? adminLinks : userLinks;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isAdmin ? 'bg-indigo-600' : 'bg-emerald-600'
          }`}>
            {isAdmin ? (
              <Shield className="w-5 h-5 text-white" />
            ) : (
              <Users className="w-5 h-5 text-white" />
            )}
          </div>
          <div>
            <h2 className="font-bold text-gray-900">
              {isAdmin ? 'Admin Panel' : 'Yetakchi'}
            </h2>
            <p className="text-xs text-gray-500">
              {isAdmin ? 'Kuzatuv tizimi' : region?.name || 'Hudud'}
            </p>
          </div>
        </div>
      </div>

      {/* Observer Badge for Admin */}
      {isAdmin && (
        <div className="mx-4 mt-4 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 text-blue-700 text-sm">
            <Eye className="w-4 h-4" />
            <span className="font-medium">Kuzatuv rejimi</span>
          </div>
          <p className="text-xs text-blue-600 mt-1">
            Faqat ko'rish mumkin
          </p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end={link.to === '/admin' || link.to === '/dashboard'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? isAdmin
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'bg-emerald-50 text-emerald-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`
                }
              >
                <link.icon className="w-5 h-5" />
                <span className="font-medium">{link.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* User info & Logout */}
      <div className="p-4 border-t border-gray-100">
        {/* Profile Link */}
        <button
          onClick={() => navigate(isAdmin ? '/admin/profile' : '/dashboard/profile')}
          className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg mb-2 transition-all duration-200 ${
            location.pathname.includes('/profile')
              ? isAdmin
                ? 'bg-indigo-50 text-indigo-600'
                : 'bg-emerald-50 text-emerald-600'
              : 'bg-gray-50 hover:bg-gray-100'
          }`}
        >
          <UserCircle className={`w-10 h-10 ${location.pathname.includes('/profile') ? '' : 'text-gray-400'}`} />
          <div className="flex-1 min-w-0 text-left">
            <p className={`text-sm font-medium truncate ${location.pathname.includes('/profile') ? '' : 'text-gray-900'}`}>
              {user?.fullName}
            </p>
            <p className={`text-xs truncate flex items-center gap-1 ${location.pathname.includes('/profile') ? 'opacity-80' : 'text-gray-500'}`}>
              <BookOpen className="w-3 h-3" />
              Profil & Yo'riqnoma
            </p>
          </div>
          <ChevronRight className={`w-4 h-4 ${location.pathname.includes('/profile') ? '' : 'text-gray-400'}`} />
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Chiqish</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
