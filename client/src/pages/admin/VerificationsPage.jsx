import React, { useEffect, useState } from 'react';
import { ShieldCheck, ShieldX } from 'lucide-react';
import toast from 'react-hot-toast';
import DataTable from '../../components/admin/DataTable';
import AdminBadge from '../../components/admin/AdminBadge';
import api from '../../services/api';

const VerificationsPage = () => {
  const [verifications, setVerifications] = useState([]);

  useEffect(() => {
    api.get('/admin/verifications').then(r => { setVerifications(r.data.data || []); }).catch(() => { setVerifications([]); });
  }, []);

  const handleDecision = async (id, approved, bizId, level) => {
    try {
      if (approved) {
        await api.patch(`/admin/businesses/${bizId}/verify`, { action: 'approve', verificationLevel: level });
      } else {
        await api.patch(`/admin/businesses/${bizId}/verify`, { action: 'reject', verificationLevel: level });
      }
      setVerifications(v => v.map(x => x._id === id ? { ...x, status: approved ? 'approved' : 'rejected' } : x));
      toast.success(approved ? `Approved as ${level}` : 'Verification rejected');
    } catch { toast.error('Failed to process decision'); }
  };

  const columns = [
    { key: 'name', label: 'Business', render: v => v },
    { key: 'owner', label: 'Owner', render: v => v?.fullName || '—' },
    { key: 'requestedLevel', label: 'Requested Level', render: v => <AdminBadge label={v} /> },
    { key: 'verificationDocs', label: 'Documents Submitted', render: v => Array.isArray(v) ? v.length : 0 },
    { key: 'submittedAt', label: 'Submitted', render: v => new Date(v).toLocaleDateString() },
    { key: 'status', label: 'Status', render: v => <AdminBadge label={v} /> },
  ];

  const actions = (row) => {
    if (row.status !== 'pending') return null;
    return (
      <>
        <button
          onClick={() => handleDecision(row._id, true, row._id, row.requestedLevel)}
          className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 rounded-lg transition-colors"
        >
          <ShieldCheck size={13} /> Approve
        </button>
        <button
          onClick={() => handleDecision(row._id, false, row._id, row.requestedLevel)}
          className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors"
        >
          <ShieldX size={13} /> Reject
        </button>
      </>
    );
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 font-outfit">Verification Requests</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          {verifications.filter(v => v.status === 'pending').length} pending requests
        </p>
      </div>
      <DataTable columns={columns} data={verifications} actions={actions} />
    </div>
  );
};

export default VerificationsPage;
