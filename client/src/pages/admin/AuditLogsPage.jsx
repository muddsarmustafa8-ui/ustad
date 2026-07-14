import React, { useEffect, useState } from 'react';
import DataTable from '../../components/admin/DataTable';
import AdminBadge from '../../components/admin/AdminBadge';
import api from '../../services/api';

const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    api.get('/admin/audit-logs').then(r => { setLogs(r.data.data || []); }).catch(() => { setLogs([]); });
  }, []);

  const columns = [
    { key: 'admin', label: 'Admin' },
    {
      key: 'action',
      label: 'Action',
      render: v => (
        <span className="inline-block px-2 py-0.5 rounded-md bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 text-xs font-mono">
          {v}
        </span>
      ),
    },
    { key: 'target', label: 'Target' },
    { key: 'details', label: 'Details' },
    {
      key: 'createdAt',
      label: 'Time',
      render: v => (
        <span className="text-xs text-gray-400">
          {new Date(v).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
        </span>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 font-outfit">Audit Logs</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Complete history of admin actions
        </p>
      </div>
      {logs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 dark:border-dark-700 p-8 text-center text-sm text-gray-500 dark:text-gray-400">No audit logs recorded yet.</div>
      ) : (
        <DataTable columns={columns} data={logs} pageSize={15} />
      )}
    </div>
  );
};

export default AuditLogsPage;
