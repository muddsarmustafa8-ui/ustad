import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Sidebar from '../components/admin/Sidebar';
import Topbar from '../components/admin/Topbar';

const AdminLayout = () => {
  const { user, isAuthenticated } = useAuth();

  // Route security check
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const allowedRoles = ['super_admin', 'admin', 'moderator'];
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-dark-900 overflow-hidden transition-colors duration-300">
      {/* Admin Sidebar */}
      <Sidebar />

      {/* Main Admin Section */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar />
        
        {/* Scrollable Dashboard Area */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-dark-800">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
