import React, { useEffect, useState } from 'react';
import { Flag, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import DataTable from '../../components/admin/DataTable';
import AdminBadge from '../../components/admin/AdminBadge';
import api from '../../services/api';

const ReportsPage = () => {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    setReports([]);
  }, []);

  const handleResolve = async (id) => {
    try {
      await api.patch(`/admin/reports/${id}/resolve`);
      setReports(r => r.map(x => x._id === id ? { ...x, status: 'resolved' } : x));
      toast.success('Report resolved');
    } catch { toast.error('Failed to resolve report'); }
  };

  const columns = [
    { key: 'reporter', label: 'Reporter' },
    { key: 'type', label: 'Type', render: v => <AdminBadge label={v} /> },
    { key: 'target', label: 'Reported Target' },
    { key: 'reason', label: 'Reason' },
    { key: 'status', label: 'Status', render: v => <AdminBadge label={v} /> },
    { key: 'createdAt', label: 'Date', render: v => new Date(v).toLocaleDateString() },
  ];

  const actions = (row) => {
    if (row.status === 'resolved') return null;
    return (
      <button
        onClick={() => handleResolve(row._id)}
        className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 rounded-lg transition-colors"
      >
        <CheckCircle size={13} /> Resolve
      </button>
    );
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 font-outfit">Reports & Flags</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          {reports.filter(r => r.status === 'pending').length} open reports
        </p>
      </div>
      {reports.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 dark:border-dark-700 p-8 text-center text-sm text-gray-500 dark:text-gray-400">No reports have been submitted yet.</div>
      ) : (
        <DataTable columns={columns} data={reports} actions={actions} />
      )}
    </div>
  );
};

export default ReportsPage;
