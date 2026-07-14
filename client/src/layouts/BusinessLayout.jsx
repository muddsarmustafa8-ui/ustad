import React, { useState } from 'react';
import { Outlet, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  LayoutDashboard, 
  Store, 
  Briefcase, 
  CalendarCheck, 
  MessageSquare, 
  LogOut, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  User as UserIcon 
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { toggleDarkMode } from '../redux/slices/uiSlice';

const BusinessLayout = () => {
  const { user, isAuthenticated, logoutUser } = useAuth();
  const darkMode = useSelector((state) => state.ui.darkMode);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Security Gate
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const allowedRoles = ['business_owner', 'super_admin', 'admin'];
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  const menuItems = [
    { name: 'Overview', path: '/business', icon: <LayoutDashboard size={18} /> },
    { name: 'My Profile', path: '/business/profile', icon: <Store size={18} /> },
    { name: 'Services', path: '/business/services', icon: <Briefcase size={18} /> },
    { name: 'Bookings', path: '/business/bookings', icon: <CalendarCheck size={18} /> },
    { name: 'Reviews', path: '/business/reviews', icon: <MessageSquare size={18} /> },
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-dark-900 overflow-hidden transition-colors duration-300">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex md:flex-col md:w-64 bg-white dark:bg-dark-800 border-r border-gray-200 dark:border-dark-700 transition-colors duration-300">
        <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-200 dark:border-dark-700">
          <span className="text-xl font-bold font-outfit tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
            ServeLocal
          </span>
          <span className="text-xxs px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-semibold uppercase">
            Partner
          </span>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-700/50 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer / User Info */}
        <div className="p-4 border-t border-gray-200 dark:border-dark-700">
          <div className="flex items-center gap-3 mb-4">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
              alt={user?.fullName}
              className="w-10 h-10 rounded-full border border-blue-500/50 object-cover"
            />
            <div className="overflow-hidden">
              <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.fullName}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-red-200 dark:border-red-950/20 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/25 text-sm font-medium transition-colors"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Panel */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700 transition-colors duration-300">
          {/* Mobile hamburger menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-xl md:hidden"
          >
            <Menu size={20} />
          </button>

          {/* Page title depending on path */}
          <h1 className="text-lg font-bold text-gray-900 dark:text-white font-outfit">
            {menuItems.find(m => m.path === location.pathname)?.name || 'Business Partner Portal'}
          </h1>

          <div className="flex items-center gap-4">
            {user?.role === 'business_owner' && (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/profile"
                  className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:border-blue-200 hover:text-blue-600 dark:border-dark-700 dark:text-gray-300 dark:hover:border-blue-900/50 dark:hover:text-blue-300"
                >
                  <UserIcon size={14} />
                  Customer View
                </Link>
                <Link
                  to="/business/profile"
                  className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  <Briefcase size={14} />
                  Business Owner View
                </Link>
              </div>
            )}

            {/* Theme Toggle */}
            <button
              onClick={() => dispatch(toggleDarkMode())}
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-xl transition-all"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Public site back button */}
            <Link
              to="/"
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              View Public Website
            </Link>
          </div>
        </header>

        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-dark-900 transition-colors duration-300">
          <Outlet />
        </main>
      </div>

      {/* Mobile Drawer (Overlay) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          
          <div className="relative flex flex-col w-64 bg-white dark:bg-dark-800 border-r border-gray-200 dark:border-dark-700 h-full p-4 animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-200 dark:border-dark-700">
              <span className="text-lg font-bold font-outfit tracking-tight text-blue-600 dark:text-blue-400">
                ServeLocal Partner
              </span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <nav className="flex-grow space-y-1">
              {user?.role === 'business_owner' && (
                <div className="mb-3 space-y-2 rounded-2xl border border-gray-100 bg-gray-50 p-3 dark:border-dark-700 dark:bg-dark-900">
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300"
                  >
                    <UserIcon size={16} />
                    Customer View
                  </Link>
                  <Link
                    to="/business/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400"
                  >
                    <Briefcase size={16} />
                    Business Owner View
                  </Link>
                </div>
              )}

              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-700/50 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto border-t border-gray-200 dark:border-dark-700 pt-4">
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
                  alt={user?.fullName}
                  className="w-10 h-10 rounded-full border border-blue-500/50 object-cover"
                />
                <div className="overflow-hidden">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.fullName}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-red-200 dark:border-red-950/20 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/25 text-sm font-medium transition-colors"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessLayout;
