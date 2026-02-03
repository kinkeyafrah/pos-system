import React, { useMemo, useState } from 'react';
import { PlusCircle, ShieldCheck, Trash2, KeyRound } from 'lucide-react';
import { UserAccount, UserRole } from '../types';

interface UsersViewProps {
  users: UserAccount[];
  currentUser: UserAccount;
  isDarkMode: boolean;
  onAddUser: (payload: { name: string; username: string; role: UserRole; password: string }) => { success: boolean; message?: string };
  onUpdateUser: (id: string, updates: Partial<Pick<UserAccount, 'name' | 'role' | 'password'>>) => void;
  onDeleteUser: (id: string) => void;
}

const UsersView: React.FC<UsersViewProps> = ({ users, currentUser, isDarkMode, onAddUser, onUpdateUser, onDeleteUser }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', username: '', role: 'cashier' as UserRole, password: '' });
  const [feedback, setFeedback] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const canManage = currentUser.role !== 'cashier';

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    const lower = search.toLowerCase();
    return users.filter(user => user.name.toLowerCase().includes(lower) || user.username.toLowerCase().includes(lower));
  }, [search, users]);

  const handleAdd = (event: React.FormEvent) => {
    event.preventDefault();
    const result = onAddUser({
      name: formData.name.trim(),
      username: formData.username.trim(),
      role: formData.role,
      password: formData.password,
    });
    setFeedback(result.message ?? null);
    if (result.success) {
      setFormData({ name: '', username: '', role: 'cashier', password: '' });
      setShowForm(false);
    }
  };

  if (!canManage) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className={`max-w-xl text-center p-8 rounded-3xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <ShieldCheck size={40} className="text-emerald-500 mx-auto mb-4" />
          <h2 className="text-2xl font-black mb-2">Restricted Area</h2>
          <p className="text-slate-500">Only managers and admins can manage staff accounts.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">Staff Directory</h1>
          <p className="text-slate-500">Manage usernames, roles, and access credentials.</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setFeedback(null); }}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 text-white font-bold px-4 py-2 hover:bg-emerald-500"
        >
          <PlusCircle size={18} />
          {showForm ? 'Close Form' : 'Add Staff'}
        </button>
      </div>

      <div className={`rounded-2xl border p-4 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search staff by name or username"
          className={`w-full rounded-xl border px-4 py-3 ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
        />
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className={`rounded-2xl border p-6 space-y-4 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          {feedback && (
            <div className={`rounded-xl p-3 text-sm font-semibold ${feedback.includes('success') ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
              {feedback}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold">Full name</label>
              <input
                value={formData.name}
                onChange={(event) => setFormData(prev => ({ ...prev, name: event.target.value }))}
                className={`mt-2 w-full rounded-xl border px-4 py-3 ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                required
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Username</label>
              <input
                value={formData.username}
                onChange={(event) => setFormData(prev => ({ ...prev, username: event.target.value }))}
                className={`mt-2 w-full rounded-xl border px-4 py-3 ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                required
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Role</label>
              <select
                value={formData.role}
                onChange={(event) => setFormData(prev => ({ ...prev, role: event.target.value as UserRole }))}
                className={`mt-2 w-full rounded-xl border px-4 py-3 ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
              >
                <option value="cashier">Cashier</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(event) => setFormData(prev => ({ ...prev, password: event.target.value }))}
                className={`mt-2 w-full rounded-xl border px-4 py-3 ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                required
              />
            </div>
          </div>
          <button type="submit" className="rounded-xl bg-emerald-600 text-white font-bold px-6 py-3 hover:bg-emerald-500">
            Save Staff Account
          </button>
        </form>
      )}

      <div className="grid gap-4">
        {filteredUsers.map(user => (
          <div key={user.id} className={`rounded-2xl border p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <div>
              <h3 className="text-lg font-bold">{user.name}</h3>
              <p className="text-sm text-slate-500">{user.username} • {user.role.toUpperCase()}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={user.role}
                onChange={(event) => onUpdateUser(user.id, { role: event.target.value as UserRole })}
                className={`rounded-xl border px-3 py-2 text-sm font-semibold ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                disabled={user.id === currentUser.id}
              >
                <option value="cashier">Cashier</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
              <button
                onClick={() => {
                  const newPassword = window.prompt(`Reset password for ${user.name}`);
                  if (newPassword) onUpdateUser(user.id, { password: newPassword });
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 text-emerald-600 px-4 py-2 text-sm font-semibold hover:bg-emerald-50"
              >
                <KeyRound size={16} />
                Reset Password
              </button>
              <button
                onClick={() => onDeleteUser(user.id)}
                className="inline-flex items-center gap-2 rounded-xl border border-rose-200 text-rose-600 px-4 py-2 text-sm font-semibold hover:bg-rose-50"
                disabled={user.id === currentUser.id}
              >
                <Trash2 size={16} />
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UsersView;
