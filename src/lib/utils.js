import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
    return twMerge(clsx(inputs))
}

export const formatCurrency = (amount, currency = 'USD') =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount || 0);

export const formatDate = (date, options = {}) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', ...options });
};

export const formatRelativeTime = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return formatDate(date);
};

export const getInitials = (name = '') =>
    name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

export const slugify = (str) =>
    str.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

export const truncate = (str, n = 60) =>
    str && str.length > n ? str.slice(0, n) + '...' : str;

export const getStatusColor = (status) => {
    const map = {
        active: 'text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400',
        inactive: 'text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-400',
        pending: 'text-amber-700 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400',
        approved: 'text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400',
        rejected: 'text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-400',
        paid: 'text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400',
        sent: 'text-blue-700 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',
        overdue: 'text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-400',
        draft: 'text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-400',
        new: 'text-purple-700 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400',
        contacted: 'text-blue-700 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',
        qualified: 'text-indigo-700 bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400',
        proposal: 'text-cyan-700 bg-cyan-100 dark:bg-cyan-900/30 dark:text-cyan-400',
        negotiation: 'text-amber-700 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400',
        won: 'text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400',
        lost: 'text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-400',
        on_leave: 'text-amber-700 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400',
        processing: 'text-blue-700 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',
        delivered: 'text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400',
        cancelled: 'text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-400',
        present: 'text-green-700 bg-green-100',
        absent: 'text-red-700 bg-red-100',
        half_day: 'text-amber-700 bg-amber-100',
        in_progress: 'text-blue-700 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',
        done: 'text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400',
        todo: 'text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-400',
    };
    return map[status] || 'text-slate-600 bg-slate-100';
};

export const getPriorityColor = (priority) => {
    const map = {
        low: 'text-slate-600 bg-slate-100',
        medium: 'text-blue-700 bg-blue-100',
        high: 'text-amber-700 bg-amber-100',
        urgent: 'text-red-700 bg-red-100',
    };
    return map[priority] || 'text-slate-600 bg-slate-100';
};
