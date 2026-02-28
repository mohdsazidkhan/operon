'use client';

import { useState, useEffect } from 'react';
import { Search, Users, Shield, CheckCircle, XCircle, Edit, Trash2, UserPlus, MoreHorizontal } from 'lucide-react';
import { cn, formatDate, getInitials, formatRelativeTime } from '@/lib/utils';
import toast from 'react-hot-toast';
import Modal, { FormField, FormActions, inputCls } from '@/components/ui/Modal';

const ROLES = ['admin', 'manager', 'employee'];
const ROLE_COLORS = {
    super_admin: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 border-purple-200',
    admin: 'text-rose-600 bg-rose-100 dark:bg-rose-900/30 border-rose-200',
    manager: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 border-amber-200',
    employee: 'text-slate-600 bg-slate-100 dark:bg-slate-800 border-slate-200',
};

const EMPTY_USER = { name: '', email: '', role: 'employee', department: '', position: '', phone: '', password: '', isActive: true };

export default function UserManagementPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [showAdd, setShowAdd] = useState(false);
    const [editUser, setEditUser] = useState(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState(EMPTY_USER);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/users?search=${search}&role=${filterRole === 'all' ? '' : filterRole}`);
            const data = await res.json();
            if (data.success) setUsers(data.data || []);
        } catch { toast.error('Failed to fetch users'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchUsers(); }, [search, filterRole]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const method = editUser ? 'PUT' : 'POST';
            const url = editUser ? `/api/users/${editUser._id}` : '/api/users';
            const body = { ...form };
            if (editUser && !body.password) delete body.password;
            const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
            const data = await res.json();
            if (data.success) {
                toast.success(editUser ? 'User updated!' : 'User invited!');
                setShowAdd(false); setEditUser(null); setForm(EMPTY_USER); fetchUsers();
            } else toast.error(data.message);
        } catch { toast.error('Failed'); }
        finally { setSaving(false); }
    };

    const toggleActive = async (user) => {
        try {
            const res = await fetch(`/api/users/${user._id}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !user.isActive })
            });
            const data = await res.json();
            if (data.success) { toast.success(`User ${user.isActive ? 'deactivated' : 'activated'}`); fetchUsers(); }
        } catch { toast.error('Failed'); }
    };

    const openEdit = (u) => {
        setForm({ name: u.name, email: u.email, role: u.role, department: u.department || '', position: u.position || '', phone: u.phone || '', password: '', isActive: u.isActive });
        setEditUser(u); setShowAdd(true);
    };

    const filtered = users.filter(u => {
        const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
        const matchRole = filterRole === 'all' || u.role === filterRole;
        return matchSearch && matchRole;
    });

    const activeCount = users.filter(u => u.isActive).length;
    const roleCount = (role) => users.filter(u => u.role === role).length;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <Modal isOpen={showAdd} onClose={() => { setShowAdd(false); setEditUser(null); setForm(EMPTY_USER); }}
                title={editUser ? 'Edit User' : 'Invite User'} size="lg">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField label="Full Name" required>
                            <input required className={inputCls} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                        </FormField>
                        <FormField label="Email" required>
                            <input required type="email" className={inputCls} value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} disabled={!!editUser} />
                        </FormField>
                        <FormField label="Role">
                            <select className={inputCls} value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                                {ROLES.map(r => <option key={r} value={r}>{r.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
                            </select>
                        </FormField>
                        <FormField label="Phone">
                            <input className={inputCls} value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                        </FormField>
                        <FormField label="Department">
                            <input className={inputCls} value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))} />
                        </FormField>
                        <FormField label="Position">
                            <input className={inputCls} value={form.position} onChange={e => setForm(p => ({ ...p, position: e.target.value }))} />
                        </FormField>
                        <div className="sm:col-span-2">
                            <FormField label={editUser ? 'New Password (leave blank to keep)' : 'Password'} required={!editUser}>
                                <input type="password" required={!editUser} className={inputCls} value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
                            </FormField>
                        </div>
                    </div>
                    <FormActions onClose={() => { setShowAdd(false); setEditUser(null); setForm(EMPTY_USER); }}
                        loading={saving} submitLabel={editUser ? 'Update User' : 'Invite User'} />
                </form>
            </Modal>

            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">User Management</h1>
                    <p className="text-[var(--text-muted)] text-sm mt-0.5">{users.length} users · {activeCount} active</p>
                </div>
                <button onClick={() => { setForm(EMPTY_USER); setEditUser(null); setShowAdd(true); }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[var(--primary-500)] hover:bg-[var(--primary-600)] text-white rounded-xl font-medium text-sm transition-all shadow-lg shadow-[var(--primary-500)]/20">
                    <UserPlus size={16} /> Invite User
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Users', value: users.length, icon: Users, color: 'text-indigo-500 bg-indigo-500/10' },
                    { label: 'Active', value: activeCount, icon: CheckCircle, color: 'text-emerald-500 bg-emerald-500/10' },
                    { label: 'Admins', value: roleCount('admin') + roleCount('super_admin'), icon: Shield, color: 'text-rose-500 bg-rose-500/10' },
                    { label: 'Managers', value: roleCount('manager'), icon: Users, color: 'text-amber-500 bg-amber-500/10' },
                ].map((s, i) => (
                    <div key={i} className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-5">
                        <div className={cn('p-2 rounded-xl w-fit mb-3', s.color)}><s.icon size={18} /></div>
                        <p className="text-2xl font-black text-[var(--text-primary)]">{s.value}</p>
                        <p className="text-xs text-[var(--text-muted)] mt-1">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..."
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm bg-[var(--card-bg)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]/30 focus:border-[var(--primary-500)] transition-all" />
                </div>
                <div className="flex gap-2">
                    {['all', ...ROLES, 'super_admin'].map(r => (
                        <button key={r} onClick={() => setFilterRole(r)}
                            className={cn('px-3 py-2 rounded-xl text-xs font-semibold border transition-all',
                                filterRole === r ? 'bg-[var(--primary-500)] text-white border-[var(--primary-500)]' : 'bg-[var(--surface-overlay)] text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--primary-500)]/40')}>
                            {r === 'all' ? 'All' : r.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl shadow-sm overflow-hidden">
                {/* Mobile cards */}
                <div className="block sm:hidden divide-y divide-[var(--border)]">
                    {loading ? <div className="py-12 text-center text-[var(--text-muted)] text-sm">Loading...</div>
                        : filtered.length === 0 ? <div className="py-12 text-center text-[var(--text-muted)] text-sm">No users found</div>
                            : filtered.map(u => (
                                <div key={u._id} className="p-4 space-y-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-[var(--primary-500)]/10 flex items-center justify-center text-[var(--primary-500)] font-bold text-sm">{getInitials(u.name)}</div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-[var(--text-primary)] text-sm truncate">{u.name}</p>
                                            <p className="text-xs text-[var(--text-muted)] truncate">{u.email}</p>
                                        </div>
                                        <span className={cn('text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border flex-shrink-0', ROLE_COLORS[u.role] || '')}>{u.role.replace('_', ' ')}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className={cn('text-xs font-semibold', u.isActive ? 'text-emerald-500' : 'text-rose-500')}>{u.isActive ? 'Active' : 'Inactive'}</span>
                                        <div className="flex gap-1">
                                            <button onClick={() => toggleActive(u)} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--primary-500)] hover:bg-[var(--surface-overlay)] transition-all">{u.isActive ? <XCircle size={14} /> : <CheckCircle size={14} />}</button>
                                            <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--primary-500)] hover:bg-[var(--surface-overlay)] transition-all"><Edit size={14} /></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                </div>
                {/* Desktop table */}
                <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider bg-[var(--surface-overlay)]/50">
                            <tr>
                                <th className="py-3.5 px-5">User</th>
                                <th className="py-3.5 px-5">Role</th>
                                <th className="py-3.5 px-5">Department</th>
                                <th className="py-3.5 px-5">Status</th>
                                <th className="py-3.5 px-5">Last Login</th>
                                <th className="py-3.5 px-5"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {loading ? <tr><td colSpan="6" className="py-12 text-center text-[var(--text-muted)] text-sm">Loading users...</td></tr>
                                : filtered.length === 0 ? <tr><td colSpan="6" className="py-12 text-center text-[var(--text-muted)] text-sm">No users found</td></tr>
                                    : filtered.map(u => (
                                        <tr key={u._id} className="hover:bg-[var(--surface-overlay)]/40 transition-colors group">
                                            <td className="py-4 px-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-[var(--primary-500)]/10 flex items-center justify-center text-[var(--primary-500)] font-bold text-sm">{getInitials(u.name)}</div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-[var(--text-primary)]">{u.name}</p>
                                                        <p className="text-xs text-[var(--text-muted)]">{u.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-5">
                                                <span className={cn('text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border', ROLE_COLORS[u.role] || '')}>{u.role.replace('_', ' ')}</span>
                                            </td>
                                            <td className="py-4 px-5 text-sm text-[var(--text-muted)]">{u.department || '—'}</td>
                                            <td className="py-4 px-5">
                                                <span className={cn('flex items-center gap-1.5 text-xs font-semibold', u.isActive ? 'text-emerald-500' : 'text-rose-500')}>
                                                    <span className={cn('w-1.5 h-1.5 rounded-full', u.isActive ? 'bg-emerald-500' : 'bg-rose-500')} />
                                                    {u.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-5 text-sm text-[var(--text-muted)]">{u.lastLogin ? formatRelativeTime(u.lastLogin) : 'Never'}</td>
                                            <td className="py-4 px-5">
                                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                                    <button onClick={() => toggleActive(u)} title={u.isActive ? 'Deactivate' : 'Activate'}
                                                        className={cn('p-1.5 rounded-lg transition-all', u.isActive ? 'text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10' : 'text-[var(--text-muted)] hover:text-emerald-500 hover:bg-emerald-500/10')}>
                                                        {u.isActive ? <XCircle size={15} /> : <CheckCircle size={15} />}
                                                    </button>
                                                    <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--primary-500)] hover:bg-[var(--surface-overlay)] transition-all"><Edit size={15} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
