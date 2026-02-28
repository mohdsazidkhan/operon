import { useAuthStore } from '@/store/useAuthStore';

/**
 * <Can> — Declarative permission gate component.
 * 
 * Renders children only if the current user has the required permission(s).
 * Optionally renders a fallback element when access is denied.
 * 
 * @param {string}   permission          - Single permission key (e.g. "crm.leads.create")
 * @param {string[]} anyOf               - Array of keys — access granted if user has ANY
 * @param {string[]} allOf               - Array of keys — access granted only if user has ALL
 * @param {React.ReactNode} fallback     - Rendered when access is denied (default: null)
 * @param {React.ReactNode} children     - Content to show when access is granted
 * 
 * @example — Single permission:
 *   <Can permission="crm.leads.create">
 *     <button>New Lead</button>
 *   </Can>
 * 
 * @example — With fallback:
 *   <Can permission="erp.invoices.approve" fallback={<span>No Access</span>}>
 *     <ApproveButton />
 *   </Can>
 * 
 * @example — OR logic:
 *   <Can anyOf={['erp.invoices.create', 'erp.invoices.approve']}>
 *     <InvoiceActions />
 *   </Can>
 */
export default function Can({ permission, anyOf, allOf, children, fallback = null }) {
    const hasPermission = useAuthStore(state => state.hasPermission);
    const hasAnyPermission = useAuthStore(state => state.hasAnyPermission);
    const hasAllPermissions = useAuthStore(state => state.hasAllPermissions);

    let allowed = false;

    if (permission) {
        allowed = hasPermission(permission);
    } else if (anyOf && anyOf.length > 0) {
        allowed = hasAnyPermission(anyOf);
    } else if (allOf && allOf.length > 0) {
        allowed = hasAllPermissions(allOf);
    } else {
        // No restriction specified — allow by default
        allowed = true;
    }

    return allowed ? children : fallback;
}
