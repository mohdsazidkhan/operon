/**
 * Operon RBAC — Centralized Permission Registry
 * Single source of truth for all permission keys across the platform.
 * Used for: DB seeding, API validation, frontend guard checks.
 */

// ─── All Permission Keys ────────────────────────────────────────────────────

export const PERMISSIONS = {
    // ── Global / Platform ──────────────────────────────────────────────────
    DASHBOARD_VIEW: 'dashboard.view',

    // Settings — User management
    SETTINGS_USERS_VIEW: 'settings.users.view',
    SETTINGS_USERS_MANAGE: 'settings.users.manage',

    // Settings — Roles & RBAC
    SETTINGS_ROLES_VIEW: 'settings.roles.view',
    SETTINGS_ROLES_MANAGE: 'settings.roles.manage',

    // Settings — Organization
    SETTINGS_ORG_VIEW: 'settings.organization.view',
    SETTINGS_ORG_MANAGE: 'settings.organization.manage',

    // Settings — Audit
    SETTINGS_AUDIT_VIEW: 'settings.audit-logs.view',

    // ── CRM ───────────────────────────────────────────────────────────────
    CRM_LEADS_VIEW: 'crm.leads.view',
    CRM_LEADS_CREATE: 'crm.leads.create',
    CRM_LEADS_EDIT: 'crm.leads.edit',
    CRM_LEADS_DELETE: 'crm.leads.delete',
    CRM_LEADS_ASSIGN: 'crm.leads.assign',

    CRM_CONTACTS_VIEW: 'crm.contacts.view',
    CRM_CONTACTS_CREATE: 'crm.contacts.create',
    CRM_CONTACTS_EDIT: 'crm.contacts.edit',
    CRM_CONTACTS_DELETE: 'crm.contacts.delete',

    CRM_COMPANIES_VIEW: 'crm.companies.view',
    CRM_COMPANIES_CREATE: 'crm.companies.create',
    CRM_COMPANIES_EDIT: 'crm.companies.edit',
    CRM_COMPANIES_DELETE: 'crm.companies.delete',

    CRM_DEALS_VIEW: 'crm.deals.view',
    CRM_DEALS_CREATE: 'crm.deals.create',
    CRM_DEALS_EDIT: 'crm.deals.edit',
    CRM_DEALS_DELETE: 'crm.deals.delete',
    CRM_DEALS_APPROVE: 'crm.deals.approve',

    CRM_PIPELINE_VIEW: 'crm.pipeline.view',
    CRM_PIPELINE_MANAGE: 'crm.pipeline.manage',

    CRM_REPORTS_VIEW: 'crm.reports.view',

    // ── HRMS ──────────────────────────────────────────────────────────────
    HRMS_EMPLOYEES_VIEW: 'hrms.employees.view',
    HRMS_EMPLOYEES_CREATE: 'hrms.employees.create',
    HRMS_EMPLOYEES_EDIT: 'hrms.employees.edit',
    HRMS_EMPLOYEES_DELETE: 'hrms.employees.delete',

    HRMS_DEPARTMENTS_VIEW: 'hrms.departments.view',
    HRMS_DEPARTMENTS_MANAGE: 'hrms.departments.manage',

    HRMS_ATTENDANCE_VIEW: 'hrms.attendance.view',
    HRMS_ATTENDANCE_MANAGE: 'hrms.attendance.manage',

    HRMS_LEAVES_VIEW: 'hrms.leaves.view',
    HRMS_LEAVES_APPLY: 'hrms.leaves.apply',
    HRMS_LEAVES_APPROVE: 'hrms.leaves.approve',

    HRMS_PAYROLL_VIEW: 'hrms.payroll.view',
    HRMS_PAYROLL_PROCESS: 'hrms.payroll.process',

    HRMS_RECRUITMENT_VIEW: 'hrms.recruitment.view',
    HRMS_RECRUITMENT_MANAGE: 'hrms.recruitment.manage',

    HRMS_PERFORMANCE_VIEW: 'hrms.performance.view',
    HRMS_PERFORMANCE_MANAGE: 'hrms.performance.manage',

    // ── ERP ───────────────────────────────────────────────────────────────
    ERP_INVENTORY_VIEW: 'erp.inventory.view',
    ERP_INVENTORY_MANAGE: 'erp.inventory.manage',

    ERP_PRODUCTS_VIEW: 'erp.products.view',
    ERP_PRODUCTS_MANAGE: 'erp.products.manage',

    ERP_ORDERS_VIEW: 'erp.orders.view',
    ERP_ORDERS_CREATE: 'erp.orders.create',
    ERP_ORDERS_PROCESS: 'erp.orders.process',

    ERP_INVOICES_VIEW: 'erp.invoices.view',
    ERP_INVOICES_CREATE: 'erp.invoices.create',
    ERP_INVOICES_APPROVE: 'erp.invoices.approve',

    ERP_VENDORS_VIEW: 'erp.vendors.view',
    ERP_VENDORS_MANAGE: 'erp.vendors.manage',

    ERP_PURCHASE_ORDERS_VIEW: 'erp.purchase-orders.view',
    ERP_PURCHASE_ORDERS_CREATE: 'erp.purchase-orders.create',
    ERP_PURCHASE_ORDERS_APPROVE: 'erp.purchase-orders.approve',

    ERP_EXPENSES_VIEW: 'erp.expenses.view',
    ERP_EXPENSES_APPROVE: 'erp.expenses.approve',

    ERP_BUDGET_VIEW: 'erp.budget.view',
    ERP_BUDGET_MANAGE: 'erp.budget.manage',

    ERP_CREDIT_NOTES_VIEW: 'erp.credit-notes.view',
    ERP_CREDIT_NOTES_MANAGE: 'erp.credit-notes.manage',

    ERP_FINANCE_VIEW: 'erp.finance.view',
    ERP_FINANCE_REPORT: 'erp.finance.report',

    // ── Apps ──────────────────────────────────────────────────────────────
    APPS_PROJECTS_VIEW: 'apps.projects.view',
    APPS_PROJECTS_MANAGE: 'apps.projects.manage',

    APPS_TASKS_VIEW: 'apps.tasks.view',
    APPS_TASKS_MANAGE: 'apps.tasks.manage',

    APPS_NOTES_VIEW: 'apps.notes.view',
    APPS_NOTES_MANAGE: 'apps.notes.manage',

    APPS_ANNOUNCEMENTS_VIEW: 'apps.announcements.view',
    APPS_ANNOUNCEMENTS_MANAGE: 'apps.announcements.manage',
};

// Wildcard sentinel — super_admin gets this instead of listing every key
export const WILDCARD_PERMISSION = '*';

// ─── All Permission Definitions (for seeding into DB) ─────────────────────

export const PERMISSION_DEFINITIONS = [
    // Global
    { key: 'dashboard.view', module: 'global', resource: 'dashboard', action: 'view', description: 'View dashboard' },
    { key: 'settings.users.view', module: 'global', resource: 'users', action: 'view', description: 'View user list' },
    { key: 'settings.users.manage', module: 'global', resource: 'users', action: 'manage', description: 'Create, edit, delete users' },
    { key: 'settings.roles.view', module: 'global', resource: 'roles', action: 'view', description: 'View roles & permissions' },
    { key: 'settings.roles.manage', module: 'global', resource: 'roles', action: 'manage', description: 'Create, edit, delete roles' },
    { key: 'settings.organization.view', module: 'global', resource: 'organization', action: 'view', description: 'View org settings' },
    { key: 'settings.organization.manage', module: 'global', resource: 'organization', action: 'manage', description: 'Edit org settings' },
    { key: 'settings.audit-logs.view', module: 'global', resource: 'audit-logs', action: 'view', description: 'View audit log' },
    // CRM
    { key: 'crm.leads.view', module: 'crm', resource: 'leads', action: 'view', description: 'View leads' },
    { key: 'crm.leads.create', module: 'crm', resource: 'leads', action: 'create', description: 'Create leads' },
    { key: 'crm.leads.edit', module: 'crm', resource: 'leads', action: 'edit', description: 'Edit leads' },
    { key: 'crm.leads.delete', module: 'crm', resource: 'leads', action: 'delete', description: 'Delete leads' },
    { key: 'crm.leads.assign', module: 'crm', resource: 'leads', action: 'assign', description: 'Reassign lead owners' },
    { key: 'crm.contacts.view', module: 'crm', resource: 'contacts', action: 'view', description: 'View contacts' },
    { key: 'crm.contacts.create', module: 'crm', resource: 'contacts', action: 'create', description: 'Create contacts' },
    { key: 'crm.contacts.edit', module: 'crm', resource: 'contacts', action: 'edit', description: 'Edit contacts' },
    { key: 'crm.contacts.delete', module: 'crm', resource: 'contacts', action: 'delete', description: 'Delete contacts' },
    { key: 'crm.companies.view', module: 'crm', resource: 'companies', action: 'view', description: 'View companies' },
    { key: 'crm.companies.create', module: 'crm', resource: 'companies', action: 'create', description: 'Create companies' },
    { key: 'crm.companies.edit', module: 'crm', resource: 'companies', action: 'edit', description: 'Edit companies' },
    { key: 'crm.companies.delete', module: 'crm', resource: 'companies', action: 'delete', description: 'Delete companies' },
    { key: 'crm.deals.view', module: 'crm', resource: 'deals', action: 'view', description: 'View deals' },
    { key: 'crm.deals.create', module: 'crm', resource: 'deals', action: 'create', description: 'Create deals' },
    { key: 'crm.deals.edit', module: 'crm', resource: 'deals', action: 'edit', description: 'Edit deals' },
    { key: 'crm.deals.delete', module: 'crm', resource: 'deals', action: 'delete', description: 'Delete deals' },
    { key: 'crm.deals.approve', module: 'crm', resource: 'deals', action: 'approve', description: 'Approve/reject deals' },
    { key: 'crm.pipeline.view', module: 'crm', resource: 'pipeline', action: 'view', description: 'View pipeline' },
    { key: 'crm.pipeline.manage', module: 'crm', resource: 'pipeline', action: 'manage', description: 'Manage pipeline stages' },
    { key: 'crm.reports.view', module: 'crm', resource: 'reports', action: 'view', description: 'View CRM reports' },
    // HRMS
    { key: 'hrms.employees.view', module: 'hrms', resource: 'employees', action: 'view', description: 'View employees' },
    { key: 'hrms.employees.create', module: 'hrms', resource: 'employees', action: 'create', description: 'Add employees' },
    { key: 'hrms.employees.edit', module: 'hrms', resource: 'employees', action: 'edit', description: 'Edit employee profiles' },
    { key: 'hrms.employees.delete', module: 'hrms', resource: 'employees', action: 'delete', description: 'Remove employees' },
    { key: 'hrms.departments.view', module: 'hrms', resource: 'departments', action: 'view', description: 'View departments' },
    { key: 'hrms.departments.manage', module: 'hrms', resource: 'departments', action: 'manage', description: 'Manage departments' },
    { key: 'hrms.attendance.view', module: 'hrms', resource: 'attendance', action: 'view', description: 'View attendance' },
    { key: 'hrms.attendance.manage', module: 'hrms', resource: 'attendance', action: 'manage', description: 'Manage attendance records' },
    { key: 'hrms.leaves.view', module: 'hrms', resource: 'leaves', action: 'view', description: 'View leave requests' },
    { key: 'hrms.leaves.apply', module: 'hrms', resource: 'leaves', action: 'apply', description: 'Submit leave requests' },
    { key: 'hrms.leaves.approve', module: 'hrms', resource: 'leaves', action: 'approve', description: 'Approve/reject leaves' },
    { key: 'hrms.payroll.view', module: 'hrms', resource: 'payroll', action: 'view', description: 'View payroll records' },
    { key: 'hrms.payroll.process', module: 'hrms', resource: 'payroll', action: 'process', description: 'Process payroll' },
    { key: 'hrms.recruitment.view', module: 'hrms', resource: 'recruitment', action: 'view', description: 'View job postings' },
    { key: 'hrms.recruitment.manage', module: 'hrms', resource: 'recruitment', action: 'manage', description: 'Manage recruitment' },
    { key: 'hrms.performance.view', module: 'hrms', resource: 'performance', action: 'view', description: 'View performance reviews' },
    { key: 'hrms.performance.manage', module: 'hrms', resource: 'performance', action: 'manage', description: 'Manage performance reviews' },
    // ERP
    { key: 'erp.inventory.view', module: 'erp', resource: 'inventory', action: 'view', description: 'View inventory' },
    { key: 'erp.inventory.manage', module: 'erp', resource: 'inventory', action: 'manage', description: 'Manage inventory' },
    { key: 'erp.products.view', module: 'erp', resource: 'products', action: 'view', description: 'View products' },
    { key: 'erp.products.manage', module: 'erp', resource: 'products', action: 'manage', description: 'Manage products' },
    { key: 'erp.orders.view', module: 'erp', resource: 'orders', action: 'view', description: 'View orders' },
    { key: 'erp.orders.create', module: 'erp', resource: 'orders', action: 'create', description: 'Create orders' },
    { key: 'erp.orders.process', module: 'erp', resource: 'orders', action: 'process', description: 'Process/fulfill orders' },
    { key: 'erp.invoices.view', module: 'erp', resource: 'invoices', action: 'view', description: 'View invoices' },
    { key: 'erp.invoices.create', module: 'erp', resource: 'invoices', action: 'create', description: 'Create invoices' },
    { key: 'erp.invoices.approve', module: 'erp', resource: 'invoices', action: 'approve', description: 'Approve invoices' },
    { key: 'erp.vendors.view', module: 'erp', resource: 'vendors', action: 'view', description: 'View vendors' },
    { key: 'erp.vendors.manage', module: 'erp', resource: 'vendors', action: 'manage', description: 'Manage vendors' },
    { key: 'erp.purchase-orders.view', module: 'erp', resource: 'purchase-orders', action: 'view', description: 'View purchase orders' },
    { key: 'erp.purchase-orders.create', module: 'erp', resource: 'purchase-orders', action: 'create', description: 'Create purchase orders' },
    { key: 'erp.purchase-orders.approve', module: 'erp', resource: 'purchase-orders', action: 'approve', description: 'Approve purchase orders' },
    { key: 'erp.expenses.view', module: 'erp', resource: 'expenses', action: 'view', description: 'View expenses' },
    { key: 'erp.expenses.approve', module: 'erp', resource: 'expenses', action: 'approve', description: 'Approve expenses' },
    { key: 'erp.budget.view', module: 'erp', resource: 'budget', action: 'view', description: 'View budgets' },
    { key: 'erp.budget.manage', module: 'erp', resource: 'budget', action: 'manage', description: 'Manage budgets' },
    { key: 'erp.credit-notes.view', module: 'erp', resource: 'credit-notes', action: 'view', description: 'View credit notes' },
    { key: 'erp.credit-notes.manage', module: 'erp', resource: 'credit-notes', action: 'manage', description: 'Manage credit notes' },
    { key: 'erp.finance.view', module: 'erp', resource: 'finance', action: 'view', description: 'View finance reports' },
    { key: 'erp.finance.report', module: 'erp', resource: 'finance', action: 'report', description: 'Generate finance reports' },
    // Apps
    { key: 'apps.projects.view', module: 'global', resource: 'projects', action: 'view', description: 'View projects' },
    { key: 'apps.projects.manage', module: 'global', resource: 'projects', action: 'manage', description: 'Manage projects' },
    { key: 'apps.tasks.view', module: 'global', resource: 'tasks', action: 'view', description: 'View tasks' },
    { key: 'apps.tasks.manage', module: 'global', resource: 'tasks', action: 'manage', description: 'Manage tasks' },
    { key: 'apps.notes.view', module: 'global', resource: 'notes', action: 'view', description: 'View notes' },
    { key: 'apps.notes.manage', module: 'global', resource: 'notes', action: 'manage', description: 'Manage notes' },
    { key: 'apps.announcements.view', module: 'global', resource: 'announcements', action: 'view', description: 'View announcements' },
    { key: 'apps.announcements.manage', module: 'global', resource: 'announcements', action: 'manage', description: 'Manage announcements' },
];

// ─── System Role Definitions (for seeding) ──────────────────────────────────

const ALL_KEYS = PERMISSION_DEFINITIONS.map(p => p.key);
const CRM_KEYS = ALL_KEYS.filter(k => k.startsWith('crm.'));
const HRMS_KEYS = ALL_KEYS.filter(k => k.startsWith('hrms.'));
const ERP_KEYS = ALL_KEYS.filter(k => k.startsWith('erp.'));
const GLOBAL_SETTINGS = ALL_KEYS.filter(k => k.startsWith('settings.') || k === 'dashboard.view');
const APPS_KEYS = ALL_KEYS.filter(k => k.startsWith('apps.'));

export const SYSTEM_ROLES = [
    {
        slug: 'super_admin',
        name: 'Super Admin',
        description: 'Full platform control — unrestricted access',
        module: 'global',
        permissions: [WILDCARD_PERMISSION], // wildcarded
        isSystem: true,
    },
    {
        slug: 'org_admin',
        name: 'Organization Admin',
        description: 'Company-wide control, all modules',
        module: 'global',
        permissions: [...ALL_KEYS],
        isSystem: true,
    },
    // CRM Roles
    {
        slug: 'crm_admin',
        name: 'CRM Admin',
        description: 'Full access to CRM module',
        module: 'crm',
        permissions: [...CRM_KEYS, 'dashboard.view'],
        isSystem: true,
    },
    {
        slug: 'sales_manager',
        name: 'Sales Manager',
        description: 'Manage leads, approve deals, view reports',
        module: 'crm',
        permissions: [
            'dashboard.view',
            'crm.leads.view', 'crm.leads.create', 'crm.leads.edit', 'crm.leads.assign',
            'crm.contacts.view', 'crm.contacts.create', 'crm.contacts.edit',
            'crm.deals.view', 'crm.deals.create', 'crm.deals.edit', 'crm.deals.approve',
            'crm.companies.view', 'crm.pipeline.view', 'crm.pipeline.manage',
            'crm.reports.view',
            'apps.tasks.view', 'apps.tasks.manage',
        ],
        isSystem: true,
    },
    {
        slug: 'sales_executive',
        name: 'Sales Executive',
        description: 'Create and manage own leads and deals',
        module: 'crm',
        permissions: [
            'dashboard.view',
            'crm.leads.view', 'crm.leads.create', 'crm.leads.edit',
            'crm.contacts.view', 'crm.contacts.create',
            'crm.deals.view', 'crm.deals.create', 'crm.deals.edit',
            'crm.companies.view', 'crm.pipeline.view',
            'apps.tasks.view', 'apps.tasks.manage', 'apps.notes.view', 'apps.notes.manage',
        ],
        isSystem: true,
    },
    {
        slug: 'support_manager',
        name: 'Support Manager',
        description: 'Manage customer support contacts and escalations',
        module: 'crm',
        permissions: [
            'dashboard.view',
            'crm.contacts.view', 'crm.contacts.create', 'crm.contacts.edit', 'crm.contacts.delete',
            'crm.companies.view', 'crm.companies.create',
            'crm.leads.view',
            'apps.tasks.view', 'apps.tasks.manage',
        ],
        isSystem: true,
    },
    {
        slug: 'support_agent',
        name: 'Support Agent',
        description: 'View and respond to customer contacts',
        module: 'crm',
        permissions: [
            'dashboard.view',
            'crm.contacts.view', 'crm.contacts.create',
            'crm.companies.view',
            'apps.tasks.view', 'apps.notes.view', 'apps.notes.manage',
        ],
        isSystem: true,
    },
    {
        slug: 'client_portal',
        name: 'Client Portal User',
        description: 'External client — view their own deals and invoices',
        module: 'crm',
        permissions: [
            'dashboard.view',
            'crm.deals.view',
            'erp.invoices.view',
        ],
        isSystem: true,
    },
    // HRMS Roles
    {
        slug: 'hr_admin',
        name: 'HR Admin',
        description: 'Full access to HRMS module',
        module: 'hrms',
        permissions: [...HRMS_KEYS, 'dashboard.view', ...GLOBAL_SETTINGS.filter(k => k.includes('users'))],
        isSystem: true,
    },
    {
        slug: 'hr_manager',
        name: 'HR Manager',
        description: 'Manage employees, approve leaves and payroll',
        module: 'hrms',
        permissions: [
            'dashboard.view',
            'hrms.employees.view', 'hrms.employees.create', 'hrms.employees.edit',
            'hrms.departments.view', 'hrms.departments.manage',
            'hrms.attendance.view', 'hrms.attendance.manage',
            'hrms.leaves.view', 'hrms.leaves.approve',
            'hrms.payroll.view', 'hrms.payroll.process',
            'hrms.recruitment.view', 'hrms.recruitment.manage',
            'hrms.performance.view', 'hrms.performance.manage',
            'apps.announcements.view',
        ],
        isSystem: true,
    },
    {
        slug: 'hr_executive',
        name: 'HR Executive',
        description: 'Day-to-day HR operations, limited payroll access',
        module: 'hrms',
        permissions: [
            'dashboard.view',
            'hrms.employees.view', 'hrms.employees.edit',
            'hrms.departments.view',
            'hrms.attendance.view', 'hrms.attendance.manage',
            'hrms.leaves.view', 'hrms.leaves.approve',
            'hrms.recruitment.view',
            'hrms.performance.view',
        ],
        isSystem: true,
    },
    {
        slug: 'team_lead',
        name: 'Team Lead',
        description: 'View team members, attendance, approve direct reports\' leaves',
        module: 'hrms',
        permissions: [
            'dashboard.view',
            'hrms.employees.view',
            'hrms.attendance.view',
            'hrms.leaves.view', 'hrms.leaves.approve',
            'hrms.performance.view',
            'apps.tasks.view', 'apps.tasks.manage',
            'apps.projects.view',
        ],
        isSystem: true,
    },
    {
        slug: 'employee',
        name: 'Employee',
        description: 'Basic self-service HR access',
        module: 'hrms',
        permissions: [
            'dashboard.view',
            'hrms.attendance.view',
            'hrms.leaves.view', 'hrms.leaves.apply',
            'hrms.payroll.view',
            'apps.tasks.view', 'apps.tasks.manage',
            'apps.notes.view', 'apps.notes.manage',
            'apps.announcements.view',
        ],
        isSystem: true,
    },
    // ERP Roles
    {
        slug: 'erp_admin',
        name: 'ERP Admin',
        description: 'Full access to ERP module',
        module: 'erp',
        permissions: [...ERP_KEYS, 'dashboard.view'],
        isSystem: true,
    },
    {
        slug: 'operations_manager',
        name: 'Operations Manager',
        description: 'Manage orders, inventory, and operations',
        module: 'erp',
        permissions: [
            'dashboard.view',
            'erp.inventory.view', 'erp.inventory.manage',
            'erp.orders.view', 'erp.orders.create', 'erp.orders.process',
            'erp.products.view', 'erp.products.manage',
            'erp.vendors.view',
            'apps.projects.view', 'apps.tasks.view', 'apps.tasks.manage',
        ],
        isSystem: true,
    },
    {
        slug: 'inventory_manager',
        name: 'Inventory Manager',
        description: 'Full inventory and product management',
        module: 'erp',
        permissions: [
            'dashboard.view',
            'erp.inventory.view', 'erp.inventory.manage',
            'erp.products.view', 'erp.products.manage',
            'erp.vendors.view',
            'erp.orders.view',
        ],
        isSystem: true,
    },
    {
        slug: 'procurement_manager',
        name: 'Procurement Manager',
        description: 'Manage purchase orders and vendor relations',
        module: 'erp',
        permissions: [
            'dashboard.view',
            'erp.purchase-orders.view', 'erp.purchase-orders.create', 'erp.purchase-orders.approve',
            'erp.vendors.view', 'erp.vendors.manage',
            'erp.expenses.view', 'erp.expenses.approve',
            'erp.inventory.view',
        ],
        isSystem: true,
    },
    {
        slug: 'finance_manager',
        name: 'Finance Manager',
        description: 'Manage invoices, budgets, and financial reporting',
        module: 'erp',
        permissions: [
            'dashboard.view',
            'erp.invoices.view', 'erp.invoices.create', 'erp.invoices.approve',
            'erp.credit-notes.view', 'erp.credit-notes.manage',
            'erp.budget.view', 'erp.budget.manage',
            'erp.expenses.view', 'erp.expenses.approve',
            'erp.finance.view', 'erp.finance.report',
            'settings.audit-logs.view',
        ],
        isSystem: true,
    },
    {
        slug: 'vendor_portal',
        name: 'Vendor Portal User',
        description: 'External vendor — view their own orders and invoices',
        module: 'erp',
        permissions: [
            'dashboard.view',
            'erp.orders.view',
            'erp.invoices.view',
            'erp.purchase-orders.view',
        ],
        isSystem: true,
    },
];

// ─── Helper: check if a permission Set satisfies a required key ─────────────
export function checkPermission(permSet, key) {
    if (!permSet) return false;
    if (permSet.has(WILDCARD_PERMISSION)) return true;
    return permSet.has(key);
}

// ─── Grouped map for sidebar filtering ───────────────────────────────────────
export const ROUTE_PERMISSIONS = {
    '/crm/leads': 'crm.leads.view',
    '/crm/contacts': 'crm.contacts.view',
    '/crm/deals': 'crm.deals.view',
    '/crm/companies': 'crm.companies.view',
    '/crm/pipeline': 'crm.pipeline.view',
    '/hrms/employees': 'hrms.employees.view',
    '/hrms/departments': 'hrms.departments.view',
    '/hrms/recruitment': 'hrms.recruitment.view',
    '/hrms/performance': 'hrms.performance.view',
    '/hrms/attendance': 'hrms.attendance.view',
    '/hrms/leaves': 'hrms.leaves.view',
    '/hrms/payroll': 'hrms.payroll.view',
    '/erp/invoices': 'erp.invoices.view',
    '/erp/purchase-orders': 'erp.purchase-orders.view',
    '/erp/vendors': 'erp.vendors.view',
    '/erp/credit-notes': 'erp.credit-notes.view',
    '/erp/budget': 'erp.budget.view',
    '/erp/inventory': 'erp.inventory.view',
    '/erp/products': 'erp.products.view',
    '/erp/orders': 'erp.orders.view',
    '/erp/expenses': 'erp.expenses.view',
    '/apps/projects': 'apps.projects.view',
    '/apps/tasks': 'apps.tasks.view',
    '/apps/notes': 'apps.notes.view',
    '/apps/announcements': 'apps.announcements.view',
    '/settings/users': 'settings.users.view',
    '/settings/roles': 'settings.roles.view',
    '/settings/organization': 'settings.organization.view',
    '/settings/audit-logs': 'settings.audit-logs.view',
};
