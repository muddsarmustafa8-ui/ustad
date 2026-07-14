import React, { useEffect, useState } from 'react';
import { ShieldCheck, Star, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';
import DataTable from '../../components/admin/DataTable';
import AdminBadge from '../../components/admin/AdminBadge';
import api from '../../services/api';

const VERIFICATION_LEVELS = ['unverified', 'bronze', 'silver', 'gold', 'premium'];

const BusinessesPage = () => {
  const [businesses, setBusinesses] = useState([]);

  useEffect(() => {
    api.get('/admin/businesses').then(r => { setBusinesses(r.data.data?.businesses || []); }).catch(() => { setBusinesses([]); });
  }, []);

  const handleVerify = async (id, level) => {
    try {
      await api.patch(`/admin/businesses/${id}/verify`, { action: 'approve', verificationLevel: level });
      setBusinesses(b => b.map(x => x._id === id ? { ...x, verificationLevel: level, isVerified: true, status: 'active' } : x));
      toast.success(`Verification updated to ${level}`);
    } catch { toast.error('Failed to update verification'); }
  };

  const handleFeature = async (id, current) => {
    try {
      await api.patch(`/admin/businesses/${id}/feature`, { isFeatured: !current });
      setBusinesses(b => b.map(x => x._id === id ? { ...x, isFeatured: !current } : x));
      toast.success(current ? 'Removed from featured' : 'Marked as featured');
    } catch { toast.error('Failed to update featured status'); }
  };

  const columns = [
    { key: 'name', label: 'Business Name' },
    { key: 'owner', label: 'Owner' },
    { key: 'city', label: 'City' },
    { key: 'verificationLevel', label: 'Verification', render: v => <AdminBadge label={v} /> },
    { key: 'isFeatured', label: 'Featured', render: v => (
      <span className={`text-xs font-semibold ${v ? 'text-orange-500' : 'text-gray-400'}`}>
        {v ? '⚡ Yes' : 'No'}
      </span>
    )},
    { key: 'status', label: 'Status', render: v => <AdminBadge label={v} /> },
  ];

  const actions = (row) => (
    <>
      {/* Verification dropdown */}
      <select
        value={row.verificationLevel}
        onChange={e => handleVerify(row._id, e.target.value)}
        onClick={e => e.stopPropagation()}
        className="text-xs px-2 py-1 rounded-lg border border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-900 text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
      >
        {VERIFICATION_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
      </select>

      {/* Feature toggle */}
      <button
        onClick={() => handleFeature(row._id, row.isFeatured)}
        className={`p-1.5 rounded-lg transition-colors ${row.isFeatured ? 'text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-700'}`}
        title={row.isFeatured ? 'Remove featured' : 'Mark featured'}
      >
        {row.isFeatured ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
      </button>
    </>
  );

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 font-outfit">All Businesses</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{businesses.length} total listings</p>
      </div>
      <DataTable columns={columns} data={businesses} actions={actions} />
    </div>
  );
};

export default BusinessesPage;
