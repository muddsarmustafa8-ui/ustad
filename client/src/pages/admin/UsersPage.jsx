import React, { useEffect, useState } from 'react';
import { UserCheck, UserX, Ban } from 'lucide-react';
import toast from 'react-hot-toast';
import DataTable from '../../components/admin/DataTable';
import AdminBadge from '../../components/admin/AdminBadge';
import api from '../../services/api';

const UsersPage = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    api.get('/admin/users').then(r => { setUsers(r.data.data?.users || []); }).catch(() => { setUsers([]); });
  }, []);

  const handleStatus = async (id, status) => {
    try {
      const isActive = status === 'active';
      await api.patch(`/admin/users/${id}/status`, { isActive });
      setUsers(users.map(u => u._id === id ? { ...u, isActive } : u));
      toast.success(`User ${isActive ? 'activated' : 'suspended'} successfully`);
    } catch { toast.error('Failed to update status'); }
  };

  const columns = [
    { key: 'fullName', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: v => <AdminBadge label={v} /> },
    { key: 'isActive', label: 'Status', render: v => <AdminBadge label={v ? 'active' : 'suspended'} /> },
    { key: 'createdAt', label: 'Joined', render: v => new Date(v).toLocaleDateString() },
  ];

  const actions = (row) => (
    <>
      {!row.isActive && (
        <button onClick={() => handleStatus(row._id, 'active')}
          className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors" title="Activate">
          <UserCheck size={16} />
        </button>
      )}
      {row.isActive !== false && (
        <button onClick={() => handleStatus(row._id, 'suspended')}
          className="p-1.5 rounded-lg text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors" title="Suspend">
          <UserX size={16} />
        </button>
      )}
    </>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 font-outfit">All Users</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{users.length} total users</p>
        </div>
      </div>
      <DataTable columns={columns} data={users} actions={actions} />
    </div>
  );
};

export default UsersPage;
