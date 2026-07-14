import React, { useEffect, useState } from 'react';
import { Users, Building2, ShoppingBag, DollarSign } from 'lucide-react';
import StatCard from '../../components/admin/StatCard';
import api from '../../services/api';

const AdminDashboard = () => {
  const [dashboard, setDashboard] = useState({ stats: {}, recentBusinesses: [], pendingVerifications: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(r => {
        if (r.data.success) {
          setDashboard(r.data.data || { stats: {}, recentBusinesses: [], pendingVerifications: [] });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = dashboard.stats || {};

  const statCards = [
    { title: 'Total Users', value: stats.totalUsers?.toLocaleString() || '—', icon: Users, trend: 'up', trendValue: 12.5, color: 'blue' },
    { title: 'Listed Businesses', value: stats.totalBusinesses?.toLocaleString() || '—', icon: Building2, trend: 'up', trendValue: 8.3, color: 'green' },
    { title: 'Total Bookings', value: stats.totalBookings?.toLocaleString() || '—', icon: ShoppingBag, trend: 'up', trendValue: 21.1, color: 'orange' },
    { title: 'Revenue', value: stats.totalRevenue ? `PKR ${stats.totalRevenue.toLocaleString()}` : '—', icon: DollarSign, trend: 'up', trendValue: 0.3, color: 'purple' },
  ];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, i) => (
          <StatCard key={i} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 border border-gray-100 dark:border-dark-700 shadow-sm">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 font-outfit">Recent Businesses</h3>
          <div className="space-y-3">
            {(dashboard.recentBusinesses || []).length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 dark:border-dark-700 p-8 text-center text-sm text-gray-500 dark:text-gray-400">No businesses have been added yet.</div>
            ) : dashboard.recentBusinesses.map((business) => (
              <div key={business._id} className="flex items-center justify-between rounded-xl border border-gray-100 dark:border-dark-700 px-4 py-3">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{business.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{business.category?.name || 'Uncategorized'}</p>
                </div>
                <span className="text-xs text-gray-400">{new Date(business.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 border border-gray-100 dark:border-dark-700 shadow-sm">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 font-outfit">Pending Verifications</h3>
          <div className="space-y-3">
            {(dashboard.pendingVerifications || []).length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 dark:border-dark-700 p-8 text-center text-sm text-gray-500 dark:text-gray-400">No pending verification requests.</div>
            ) : dashboard.pendingVerifications.map((business) => (
              <div key={business._id} className="flex items-center justify-between rounded-xl border border-gray-100 dark:border-dark-700 px-4 py-3">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{business.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{business.owner?.fullName || 'Owner'} • {business.category?.name || 'Uncategorized'}</p>
                </div>
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">Pending</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
