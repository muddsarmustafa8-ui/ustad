import React from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Search } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const routeTitles = {
  '/admin': 'Dashboard',
  '/admin/users': 'User Management',
  '/admin/businesses': 'Business Management',
  '/admin/categories': 'Category Management',
  '/admin/verifications': 'Verification Requests',
  '/admin/reports': 'Reports & Flags',
  '/admin/audit-logs': 'Audit Logs',
  '/admin/cms': 'CMS Pages',
};

const Topbar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const title = routeTitles[location.pathname] || 'Admin Panel';

  return (
    <header className="bg-white dark:bg-dark-900 border-b border-gray-200 dark:border-dark-800 px-6 py-4 flex items-center justify-between shrink-0 shadow-sm">
      {/* Page Title */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 font-outfit">{title}</h1>
        <p className="text-xs text-gray-400 mt-0.5">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-800 rounded-full transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* User info */}
        {user && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold uppercase">
              {user.fullName?.charAt(0)}
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-tight">{user.fullName}</div>
              <div className="text-xs text-gray-400 capitalize">{user.role.replace('_', ' ')}</div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Topbar;
