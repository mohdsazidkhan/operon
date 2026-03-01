'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/services/api';
import { cn, formatDate } from '@/lib/utils';
import {
    ShieldCheck, Plus, Trash2, Edit3, Copy, ChevronDown, ChevronRight, Check,
    X, Users, Search, RefreshCw, Save, AlertTriangle, Zap, Lock, Globe, Building2,
    User, UserPlus, Clock, Star
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import Can from '@/components/ui/Can';

const PERM_GROUPS = [
    {
        label: 'Dashboard', module: 'global',
        perms: [{ key: 'dashboard.view', label: 'View' }],
    },
    {
        label: 'Settings — Users', module: 'global',
        perms: [
            { key: 'settings.users.view', label: 'View' },
            { key: 'settings.users.manage', label: 'Manage' },
        ],
    },
    {
        label: 'Settings — Roles', module: 'global',
        perms: [
            { key: 'settings.roles.view', label: 'View' },
            { key: 'settings.roles.manage', label: 'Manage' },
        ],
    },
    {
        label: 'Settings — Org', module: 'global',
        perms: [
            { key: 'settings.organization.view', label: 'View' },
            { key: 'settings.organization.manage', label: 'Manage' },
        ],
    },
    {
        label: 'Audit Log', module: 'global',
        perms: [{ key: 'settings.audit-logs.view', label: 'View' }],
    },
    // CRM
    {
        label: 'CRM — Leads', module: 'crm',
        perms: [
            { key: 'crm.leads.view', label: 'View' },
            { key: 'crm.leads.create', label: 'Create' },
            { key: 'crm.leads.edit', label: 'Edit' },
            { key: 'crm.leads.delete', label: 'Delete' },
            { key: 'crm.leads.assign', label: 'Assign' },
        ],
    },
    {
        label: 'CRM — Contacts', module: 'crm',
        perms: [
            { key: 'crm.contacts.view', label: 'View' },
            { key: 'crm.contacts.create', label: 'Create' },
            { key: 'crm.contacts.edit', label: 'Edit' },
            { key: 'crm.contacts.delete', label: 'Delete' },
        ],
    },
    {
        label: 'CRM — Deals', module: 'crm',
        perms: [
            { key: 'crm.deals.view', label: 'View' },
            { key: 'crm.deals.create', label: 'Create' },
            { key: 'crm.deals.edit', label: 'Edit' },
            { key: 'crm.deals.delete', label: 'Delete' },
            { key: 'crm.deals.approve', label: 'Approve' },
        ],
    },
    {
        label: 'CRM — Companies', module: 'crm',
        perms: [
            { key: 'crm.companies.view', label: 'View' },
            { key: 'crm.companies.create', label: 'Create' },
            { key: 'crm.companies.edit', label: 'Edit' },
            { key: 'crm.companies.delete', label: 'Delete' },
        ],
    },
    {
        label: 'CRM — Pipeline & Reports', module: 'crm',
        perms: [
            { key: 'crm.pipeline.view', label: 'Pipeline' },
            { key: 'crm.pipeline.manage', label: 'Pipeline Mgmt' },
            { key: 'crm.reports.view', label: 'Reports' },
        ],
    },
    // HRMS
    {
        label: 'HRMS — Employees', module: 'hrms',
        perms: [
            { key: 'hrms.employees.view', label: 'View' },
            { key: 'hrms.employees.create', label: 'Create' },
            { key: 'hrms.employees.edit', label: 'Edit' },
            { key: 'hrms.employees.delete', label: 'Delete' },
        ],
    },
    {
        label: 'HRMS — Attendance & Leaves', module: 'hrms',
        perms: [
            { key: 'hrms.attendance.view', label: 'Attend. View' },
            { key: 'hrms.attendance.manage', label: 'Attend. Manage' },
            { key: 'hrms.leaves.view', label: 'Leave View' },
            { key: 'hrms.leaves.apply', label: 'Leave Apply' },
            { key: 'hrms.leaves.approve', label: 'Leave Approve' },
        ],
    },
    {
        label: 'HRMS — Payroll & Recruitment', module: 'hrms',
        perms: [
            { key: 'hrms.payroll.view', label: 'Payroll View' },
            { key: 'hrms.payroll.process', label: 'Payroll Process' },
            { key: 'hrms.recruitment.view', label: 'Recruit. View' },
            { key: 'hrms.recruitment.manage', label: 'Recruit. Manage' },
            { key: 'hrms.performance.view', label: 'Perf. View' },
            { key: 'hrms.performance.manage', label: 'Perf. Manage' },
        ],
    },
    // ERP
    {
        label: 'ERP — Inventory & Products', module: 'erp',
        perms: [
            { key: 'erp.inventory.view', label: 'Inv. View' },
            { key: 'erp.inventory.manage', label: 'Inv. Manage' },
            { key: 'erp.products.view', label: 'Prod. View' },
            { key: 'erp.products.manage', label: 'Prod. Manage' },
        ],
    },
    {
        label: 'ERP — Orders & Invoices', module: 'erp',
        perms: [
            { key: 'erp.orders.view', label: 'Orders View' },
            { key: 'erp.orders.create', label: 'Orders Create' },
            { key: 'erp.orders.process', label: 'Orders Process' },
            { key: 'erp.invoices.view', label: 'Inv. View' },
            { key: 'erp.invoices.create', label: 'Inv. Create' },
            { key: 'erp.invoices.approve', label: 'Inv. Approve' },
        ],
    },
    {
        label: 'ERP — Procurement & Finance', module: 'erp',
        perms: [
            { key: 'erp.purchase-orders.view', label: 'PO View' },
            { key: 'erp.purchase-orders.create', label: 'PO Create' },
            { key: 'erp.purchase-orders.approve', label: 'PO Approve' },
            { key: 'erp.vendors.view', label: 'Vendors View' },
            { key: 'erp.vendors.manage', label: 'Vendors Manage' },
            { key: 'erp.expenses.view', label: 'Expenses View' },
            { key: 'erp.expenses.approve', label: 'Expenses Approve' },
            { key: 'erp.budget.view', label: 'Budget View' },
            { key: 'erp.budget.manage', label: 'Budget Manage' },
            { key: 'erp.finance.view', label: 'Finance View' },
            { key: 'erp.finance.report', label: 'Finance Report' },
        ],
    },
    // Apps
    {
        label: 'Apps', module: 'global',
        perms: [
            { key: 'apps.projects.view', label: 'Projects View' },
            { key: 'apps.projects.manage', label: 'Projects Manage' },
            { key: 'apps.tasks.view', label: 'Tasks View' },
            { key: 'apps.tasks.manage', label: 'Tasks Manage' },
            { key: 'apps.notes.view', label: 'Notes View' },
            { key: 'apps.notes.manage', label: 'Notes Manage' },
            { key: 'apps.announcements.view', label: 'Announce. View' },
            { key: 'apps.announcements.manage', label: 'Announce. Manage' },
        ],
    },
];

const MODULE_COLORS = {
    global: 'bg-violet-500/15 text-violet-500 border-violet-500/20',
    crm: 'bg-blue-500/15 text-blue-500 border-blue-500/20',
    hrms: 'bg-indigo-500/15 text-indigo-500 border-indigo-500/20',
    erp: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/20',
};

const MODULE_LABELS = { global: 'Global', crm: 'CRM', hrms: 'HRMS', erp: 'ERP' };

// ── Modal component (inline) ────────────────────────────────────────────────
function Modal({ open, title, onClose, children }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={onClose}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div className="relative bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-150"
                onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-base font-bold text-[var(--text-primary)]">{title}</h3>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--surface-overlay)] text-[var(--text-muted)]"><X size={16} /></button>
                </div>
                {children}
            </div>
        </div>
    );
}

// ── Assign Role Modal ────────────────────────────────────────────────────────
function AssignRoleModal({ role, onClose, onSuccess }) {
    const [search, setSearch] = useState('');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [assigning, setAssigning] = useState(null);
    const [expiresAt, setExpiresAt] = useState('');

    const searchUsers = useCallback(async (q) => {
        if (!q) return setUsers([]);
        setLoading(true);
        try {
            const res = await api.get(`/users/me`); // fallback — use actual users endpoint
            setUsers(res.data?.data || []);
        } catch { setUsers([]); }
        finally { setLoading(false); }
    }, []);

    const assign = async (userId) => {
        setAssigning(userId);
        try {
            await api.post(`/rbac/users/${userId}/roles`, {
                roleId: role._id,
                expiresAt: expiresAt || null,
            });
            onSuccess?.();
        } catch (err) {
            alert(err.response?.data?.message || 'Assignment failed');
        } finally { setAssigning(null); }
    };

    return (
        <Modal open title={`Assign "${role.name}"`} onClose={onClose}>
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">Expires At (optional)</label>
                    <input type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[var(--surface-overlay)] border border-[var(--border)] text-sm text-[var(--text-primary)]" />
                </div>
                <div>
                    <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">Search Users</label>
                    <input value={search} onChange={e => { setSearch(e.target.value); searchUsers(e.target.value); }}
                        placeholder="Type a name or email..."
                        className="w-full px-3 py-2 rounded-xl bg-[var(--surface-overlay)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]" />
                </div>
                {users.length === 0 && search && !loading && (
                    <p className="text-center text-sm text-[var(--text-muted)] py-4">No users found for "{search}"</p>
                )}
                {users.map(u => (
                    <div key={u._id} className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface-overlay)]">
                        <div>
                            <p className="text-sm font-medium text-[var(--text-primary)]">{u.name}</p>
                            <p className="text-xs text-[var(--text-muted)]">{u.email}</p>
                        </div>
                        <button onClick={() => assign(u._id)} disabled={assigning === u._id}
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--primary-500)] text-white hover:opacity-90 disabled:opacity-50 transition-all">
                            {assigning === u._id ? 'Assigning…' : 'Assign'}
                        </button>
                    </div>
                ))}
                <p className="text-xs text-[var(--text-muted)] text-center">Search for users to assign this role to them.</p>
            </div>
        </Modal>
    );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function RolesPage() {
    const { user: authUser } = useAuthStore();
    const isSuperAdmin = authUser?.role === 'super_admin';

    const [roles, setRoles] = useState([]);
    const [selectedRole, setSelectedRole] = useState(null);
    const [permissions, setPermissions] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [seeding, setSeeding] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [searchRole, setSearchRole] = useState('');
    const [filterModule, setFilterModule] = useState('all');
    const [expandedGroups, setExpandedGroups] = useState({});
    const [showNewRole, setShowNewRole] = useState(false);
    const [showAssign, setShowAssign] = useState(false);
    const [form, setForm] = useState({ name: '', description: '', module: 'global', permissions: [] });
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);
    const [creating, setCreating] = useState(false);

    const fetchRoles = useCallback(async () => {
        setLoading(true);
        try {
            const params = filterModule !== 'all' ? `?module=${filterModule}` : '';
            const res = await api.get(`/rbac/roles${params}`);
            setRoles(res.data.data || []);
            if (!selectedRole && res.data.data?.length > 0) {
                const first = res.data.data[0];
                setSelectedRole(first);
                setPermissions(new Set(first.permissions || []));
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load roles');
        } finally { setLoading(false); }
    }, [filterModule]);

    useEffect(() => { fetchRoles(); }, [fetchRoles]);

    const selectRole = (role) => {
        setSelectedRole(role);
        setPermissions(new Set(role.permissions || []));
        setSuccess('');
        setError('');
    };

    const togglePermission = (key) => {
        if (selectedRole?.isSystem && !isSuperAdmin) return;
        setPermissions(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    const savePermissions = async () => {
        if (!selectedRole) return;
        setSaving(true);
        try {
            await api.put(`/rbac/roles/${selectedRole._id}`, { permissions: [...permissions] });
            setSuccess('Permissions saved');
            setRoles(prev => prev.map(r => r._id === selectedRole._id ? { ...r, permissions: [...permissions] } : r));
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Save failed');
        } finally { setSaving(false); }
    };

    const cloneRole = async () => {
        if (!selectedRole) return;
        try {
            const res = await api.post(`/rbac/roles/${selectedRole._id}`, { name: `${selectedRole.name} (Copy)` });
            setRoles(prev => [...prev, res.data.data]);
            setSelectedRole(res.data.data);
            setPermissions(new Set(res.data.data.permissions || []));
            setSuccess('Role cloned!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) { setError(err.response?.data?.message || 'Clone failed'); }
    };

    const deleteRole = async () => {
        if (!selectedRole || selectedRole.isSystem) return;
        if (!confirm(`Delete role "${selectedRole.name}"? This will revoke it from all users.`)) return;
        try {
            await api.delete(`/rbac/roles/${selectedRole._id}`);
            setRoles(prev => prev.filter(r => r._id !== selectedRole._id));
            setSelectedRole(null);
            setPermissions(new Set());
        } catch (err) { setError(err.response?.data?.message || 'Delete failed'); }
    };

    const createRole = async () => {
        if (!form.name) return;
        setCreating(true);
        try {
            const res = await api.post('/rbac/roles', form);
            setRoles(prev => [...prev, res.data.data]);
            setShowNewRole(false);
            setForm({ name: '', description: '', module: 'global', permissions: [] });
            setSelectedRole(res.data.data);
            setPermissions(new Set());
        } catch (err) { setError(err.response?.data?.message || 'Create failed'); }
        finally { setCreating(false); }
    };

    const seedRoles = async () => {
        if (!confirm('Seed all system roles and permissions? Existing system roles will be updated.')) return;
        setSeeding(true);
        try {
            const res = await api.post('/rbac/seed');
            setSuccess(`Seed complete: ${res.data.data?.roles?.created || 0} roles created, ${res.data.data?.permissions?.created || 0} permissions created`);
            fetchRoles();
            setTimeout(() => setSuccess(''), 5000);
        } catch (err) { setError(err.response?.data?.message || 'Seed failed'); }
        finally { setSeeding(false); }
    };

    const toggleGroup = (label) => setExpandedGroups(p => ({ ...p, [label]: !p[label] }));

    const filteredRoles = roles.filter(r => {
        const matchSearch = !searchRole || r.name.toLowerCase().includes(searchRole.toLowerCase());
        const matchModule = filterModule === 'all' || r.module === filterModule;
        return matchSearch && matchModule;
    });

    const isWildcard = permissions.has('*');

    // Group count helper
    const groupHasAll = (perms) => perms.every(p => permissions.has(p.key) || isWildcard);
    const groupCount = (perms) => isWildcard ? perms.length : perms.filter(p => permissions.has(p.key)).length;

    const canEdit = !selectedRole?.isSystem || isSuperAdmin;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-600/20 flex items-center justify-center">
                        <ShieldCheck size={20} className="text-violet-500" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-[var(--text-primary)]">Roles & Permissions</h1>
                        <p className="text-xs text-[var(--text-muted)]">{roles.length} roles · Dynamic RBAC</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {isSuperAdmin && (
                        <button onClick={seedRoles} disabled={seeding}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl border border-violet-500/30 text-violet-500 hover:bg-violet-500/10 transition-all disabled:opacity-50">
                            {seeding ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} />}
                            Seed System Roles
                        </button>
                    )}
                    {isMounted && (
                        <Can permission="settings.roles.manage">
                            <button onClick={() => setShowNewRole(true)}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-[var(--primary-500)] text-white hover:opacity-90 transition-all shadow-lg shadow-[var(--primary-500)]/20">
                                <Plus size={16} /> New Role
                            </button>
                        </Can>
                    )}
                </div>
            </div>

            {/* Alerts */}
            {error && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                    <AlertTriangle size={16} /> {error}
                    <button onClick={() => setError('')} className="ml-auto"><X size={14} /></button>
                </div>
            )}
            {success && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm">
                    <Check size={16} /> {success}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Roles List */}
                <div className="lg:col-span-1 space-y-3">
                    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-4">
                        {/* Search & Filter */}
                        <div className="space-y-3 mb-4">
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                                <input value={searchRole} onChange={e => setSearchRole(e.target.value)}
                                    placeholder="Search roles..."
                                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-[var(--surface-overlay)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]" />
                            </div>
                            <div className="flex gap-1 flex-wrap">
                                {['all', 'global', 'crm', 'hrms', 'erp'].map(m => (
                                    <button key={m} onClick={() => setFilterModule(m)}
                                        className={cn('px-2.5 py-1 rounded-lg text-xs font-bold uppercase transition-all',
                                            filterModule === m ? 'bg-[var(--primary-500)] text-white' : 'bg-[var(--surface-overlay)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                                        )}>{m}</button>
                                ))}
                            </div>
                        </div>

                        {/* Role List */}
                        <div className="space-y-1.5">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="h-14 rounded-xl bg-[var(--surface-overlay)] animate-pulse" />
                                ))
                            ) : filteredRoles.length === 0 ? (
                                <div className="text-center py-8 text-sm text-[var(--text-muted)]">
                                    <ShieldCheck size={32} className="mx-auto mb-2 opacity-30" />
                                    No roles found.{' '}
                                    {isSuperAdmin && <button onClick={seedRoles} className="text-violet-500 underline">Seed system roles</button>}
                                </div>
                            ) : filteredRoles.map(role => (
                                <button key={role._id} onClick={() => selectRole(role)}
                                    className={cn('w-full text-left p-3 rounded-xl transition-all',
                                        selectedRole?._id === role._id
                                            ? 'bg-[var(--primary-500)]/10 border border-[var(--primary-500)]/30'
                                            : 'hover:bg-[var(--surface-overlay)] border border-transparent'
                                    )}>
                                    <div className="flex items-center gap-2">
                                        <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0', MODULE_COLORS[role.module] || 'bg-gray-500/10 text-gray-500')}>
                                            <ShieldCheck size={13} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-sm font-semibold text-[var(--text-primary)] truncate">{role.name}</span>
                                                {role.isSystem && <Lock size={10} className="text-[var(--text-muted)] flex-shrink-0" />}
                                                {!role.organization && <Globe size={10} className="text-violet-500 flex-shrink-0" />}
                                            </div>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className={cn('text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-md border', MODULE_COLORS[role.module])}>
                                                    {MODULE_LABELS[role.module] || role.module}
                                                </span>
                                                <span className="text-[10px] text-[var(--text-muted)]">
                                                    {role.permissions?.includes('*') ? 'All perms' : `${role.permissions?.length || 0} perms`}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Permission Matrix */}
                <div className="lg:col-span-2">
                    {!selectedRole ? (
                        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-12 text-center">
                            <ShieldCheck size={48} className="mx-auto mb-3 text-[var(--text-muted)] opacity-30" />
                            <p className="text-sm text-[var(--text-muted)]">Select a role from the left to configure its permissions</p>
                        </div>
                    ) : (
                        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl overflow-hidden">
                            {/* Role Header */}
                            <div className="p-4 border-b border-[var(--border)] flex flex-col sm:flex-row sm:items-center gap-3">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-base font-bold text-[var(--text-primary)]">{selectedRole.name}</h2>
                                        {selectedRole.isSystem && (
                                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-bold border border-amber-500/20">
                                                <Lock size={9} /> System
                                            </span>
                                        )}
                                        {isWildcard && (
                                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-500 text-[10px] font-bold border border-violet-500/20">
                                                <Star size={9} /> Wildcard (*) — All Permissions
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                                        {selectedRole.description || 'No description'} · {isWildcard ? 'Full access' : `${permissions.size} permissions granted`}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {isMounted && (
                                        <Can permission="settings.roles.manage">
                                            <button onClick={() => setShowAssign(true)}
                                                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-[var(--surface-overlay)] text-[var(--text-primary)] hover:bg-[var(--border)] transition-all">
                                                <UserPlus size={13} /> Assign Users
                                            </button>
                                            <button onClick={cloneRole}
                                                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-[var(--surface-overlay)] text-[var(--text-primary)] hover:bg-[var(--border)] transition-all">
                                                <Copy size={13} /> Clone
                                            </button>
                                            {!selectedRole.isSystem && (
                                                <button onClick={deleteRole}
                                                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all">
                                                    <Trash2 size={13} />
                                                </button>
                                            )}
                                            <button onClick={savePermissions} disabled={saving || !canEdit}
                                                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-[var(--primary-500)] text-white hover:opacity-90 transition-all shadow-lg shadow-[var(--primary-500)]/20 disabled:opacity-50">
                                                {saving ? <RefreshCw size={13} className="animate-spin" /> : <Save size={13} />}
                                                {saving ? 'Saving...' : 'Save Matrix'}
                                            </button>
                                        </Can>
                                    )}
                                </div>
                            </div>

                            {/* System role warning */}
                            {selectedRole.isSystem && !isSuperAdmin && (
                                <div className="px-4 py-3 bg-amber-500/5 border-b border-amber-500/10 flex items-center gap-2 text-xs text-amber-600">
                                    <Lock size={13} />
                                    System roles can only be modified by Super Admin. You can clone this role to create a custom version.
                                </div>
                            )}

                            {/* Permission Groups */}
                            <div className="divide-y divide-[var(--border)] max-h-[600px] overflow-y-auto">
                                {PERM_GROUPS.map(group => {
                                    const isExpanded = expandedGroups[group.label] !== false; // default expanded
                                    const count = groupCount(group.perms);
                                    const hasAll = groupHasAll(group.perms);

                                    return (
                                        <div key={group.label}>
                                            {/* Group header */}
                                            <button
                                                onClick={() => toggleGroup(group.label)}
                                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--surface-overlay)] transition-all text-left"
                                            >
                                                <div className={cn('text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border', MODULE_COLORS[group.module])}>
                                                    {MODULE_LABELS[group.module]}
                                                </div>
                                                <span className="flex-1 text-sm font-semibold text-[var(--text-primary)]">{group.label}</span>
                                                <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full', count === group.perms.length ? 'bg-emerald-500/15 text-emerald-500' : count > 0 ? 'bg-amber-500/15 text-amber-500' : 'bg-[var(--surface-overlay)] text-[var(--text-muted)]')}>
                                                    {count}/{group.perms.length}
                                                </span>
                                                {/* Select All toggle */}
                                                {canEdit && (
                                                    <button
                                                        onClick={e => {
                                                            e.stopPropagation();
                                                            setPermissions(prev => {
                                                                const next = new Set(prev);
                                                                if (hasAll) group.perms.forEach(p => next.delete(p.key));
                                                                else group.perms.forEach(p => next.add(p.key));
                                                                return next;
                                                            });
                                                        }}
                                                        className={cn('text-[10px] font-bold px-2 py-0.5 rounded-lg transition-all', hasAll ? 'bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25' : 'bg-[var(--surface-overlay)] text-[var(--text-muted)] hover:text-[var(--text-primary)]')}
                                                    >
                                                        {hasAll ? 'Deselect All' : 'Select All'}
                                                    </button>
                                                )}
                                                {isExpanded ? <ChevronDown size={14} className="text-[var(--text-muted)]" /> : <ChevronRight size={14} className="text-[var(--text-muted)]" />}
                                            </button>

                                            {/* Permission toggles */}
                                            {isExpanded && (
                                                <div className="px-4 pb-3 flex flex-wrap gap-2">
                                                    {group.perms.map(perm => {
                                                        const active = isWildcard || permissions.has(perm.key);
                                                        return (
                                                            <button
                                                                key={perm.key}
                                                                onClick={() => togglePermission(perm.key)}
                                                                disabled={!canEdit || isWildcard}
                                                                title={perm.key}
                                                                className={cn(
                                                                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all',
                                                                    active
                                                                        ? 'bg-[var(--primary-500)]/15 text-[var(--primary-500)] border-[var(--primary-500)]/30'
                                                                        : 'bg-[var(--surface-overlay)] text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--primary-500)]/30 hover:text-[var(--text-primary)]',
                                                                    !canEdit && 'cursor-not-allowed opacity-60',
                                                                )}
                                                            >
                                                                <div className={cn('w-3.5 h-3.5 rounded flex items-center justify-center border transition-all',
                                                                    active ? 'bg-[var(--primary-500)] border-[var(--primary-500)]' : 'border-[var(--border)]'
                                                                )}>
                                                                    {active && <Check size={8} className="text-white" />}
                                                                </div>
                                                                {perm.label}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Role Modal */}
            <Modal open={showNewRole} title="Create Custom Role" onClose={() => setShowNewRole(false)}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">Role Name *</label>
                        <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                            placeholder="e.g. Regional Sales Manager"
                            className="w-full px-3 py-2 rounded-xl bg-[var(--surface-overlay)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">Module</label>
                        <select value={form.module} onChange={e => setForm(p => ({ ...p, module: e.target.value }))}
                            className="w-full px-3 py-2 rounded-xl bg-[var(--surface-overlay)] border border-[var(--border)] text-sm text-[var(--text-primary)]">
                            <option value="global">Global</option>
                            <option value="crm">CRM</option>
                            <option value="hrms">HRMS</option>
                            <option value="erp">ERP</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">Description</label>
                        <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                            placeholder="What can this role do?"
                            rows={3}
                            className="w-full px-3 py-2 rounded-xl bg-[var(--surface-overlay)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-none" />
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setShowNewRole(false)}
                            className="flex-1 py-2.5 rounded-xl border border-[var(--border)] text-sm font-semibold text-[var(--text-muted)] hover:bg-[var(--surface-overlay)] transition-all">
                            Cancel
                        </button>
                        <button onClick={createRole} disabled={creating || !form.name}
                            className="flex-1 py-2.5 rounded-xl bg-[var(--primary-500)] text-white text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50">
                            {creating ? 'Creating…' : 'Create Role'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Assign Role Modal */}
            {showAssign && selectedRole && (
                <AssignRoleModal
                    role={selectedRole}
                    onClose={() => setShowAssign(false)}
                    onSuccess={() => { setShowAssign(false); setSuccess('Role assigned successfully'); setTimeout(() => setSuccess(''), 3000); }}
                />
            )}
        </div>
    );
}
