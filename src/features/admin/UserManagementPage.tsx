import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';

interface User {
  id: number;
  username: string;
  role: string;
  status: string;
  createdAt: string;
}

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('user');
  const [error, setError] = useState('');

  const loadUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      if (res.data.success) setUsers(res.data.data);
    } catch { /* handled by interceptor */ }
  };

  useEffect(() => { loadUsers(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/admin/users', { username: newUsername, password: newPassword, role: newRole });
      setShowCreate(false);
      setNewUsername('');
      setNewPassword('');
      setNewRole('user');
      loadUsers();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed');
    }
  };

  const toggleStatus = async (user: User) => {
    const newStatus = user.status === 'active' ? 'disabled' : 'active';
    await api.patch(`/admin/users/${user.id}`, { status: newStatus });
    loadUsers();
  };

  const toggleRole = async (user: User) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    await api.patch(`/admin/users/${user.id}`, { role: newRole });
    loadUsers();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-white">用户管理</h1>
        <button onClick={() => setShowCreate(!showCreate)} className="px-4 py-2 bg-primary hover:bg-indigo-600 text-white rounded-lg text-sm transition-colors">
          {showCreate ? '取消' : '创建用户'}
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="bg-dark-800 rounded-lg p-4 mb-6 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <input value={newUsername} onChange={(e) => setNewUsername(e.target.value)} placeholder="用户名" required className="px-3 py-2 bg-dark-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-primary" />
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="密码" required className="px-3 py-2 bg-dark-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-primary" />
            <select value={newRole} onChange={(e) => setNewRole(e.target.value)} className="px-3 py-2 bg-dark-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-primary">
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button type="submit" className="px-4 py-2 bg-primary hover:bg-indigo-600 text-white rounded-lg text-sm transition-colors">确认创建</button>
        </form>
      )}

      <div className="bg-dark-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-slate-400">
              <th className="text-left p-3">ID</th>
              <th className="text-left p-3">用户名</th>
              <th className="text-left p-3">角色</th>
              <th className="text-left p-3">状态</th>
              <th className="text-left p-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-slate-700/50 text-slate-300">
                <td className="p-3">{u.id}</td>
                <td className="p-3">{u.username}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded text-xs ${u.role === 'admin' ? 'bg-purple-500/20 text-purple-300' : 'bg-slate-500/20 text-slate-300'}`}>{u.role}</span>
                </td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded text-xs ${u.status === 'active' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>{u.status}</span>
                </td>
                <td className="p-3 space-x-2">
                  <button onClick={() => toggleRole(u)} className="text-xs text-primary hover:underline">切换角色</button>
                  <button onClick={() => toggleStatus(u)} className="text-xs text-yellow-400 hover:underline">{u.status === 'active' ? '禁用' : '启用'}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagementPage;
