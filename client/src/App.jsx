import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { initializeTheme } from './redux/slices/uiSlice';
import { ProtectedRoute } from './routes/ProtectedRoute';

// Layouts
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import BusinessLayout from './layouts/BusinessLayout';

// Spinner
import Spinner from './components/common/Spinner';

// ──────────────── Lazy-loaded public pages ────────────────
const Home            = lazy(() => import('./pages/Home'));
const Search          = lazy(() => import('./pages/Search'));
const BusinessProfile = lazy(() => import('./pages/BusinessProfile'));
const Profile         = lazy(() => import('./pages/Profile'));
const CategorySelect  = lazy(() => import('./pages/CategorySelect'));
const NotFound        = lazy(() => import('./pages/NotFound'));

// Auth pages
const Login          = lazy(() => import('./pages/auth/Login'));
const Register       = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword  = lazy(() => import('./pages/auth/ResetPassword'));

// ──────────────── Lazy-loaded admin pages ────────────────
const AdminDashboard   = lazy(() => import('./pages/admin/AdminDashboard'));
const UsersPage        = lazy(() => import('./pages/admin/UsersPage'));
const BusinessesPage   = lazy(() => import('./pages/admin/BusinessesPage'));
const CategoriesPage   = lazy(() => import('./pages/admin/CategoriesPage'));
const VerificationsPage = lazy(() => import('./pages/admin/VerificationsPage'));
const ReportsPage      = lazy(() => import('./pages/admin/ReportsPage'));
const AuditLogsPage    = lazy(() => import('./pages/admin/AuditLogsPage'));
const BusinessStudio   = lazy(() => import('./pages/business/BusinessStudio'));

// ──────────────── Loading fallback ────────────────
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-dark-900">
    <Spinner size="large" />
  </div>
);

// ──────────────── App ────────────────
const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(initializeTheme());
  }, [dispatch]);

  return (
    <>
      {/* Global toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1f2937',
            color: '#f9fafb',
            borderRadius: '12px',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />

      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* ───── Public / Customer Routes (with Navbar + Footer) ───── */}
          <Route element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="search"              element={<Search />} />
            <Route path="business/:slug"      element={<BusinessProfile />} />
            <Route element={<ProtectedRoute />}>
              <Route path="profile" element={<Profile />} />
            </Route>
            <Route path="category-select"     element={<CategorySelect />} />
            <Route path="login"               element={<Login />} />
            <Route path="register"            element={<Register />} />
            <Route path="forgot-password"     element={<ForgotPassword />} />
            <Route path="reset-password/:token" element={<ResetPassword />} />
          </Route>

          <Route path="business" element={<BusinessLayout />}>
            <Route index element={<Navigate to="profile" replace />} />
            <Route path="profile" element={<BusinessStudio initialTab="profile" />} />
            <Route path="services" element={<BusinessStudio initialTab="services" />} />
            <Route path="bookings" element={<BusinessStudio initialTab="bookings" />} />
            <Route path="reviews" element={<BusinessStudio initialTab="reviews" />} />
          </Route>

          {/* ───── Admin Routes (with Sidebar + Topbar, role-gated) ───── */}
          <Route path="admin" element={<AdminLayout />}>
            <Route index           element={<AdminDashboard />} />
            <Route path="users"   element={<UsersPage />} />
            <Route path="businesses" element={<BusinessesPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="verifications" element={<VerificationsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="audit-logs" element={<AuditLogsPage />} />
            {/* Catch-all inside admin redirects to dashboard */}
            <Route path="*"       element={<Navigate to="/admin" replace />} />
          </Route>

          {/* ───── Catch-all 404 ───── */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
};

export default App;
