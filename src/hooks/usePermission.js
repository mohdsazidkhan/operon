'use client';

import { useAuthStore } from '@/store/useAuthStore';

/**
 * Check a single permission key.
 * 
 * @example
 * const canCreate = usePermission('crm.leads.create');
 * if (!canCreate) return null;
 */
export function usePermission(permKey) {
    return useAuthStore(state => state.hasPermission(permKey));
}

/**
 * Check multiple permission keys at once.
 * Returns an array of booleans in the same order as the input.
 * 
 * @example
 * const [canView, canCreate, canDelete] = usePermissions([
 *   'crm.leads.view', 'crm.leads.create', 'crm.leads.delete'
 * ]);
 */
export function usePermissions(permKeys) {
    return useAuthStore(state => permKeys.map(k => state.hasPermission(k)));
}

/**
 * Returns true if user has at least one of the given keys.
 * 
 * @example
 * const canManage = useAnyPermission(['erp.invoices.create', 'erp.invoices.approve']);
 */
export function useAnyPermission(permKeys) {
    return useAuthStore(state => state.hasAnyPermission(permKeys));
}

/**
 * Returns the full permissions array (for debugging or custom logic).
 */
export function usePermissionList() {
    return useAuthStore(state => state.permissions);
}
