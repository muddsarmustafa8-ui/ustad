import React from 'react';

const colors = {
  super_admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  admin: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  moderator: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
  business_owner: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  customer: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
  active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  suspended: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  unverified: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  bronze: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  silver: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
  gold: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  premium: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
};

const AdminBadge = ({ label }) => {
  const key = label?.toLowerCase().replace(' ', '_');
  const colorClass = colors[key] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${colorClass}`}>
      {label}
    </span>
  );
};

export default AdminBadge;
