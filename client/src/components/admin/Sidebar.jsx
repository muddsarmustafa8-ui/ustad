import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Building2, Grid3X3, ShieldCheck,
  Flag, ScrollText, FileText, LogOut, Star,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const navItems = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { path: '/admin/users', icon: Users, label: 'Users' },
  { path: '/admin/businesses', icon: Building2, label: 'Businesses' },
  { path: '/admin/categories', icon: Grid3X3, label: 'Categories' },
  { path: '/admin/verifications', icon: ShieldCheck, label: 'Verifications' },
  { path: '/admin/reports', icon: Flag, label: 'Reports' },
  { path: '/admin/audit-logs', icon: ScrollText, label: 'Audit Logs' },
  { path: '/admin/cms', icon: FileText, label: 'CMS Pages' },
];

const Sidebar = () => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-slate-900 flex flex-col h-full shadow-xl shrink-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-800">
        <span className="text-xl font-bold font-outfit bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
          ServeLocal Admin
        </span>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
        {navItems.map(({ path, icon: Icon, label, exact }) => (
          <NavLink
            key={path}
            to={path}
            end={exact}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User Profile + Logout */}
      <div className="border-t border-slate-800 p-4">
        {user && (
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold uppercase">
              {user.fullName?.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-semibold text-slate-200 truncate">{user.fullName}</div>
              <div className="text-xs text-slate-500 truncate">{user.role.replace('_', ' ')}</div>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-900/20 rounded-xl transition-colors"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
