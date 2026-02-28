/**
 * Operon Seed Script
 * Run: node scripts/seed.js
 * Inserts realistic demo data into MongoDB + seeds RBAC system roles
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Load .env.local manually (works with all dotenv versions)
const envFiles = ['.env.local', '.env'];
for (const envFile of envFiles) {
    const envPath = path.resolve(__dirname, '..', envFile);
    if (fs.existsSync(envPath)) {
        const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
        for (const line of lines) {
            const match = line.match(/^([^#=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                const val = match[2].trim().replace(/^["']|["']$/g, '');
                if (!process.env[key]) process.env[key] = val;
            }
        }
        break;
    }
}

const raw = process.env.MONGODB_URI || '';
// Normalize to uppercase OPERON database (Atlas constraint)
const MONGODB_URI = raw.replace(/\/(operon|OPERON)\?/i, '/OPERON?');

// ─── Inline Schemas (mirrors src/models) ────────────────────────────────────

const OrgSchema = new mongoose.Schema({
    name: String, slug: String, logo: String, owner: mongoose.Schema.Types.ObjectId,
    plan: { type: String, default: 'pro' }, seats: { type: Number, default: 50 },
    industry: String, website: String,
    address: { street: String, city: String, state: String, country: String, zip: String },
    settings: { currency: { type: String, default: 'USD' }, timezone: { type: String, default: 'UTC' } },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

const UserSchema = new mongoose.Schema({
    name: String, email: { type: String, unique: true }, password: { type: String, select: false },
    avatar: String, role: String, organization: mongoose.Schema.Types.ObjectId,
    department: String, position: String, phone: String, isActive: { type: Boolean, default: true },
}, { timestamps: true });

const EmployeeSchema = new mongoose.Schema({
    employeeId: { type: String, unique: true }, user: mongoose.Schema.Types.ObjectId,
    name: String, email: String, phone: String, avatar: String,
    department: String, position: String,
    employmentType: { type: String, default: 'full_time' },
    status: { type: String, default: 'active' },
    hireDate: Date, salary: Number, salaryType: { type: String, default: 'monthly' },
    skills: [String], organization: mongoose.Schema.Types.ObjectId,
}, { timestamps: true });

const ProductSchema = new mongoose.Schema({
    name: String, sku: { type: String, unique: true }, description: String, category: String,
    price: Number, cost: Number, stock: Number, unit: String, status: String,
    organization: mongoose.Schema.Types.ObjectId, createdBy: mongoose.Schema.Types.ObjectId,
}, { timestamps: true });

const LeadSchema = new mongoose.Schema({
    name: String, email: String, phone: String, company: String, position: String,
    source: String, status: String, score: Number, value: Number,
    owner: mongoose.Schema.Types.ObjectId, organization: mongoose.Schema.Types.ObjectId,
    industry: String, nextFollowUp: Date,
}, { timestamps: true });

const DealSchema = new mongoose.Schema({
    title: String, value: Number, stage: String, probability: Number,
    contact: mongoose.Schema.Types.ObjectId, company: mongoose.Schema.Types.ObjectId,
    owner: mongoose.Schema.Types.ObjectId, organization: mongoose.Schema.Types.ObjectId,
    expectedCloseDate: Date, notes: String,
}, { timestamps: true });

const ContactSchema = new mongoose.Schema({
    name: String, email: String, phone: String, company: String, position: String,
    status: String, owner: mongoose.Schema.Types.ObjectId, organization: mongoose.Schema.Types.ObjectId,
    address: { city: String, country: String },
}, { timestamps: true });

const CompanySchema = new mongoose.Schema({
    name: String, website: String, industry: String, size: String, phone: String,
    address: { city: String, country: String },
    owner: mongoose.Schema.Types.ObjectId, organization: mongoose.Schema.Types.ObjectId,
}, { timestamps: true });

const OrderSchema = new mongoose.Schema({
    orderNumber: { type: String, unique: true }, customer: mongoose.Schema.Types.ObjectId,
    items: [{ name: String, quantity: Number, price: Number, total: Number }],
    subtotal: Number, tax: Number, shipping: Number, total: Number,
    status: String, paymentStatus: String, type: { type: String, default: 'sale' },
    organization: mongoose.Schema.Types.ObjectId, createdBy: mongoose.Schema.Types.ObjectId,
}, { timestamps: true });

const ExpenseSchema = new mongoose.Schema({
    title: String, amount: Number, category: String, status: String, date: Date,
    description: String, submittedBy: mongoose.Schema.Types.ObjectId,
    approvedBy: mongoose.Schema.Types.ObjectId, organization: mongoose.Schema.Types.ObjectId,
}, { timestamps: true });

const InvoiceSchema = new mongoose.Schema({
    invoiceNumber: { type: String, unique: true }, customer: mongoose.Schema.Types.ObjectId,
    items: [{ description: String, quantity: Number, price: Number, total: Number }],
    subtotal: Number, tax: Number, total: Number, status: String, dueDate: Date, issueDate: Date,
    organization: mongoose.Schema.Types.ObjectId, createdBy: mongoose.Schema.Types.ObjectId,
}, { timestamps: true });

const PayrollSchema = new mongoose.Schema({
    employee: mongoose.Schema.Types.ObjectId, period: String,
    baseSalary: Number, allowances: Number, deductions: Number, netPay: Number,
    status: String, payDate: Date, organization: mongoose.Schema.Types.ObjectId,
}, { timestamps: true });

const AttendanceSchema = new mongoose.Schema({
    employee: mongoose.Schema.Types.ObjectId, date: Date,
    checkIn: String, checkOut: String, status: String, hours: Number,
    organization: mongoose.Schema.Types.ObjectId,
}, { timestamps: true });

const LeaveSchema = new mongoose.Schema({
    employee: mongoose.Schema.Types.ObjectId, type: String,
    startDate: Date, endDate: Date, days: Number, reason: String,
    status: String, approvedBy: mongoose.Schema.Types.ObjectId,
    organization: mongoose.Schema.Types.ObjectId,
}, { timestamps: true });

const EventSchema = new mongoose.Schema({
    title: String, description: String, startDate: Date, endDate: Date,
    startTime: String, type: String, location: String,
    color: String, shadow: String,
    attendees: [mongoose.Schema.Types.ObjectId],
    organization: mongoose.Schema.Types.ObjectId, createdBy: mongoose.Schema.Types.ObjectId,
}, { timestamps: true });

const TaskSchema = new mongoose.Schema({
    title: String, description: String, status: String, priority: String,
    module: String, dueDate: Date,
    assignee: mongoose.Schema.Types.ObjectId, createdBy: mongoose.Schema.Types.ObjectId,
    organization: mongoose.Schema.Types.ObjectId,
}, { timestamps: true });

const NotificationSchema = new mongoose.Schema({
    title: String, message: String, type: String, priority: String,
    read: { type: Boolean, default: false },
    user: mongoose.Schema.Types.ObjectId, organization: mongoose.Schema.Types.ObjectId,
}, { timestamps: true });

const PermissionSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    module: { type: String, required: true, enum: ['crm', 'hrms', 'erp', 'global'] },
    resource: { type: String, required: true },
    action: { type: String, required: true },
    description: { type: String, default: '' },
    isSystem: { type: Boolean, default: true },
}, { timestamps: true });

const RoleSchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, lowercase: true },
    description: { type: String, default: '' },
    module: { type: String, enum: ['crm', 'hrms', 'erp', 'global'], required: true },
    permissions: [{ type: String }],
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', default: null },
    isSystem: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    createdBy: mongoose.Schema.Types.ObjectId,
}, { timestamps: true });
RoleSchema.index({ slug: 1, organization: 1 }, { unique: true });

const UserRoleSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    grantedBy: mongoose.Schema.Types.ObjectId,
    expiresAt: { type: Date, default: null },
    branch: { type: String, default: null },
    additionalPermissions: [{ type: String }],
    revokedPermissions: [{ type: String }],
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
UserRoleSchema.index({ user: 1, role: 1, organization: 1 }, { unique: true });

// ─── Models ─────────────────────────────────────────────────────────────────

const Organization = mongoose.models.Organization || mongoose.model('Organization', OrgSchema);
const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Employee = mongoose.models.Employee || mongoose.model('Employee', EmployeeSchema);
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
const Lead = mongoose.models.Lead || mongoose.model('Lead', LeadSchema);
const Deal = mongoose.models.Deal || mongoose.model('Deal', DealSchema);
const Contact = mongoose.models.Contact || mongoose.model('Contact', ContactSchema);
const Company = mongoose.models.Company || mongoose.model('Company', CompanySchema);
const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);
const Expense = mongoose.models.Expense || mongoose.model('Expense', ExpenseSchema);
const Invoice = mongoose.models.Invoice || mongoose.model('Invoice', InvoiceSchema);
const Payroll = mongoose.models.Payroll || mongoose.model('Payroll', PayrollSchema);
const Attendance = mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema);
const Leave = mongoose.models.Leave || mongoose.model('Leave', LeaveSchema);
const Event = mongoose.models.Event || mongoose.model('Event', EventSchema);
const Task = mongoose.models.Task || mongoose.model('Task', TaskSchema);
const Notification = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
const Permission = mongoose.models.Permission || mongoose.model('Permission', PermissionSchema);
const Role = mongoose.models.Role || mongoose.model('Role', RoleSchema);
const UserRole = mongoose.models.UserRole || mongoose.model('UserRole', UserRoleSchema);

// ─── Seed Data ───────────────────────────────────────────────────────────────

async function seed() {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected!\n');

    // ── Clear existing data ──
    console.log('🗑️  Clearing existing data...');
    await Promise.all([
        Organization.deleteMany({}), User.deleteMany({}), Employee.deleteMany({}),
        Product.deleteMany({}), Lead.deleteMany({}), Deal.deleteMany({}),
        Contact.deleteMany({}), Company.deleteMany({}), Order.deleteMany({}),
        Expense.deleteMany({}), Invoice.deleteMany({}), Payroll.deleteMany({}),
        Attendance.deleteMany({}), Leave.deleteMany({}), Event.deleteMany({}),
        Task.deleteMany({}), Notification.deleteMany({}),
        Permission.deleteMany({}), Role.deleteMany({}), UserRole.deleteMany({}),
    ]);
    console.log('✅ Cleared!\n');

    const org = await Organization.create({
        name: 'Operon Technologies', slug: 'operon',
        industry: 'Software & Technology', website: 'https://operon.app',
        plan: 'pro', seats: 100,
        address: { street: '42 Innovation Park', city: 'New Delhi', state: 'Delhi', country: 'India', zip: '110001' },
        settings: { currency: 'USD', timezone: 'Asia/Kolkata' },
    });

    // ── RBAC: Permissions ────────────────────────────────────────────────
    console.log('🔐 Seeding RBAC permissions...');
    const permDefs = [
        // Global
        { key: 'dashboard.view', module: 'global', resource: 'dashboard', action: 'view', description: 'View dashboard' },
        { key: 'settings.users.view', module: 'global', resource: 'users', action: 'view', description: 'View user list' },
        { key: 'settings.users.manage', module: 'global', resource: 'users', action: 'manage', description: 'Manage users' },
        { key: 'settings.roles.view', module: 'global', resource: 'roles', action: 'view', description: 'View roles' },
        { key: 'settings.roles.manage', module: 'global', resource: 'roles', action: 'manage', description: 'Manage roles' },
        { key: 'settings.organization.view', module: 'global', resource: 'organization', action: 'view', description: 'View org settings' },
        { key: 'settings.organization.manage', module: 'global', resource: 'organization', action: 'manage', description: 'Edit org settings' },
        { key: 'settings.audit-logs.view', module: 'global', resource: 'audit-logs', action: 'view', description: 'View audit log' },
        // CRM
        { key: 'crm.leads.view', module: 'crm', resource: 'leads', action: 'view', description: 'View leads' },
        { key: 'crm.leads.create', module: 'crm', resource: 'leads', action: 'create', description: 'Create leads' },
        { key: 'crm.leads.edit', module: 'crm', resource: 'leads', action: 'edit', description: 'Edit leads' },
        { key: 'crm.leads.delete', module: 'crm', resource: 'leads', action: 'delete', description: 'Delete leads' },
        { key: 'crm.leads.assign', module: 'crm', resource: 'leads', action: 'assign', description: 'Assign leads' },
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
        { key: 'crm.deals.approve', module: 'crm', resource: 'deals', action: 'approve', description: 'Approve deals' },
        { key: 'crm.pipeline.view', module: 'crm', resource: 'pipeline', action: 'view', description: 'View pipeline' },
        { key: 'crm.pipeline.manage', module: 'crm', resource: 'pipeline', action: 'manage', description: 'Manage pipeline' },
        { key: 'crm.reports.view', module: 'crm', resource: 'reports', action: 'view', description: 'View CRM reports' },
        // HRMS
        { key: 'hrms.employees.view', module: 'hrms', resource: 'employees', action: 'view', description: 'View employees' },
        { key: 'hrms.employees.create', module: 'hrms', resource: 'employees', action: 'create', description: 'Add employees' },
        { key: 'hrms.employees.edit', module: 'hrms', resource: 'employees', action: 'edit', description: 'Edit employees' },
        { key: 'hrms.employees.delete', module: 'hrms', resource: 'employees', action: 'delete', description: 'Remove employees' },
        { key: 'hrms.departments.view', module: 'hrms', resource: 'departments', action: 'view', description: 'View departments' },
        { key: 'hrms.departments.manage', module: 'hrms', resource: 'departments', action: 'manage', description: 'Manage departments' },
        { key: 'hrms.attendance.view', module: 'hrms', resource: 'attendance', action: 'view', description: 'View attendance' },
        { key: 'hrms.attendance.manage', module: 'hrms', resource: 'attendance', action: 'manage', description: 'Manage attendance' },
        { key: 'hrms.leaves.view', module: 'hrms', resource: 'leaves', action: 'view', description: 'View leaves' },
        { key: 'hrms.leaves.apply', module: 'hrms', resource: 'leaves', action: 'apply', description: 'Apply for leave' },
        { key: 'hrms.leaves.approve', module: 'hrms', resource: 'leaves', action: 'approve', description: 'Approve leaves' },
        { key: 'hrms.payroll.view', module: 'hrms', resource: 'payroll', action: 'view', description: 'View payroll' },
        { key: 'hrms.payroll.process', module: 'hrms', resource: 'payroll', action: 'process', description: 'Process payroll' },
        { key: 'hrms.recruitment.view', module: 'hrms', resource: 'recruitment', action: 'view', description: 'View recruitment' },
        { key: 'hrms.recruitment.manage', module: 'hrms', resource: 'recruitment', action: 'manage', description: 'Manage recruitment' },
        { key: 'hrms.performance.view', module: 'hrms', resource: 'performance', action: 'view', description: 'View performance' },
        { key: 'hrms.performance.manage', module: 'hrms', resource: 'performance', action: 'manage', description: 'Manage performance' },
        // ERP
        { key: 'erp.inventory.view', module: 'erp', resource: 'inventory', action: 'view', description: 'View inventory' },
        { key: 'erp.inventory.manage', module: 'erp', resource: 'inventory', action: 'manage', description: 'Manage inventory' },
        { key: 'erp.products.view', module: 'erp', resource: 'products', action: 'view', description: 'View products' },
        { key: 'erp.products.manage', module: 'erp', resource: 'products', action: 'manage', description: 'Manage products' },
        { key: 'erp.orders.view', module: 'erp', resource: 'orders', action: 'view', description: 'View orders' },
        { key: 'erp.orders.create', module: 'erp', resource: 'orders', action: 'create', description: 'Create orders' },
        { key: 'erp.orders.process', module: 'erp', resource: 'orders', action: 'process', description: 'Process orders' },
        { key: 'erp.invoices.view', module: 'erp', resource: 'invoices', action: 'view', description: 'View invoices' },
        { key: 'erp.invoices.create', module: 'erp', resource: 'invoices', action: 'create', description: 'Create invoices' },
        { key: 'erp.invoices.approve', module: 'erp', resource: 'invoices', action: 'approve', description: 'Approve invoices' },
        { key: 'erp.vendors.view', module: 'erp', resource: 'vendors', action: 'view', description: 'View vendors' },
        { key: 'erp.vendors.manage', module: 'erp', resource: 'vendors', action: 'manage', description: 'Manage vendors' },
        { key: 'erp.purchase-orders.view', module: 'erp', resource: 'purchase-orders', action: 'view', description: 'View POs' },
        { key: 'erp.purchase-orders.create', module: 'erp', resource: 'purchase-orders', action: 'create', description: 'Create POs' },
        { key: 'erp.purchase-orders.approve', module: 'erp', resource: 'purchase-orders', action: 'approve', description: 'Approve POs' },
        { key: 'erp.expenses.view', module: 'erp', resource: 'expenses', action: 'view', description: 'View expenses' },
        { key: 'erp.expenses.approve', module: 'erp', resource: 'expenses', action: 'approve', description: 'Approve expenses' },
        { key: 'erp.budget.view', module: 'erp', resource: 'budget', action: 'view', description: 'View budget' },
        { key: 'erp.budget.manage', module: 'erp', resource: 'budget', action: 'manage', description: 'Manage budget' },
        { key: 'erp.credit-notes.view', module: 'erp', resource: 'credit-notes', action: 'view', description: 'View credit notes' },
        { key: 'erp.credit-notes.manage', module: 'erp', resource: 'credit-notes', action: 'manage', description: 'Manage credit notes' },
        { key: 'erp.finance.view', module: 'erp', resource: 'finance', action: 'view', description: 'View finance' },
        { key: 'erp.finance.report', module: 'erp', resource: 'finance', action: 'report', description: 'Finance reports' },
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
    await Permission.insertMany(permDefs);
    console.log(`   ✅ ${permDefs.length} permissions seeded`);

    // ── RBAC: Roles ──────────────────────────────────────────────────────────
    console.log('🛡️  Seeding RBAC roles...');
    const ALL_KEYS = permDefs.map(p => p.key);
    const CRM_KEYS = ALL_KEYS.filter(k => k.startsWith('crm.'));
    const HRMS_KEYS = ALL_KEYS.filter(k => k.startsWith('hrms.'));
    const ERP_KEYS = ALL_KEYS.filter(k => k.startsWith('erp.'));

    const roleDefs = [
        { slug: 'super_admin', name: 'Super Admin', description: 'Full platform control', module: 'global', permissions: ['*'], isSystem: true },
        { slug: 'org_admin', name: 'Organization Admin', description: 'Company-wide control', module: 'global', permissions: ALL_KEYS, isSystem: true },
        { slug: 'crm_admin', name: 'CRM Admin', description: 'Full CRM access', module: 'crm', permissions: [...CRM_KEYS, 'dashboard.view'], isSystem: true },
        { slug: 'sales_manager', name: 'Sales Manager', description: 'Manage leads, approve deals', module: 'crm', permissions: ['dashboard.view', 'crm.leads.view', 'crm.leads.create', 'crm.leads.edit', 'crm.leads.assign', 'crm.contacts.view', 'crm.contacts.create', 'crm.deals.view', 'crm.deals.create', 'crm.deals.edit', 'crm.deals.approve', 'crm.companies.view', 'crm.pipeline.view', 'crm.pipeline.manage', 'crm.reports.view', 'apps.tasks.view', 'apps.tasks.manage'], isSystem: true },
        { slug: 'sales_executive', name: 'Sales Executive', description: 'Own leads and deals', module: 'crm', permissions: ['dashboard.view', 'crm.leads.view', 'crm.leads.create', 'crm.leads.edit', 'crm.contacts.view', 'crm.contacts.create', 'crm.deals.view', 'crm.deals.create', 'crm.deals.edit', 'crm.companies.view', 'crm.pipeline.view', 'apps.tasks.view', 'apps.tasks.manage', 'apps.notes.view', 'apps.notes.manage'], isSystem: true },
        { slug: 'support_manager', name: 'Support Manager', description: 'Customer support management', module: 'crm', permissions: ['dashboard.view', 'crm.contacts.view', 'crm.contacts.create', 'crm.contacts.edit', 'crm.contacts.delete', 'crm.companies.view', 'crm.companies.create', 'crm.leads.view', 'apps.tasks.view', 'apps.tasks.manage'], isSystem: true },
        { slug: 'support_agent', name: 'Support Agent', description: 'View and respond to contacts', module: 'crm', permissions: ['dashboard.view', 'crm.contacts.view', 'crm.contacts.create', 'crm.companies.view', 'apps.tasks.view', 'apps.notes.view', 'apps.notes.manage'], isSystem: true },
        { slug: 'client_portal', name: 'Client Portal User', description: 'External client view', module: 'crm', permissions: ['dashboard.view', 'crm.deals.view', 'erp.invoices.view'], isSystem: true },
        { slug: 'hr_admin', name: 'HR Admin', description: 'Full HRMS access', module: 'hrms', permissions: [...HRMS_KEYS, 'dashboard.view', 'settings.users.view', 'settings.users.manage'], isSystem: true },
        { slug: 'hr_manager', name: 'HR Manager', description: 'Manage employees and payroll', module: 'hrms', permissions: ['dashboard.view', 'hrms.employees.view', 'hrms.employees.create', 'hrms.employees.edit', 'hrms.departments.view', 'hrms.departments.manage', 'hrms.attendance.view', 'hrms.attendance.manage', 'hrms.leaves.view', 'hrms.leaves.approve', 'hrms.payroll.view', 'hrms.payroll.process', 'hrms.recruitment.view', 'hrms.recruitment.manage', 'hrms.performance.view', 'hrms.performance.manage', 'apps.announcements.view'], isSystem: true },
        { slug: 'hr_executive', name: 'HR Executive', description: 'Day-to-day HR operations', module: 'hrms', permissions: ['dashboard.view', 'hrms.employees.view', 'hrms.employees.edit', 'hrms.departments.view', 'hrms.attendance.view', 'hrms.attendance.manage', 'hrms.leaves.view', 'hrms.leaves.approve', 'hrms.recruitment.view', 'hrms.performance.view'], isSystem: true },
        { slug: 'team_lead', name: 'Team Lead', description: 'Team oversight and leave approval', module: 'hrms', permissions: ['dashboard.view', 'hrms.employees.view', 'hrms.attendance.view', 'hrms.leaves.view', 'hrms.leaves.approve', 'hrms.performance.view', 'apps.tasks.view', 'apps.tasks.manage', 'apps.projects.view'], isSystem: true },
        { slug: 'employee', name: 'Employee', description: 'Basic self-service', module: 'hrms', permissions: ['dashboard.view', 'hrms.attendance.view', 'hrms.leaves.view', 'hrms.leaves.apply', 'hrms.payroll.view', 'apps.tasks.view', 'apps.tasks.manage', 'apps.notes.view', 'apps.notes.manage', 'apps.announcements.view'], isSystem: true },
        { slug: 'erp_admin', name: 'ERP Admin', description: 'Full ERP access', module: 'erp', permissions: [...ERP_KEYS, 'dashboard.view'], isSystem: true },
        { slug: 'operations_manager', name: 'Operations Manager', description: 'Orders and operations', module: 'erp', permissions: ['dashboard.view', 'erp.inventory.view', 'erp.inventory.manage', 'erp.orders.view', 'erp.orders.create', 'erp.orders.process', 'erp.products.view', 'erp.products.manage', 'erp.vendors.view', 'apps.projects.view', 'apps.tasks.view', 'apps.tasks.manage'], isSystem: true },
        { slug: 'inventory_manager', name: 'Inventory Manager', description: 'Inventory and products', module: 'erp', permissions: ['dashboard.view', 'erp.inventory.view', 'erp.inventory.manage', 'erp.products.view', 'erp.products.manage', 'erp.vendors.view', 'erp.orders.view'], isSystem: true },
        { slug: 'procurement_manager', name: 'Procurement Manager', description: 'Purchase orders and vendors', module: 'erp', permissions: ['dashboard.view', 'erp.purchase-orders.view', 'erp.purchase-orders.create', 'erp.purchase-orders.approve', 'erp.vendors.view', 'erp.vendors.manage', 'erp.expenses.view', 'erp.expenses.approve', 'erp.inventory.view'], isSystem: true },
        { slug: 'finance_manager', name: 'Finance Manager', description: 'Invoices, budgets, finance', module: 'erp', permissions: ['dashboard.view', 'erp.invoices.view', 'erp.invoices.create', 'erp.invoices.approve', 'erp.credit-notes.view', 'erp.credit-notes.manage', 'erp.budget.view', 'erp.budget.manage', 'erp.expenses.view', 'erp.expenses.approve', 'erp.finance.view', 'erp.finance.report', 'settings.audit-logs.view'], isSystem: true },
        { slug: 'vendor_portal', name: 'Vendor Portal User', description: 'External vendor view', module: 'erp', permissions: ['dashboard.view', 'erp.orders.view', 'erp.invoices.view', 'erp.purchase-orders.view'], isSystem: true },
    ];

    const seededRoles = await Role.insertMany(roleDefs.map(r => ({ ...r, organization: null, createdBy: null })));
    console.log(`   ✅ ${seededRoles.length} roles seeded`);

    const getRoleId = (slug) => seededRoles.find(r => r.slug === slug)._id;

    // ── Demo Users ──
    console.log('👤 Creating demo users...');
    const demoUsers = [
        { name: 'Super Admin', email: process.env.SUPER_ADMIN_EMAIL, pass: process.env.SUPER_ADMIN_PASS, role: 'super_admin', slug: 'super_admin' },
        { name: 'Organization Admin', email: process.env.ORG_ADMIN_EMAIL, pass: process.env.ORG_ADMIN_PASS, role: 'org_admin', slug: 'org_admin' },
        { name: 'CRM Admin', email: process.env.CRM_ADMIN_EMAIL, pass: process.env.CRM_ADMIN_PASS, role: 'crm_admin', slug: 'crm_admin' },
        { name: 'Sales Manager', email: process.env.SALES_MANAGER_EMAIL, pass: process.env.SALES_MANAGER_PASS, role: 'sales_manager', slug: 'sales_manager' },
        { name: 'Sales Executive', email: process.env.SALES_EXECUTIVE_EMAIL, pass: process.env.SALES_EXECUTIVE_PASS, role: 'sales_executive', slug: 'sales_executive' },
        { name: 'Support Manager', email: process.env.SUPPORT_MANAGER_EMAIL, pass: process.env.SUPPORT_MANAGER_PASS, role: 'support_manager', slug: 'support_manager' },
        { name: 'Support Agent', email: process.env.SUPPORT_AGENT_EMAIL, pass: process.env.SUPPORT_AGENT_PASS, role: 'support_agent', slug: 'support_agent' },
        { name: 'Client Portal', email: process.env.CLIENT_PORTAL_EMAIL, pass: process.env.CLIENT_PORTAL_PASS, role: 'client_portal', slug: 'client_portal' },
        { name: 'HR Admin', email: process.env.HR_ADMIN_EMAIL, pass: process.env.HR_ADMIN_PASS, role: 'hr_admin', slug: 'hr_admin' },
        { name: 'HR Manager', email: process.env.HR_MANAGER_EMAIL, pass: process.env.HR_MANAGER_PASS, role: 'hr_manager', slug: 'hr_manager' },
        { name: 'HR Executive', email: process.env.HR_EXECUTIVE_EMAIL, pass: process.env.HR_EXECUTIVE_PASS, role: 'hr_executive', slug: 'hr_executive' },
        { name: 'Team Lead', email: process.env.TEAM_LEAD_EMAIL, pass: process.env.TEAM_LEAD_PASS, role: 'team_lead', slug: 'team_lead' },
        { name: 'Regular Employee', email: process.env.EMPLOYEE_EMAIL, pass: process.env.EMPLOYEE_PASS, role: 'employee', slug: 'employee' },
        { name: 'ERP Admin', email: process.env.ERP_ADMIN_EMAIL, pass: process.env.ERP_ADMIN_PASS, role: 'erp_admin', slug: 'erp_admin' },
        { name: 'Operations Manager', email: process.env.OPERATIONS_MANAGER_EMAIL, pass: process.env.OPERATIONS_MANAGER_PASS, role: 'operations_manager', slug: 'operations_manager' },
        { name: 'Inventory Manager', email: process.env.INVENTORY_MANAGER_EMAIL, pass: process.env.INVENTORY_MANAGER_PASS, role: 'inventory_manager', slug: 'inventory_manager' },
        { name: 'Procurement Manager', email: process.env.PROCUREMENT_MANAGER_EMAIL, pass: process.env.PROCUREMENT_MANAGER_PASS, role: 'procurement_manager', slug: 'procurement_manager' },
        { name: 'Finance Manager', email: process.env.FINANCE_MANAGER_EMAIL, pass: process.env.FINANCE_MANAGER_PASS, role: 'finance_manager', slug: 'finance_manager' },
        { name: 'Vendor Portal', email: process.env.VENDOR_PORTAL_EMAIL, pass: process.env.VENDOR_PORTAL_PASS, role: 'vendor_portal', slug: 'vendor_portal' },
    ];

    let adminUser, managerUser;
    for (const u of demoUsers) {
        if (!u.email || !u.pass) continue;
        const hashedPassword = await bcrypt.hash(u.pass, 12);
        const user = await User.create({
            name: u.name,
            email: u.email,
            password: hashedPassword,
            role: u.role,
            organization: org._id,
            isActive: true,
            avatar: `https://i.pravatar.cc/150?u=${u.email}`,
        });

        if (u.slug === 'org_admin') adminUser = user;
        if (u.slug === 'operations_manager') managerUser = user;

        // Assign RBAC Role
        await UserRole.create({
            user: user._id,
            role: getRoleId(u.slug),
            organization: org._id,
            grantedBy: null,
            isActive: true
        });
    }
    console.log(`   ✅ ${demoUsers.filter(u => u.email).length} demo users created with RBAC roles`);

    // ── Employees ──
    console.log('👥 Creating employees...');
    const employeeData = [
        { name: 'Rahul Verma', email: 'rahul@operon.app', department: 'Engineering', position: 'Frontend Developer', salary: 85000, skills: ['React', 'TypeScript', 'CSS'] },
        { name: 'Sneha Patel', email: 'sneha@operon.app', department: 'Engineering', position: 'Backend Developer', salary: 90000, skills: ['Node.js', 'MongoDB', 'AWS'] },
        { name: 'Arjun Mehta', email: 'arjun@operon.app', department: 'Sales', position: 'Sales Executive', salary: 70000, skills: ['CRM', 'Negotiation', 'Cold Calling'] },
        { name: 'Nisha Gupta', email: 'nisha@operon.app', department: 'HR', position: 'HR Manager', salary: 75000, skills: ['Recruitment', 'Payroll', 'Performance Review'] },
        { name: 'Vikram Singh', email: 'vikram@operon.app', department: 'Finance', position: 'Finance Analyst', salary: 80000, skills: ['Excel', 'QuickBooks', 'Financial Modeling'] },
        { name: 'Anjali Desai', email: 'anjali@operon.app', department: 'Marketing', position: 'Marketing Lead', salary: 72000, skills: ['SEO', 'Content Strategy', 'Google Ads'] },
        { name: 'Rohan Kapoor', email: 'rohan@operon.app', department: 'Engineering', position: 'DevOps Engineer', salary: 95000, skills: ['Docker', 'Kubernetes', 'CI/CD'] },
        { name: 'Divya Nair', email: 'divya@operon.app', department: 'Design', position: 'UI/UX Designer', salary: 78000, skills: ['Figma', 'Prototyping', 'User Research'] },
        { name: 'Karan Joshi', email: 'karan@operon.app', department: 'Sales', position: 'Account Manager', salary: 68000, skills: ['Client Relations', 'Salesforce', 'Upselling'] },
        { name: 'Meera Iyer', email: 'meera@operon.app', department: 'Finance', position: 'Accountant', salary: 65000, skills: ['Tally', 'GST', 'Bookkeeping'] },
    ];

    const employees = [];
    for (let i = 0; i < employeeData.length; i++) {
        const emp = employeeData[i];
        const e = await Employee.create({
            employeeId: `EMP-${1001 + i}`, ...emp,
            phone: `+91 98${String(10000000 + i * 1111).slice(1)}`,
            avatar: `https://i.pravatar.cc/150?u=${emp.email}`,
            employmentType: 'full_time', status: i < 8 ? 'active' : 'on_leave',
            hireDate: new Date(2022 + Math.floor(i / 4), i % 12, 1 + (i * 3)),
            organization: org._id,
        });
        employees.push(e);
    }

    // ── Products ──
    console.log('📦 Creating products...');
    const productData = [
        { name: 'Operon ERP Suite', sku: 'OPS-ERP-001', category: 'Software', price: 4999, cost: 500, stock: 999, unit: 'license' },
        { name: 'HRMS Pro Module', sku: 'OPS-HRMS-001', category: 'Software', price: 1999, cost: 200, stock: 999, unit: 'license' },
        { name: 'CRM Starter Pack', sku: 'OPS-CRM-001', category: 'Software', price: 999, cost: 100, stock: 999, unit: 'license' },
        { name: 'Analytics Dashboard', sku: 'OPS-ANL-001', category: 'Software', price: 1499, cost: 150, stock: 999, unit: 'license' },
        { name: 'Cloud Server 8GB', sku: 'INFRA-SRV-001', category: 'Infrastructure', price: 299, cost: 80, stock: 45, unit: 'month' },
        { name: 'SSL Certificate', sku: 'SEC-SSL-001', category: 'Security', price: 149, cost: 30, stock: 200, unit: 'year' },
        { name: 'Office Chair Ergonomic', sku: 'FURN-CHR-001', category: 'Furniture', price: 449, cost: 180, stock: 12, unit: 'piece' },
        { name: 'MacBook Pro M3', sku: 'TECH-LAP-001', category: 'Hardware', price: 2499, cost: 1800, stock: 8, unit: 'piece' },
    ];
    const products = await Product.insertMany(productData.map(p => ({ ...p, status: 'active', organization: org._id, createdBy: adminUser._id })));

    // ── Companies ──
    console.log('🏭 Creating companies...');
    const companies = await Company.insertMany([
        { name: 'Artemis Corp', website: 'artemis.com', industry: 'Aerospace', size: '501-1000', phone: '+1 555-0101', address: { city: 'San Francisco', country: 'USA' }, owner: adminUser._id, organization: org._id },
        { name: 'Helios Industrial', website: 'helios.io', industry: 'Manufacturing', size: '1001-5000', phone: '+1 555-0102', address: { city: 'Detroit', country: 'USA' }, owner: adminUser._id, organization: org._id },
        { name: 'Nova Systems', website: 'novasys.com', industry: 'IT Services', size: '51-200', phone: '+44 20 7946 0100', address: { city: 'London', country: 'UK' }, owner: managerUser._id, organization: org._id },
        { name: 'Zenith Tech', website: 'zenithtech.in', industry: 'Software', size: '11-50', phone: '+91 22 6789 1234', address: { city: 'Mumbai', country: 'India' }, owner: adminUser._id, organization: org._id },
        { name: 'Pacific Solutions', website: 'pacificsol.sg', industry: 'Consulting', size: '201-500', phone: '+65 6789 1234', address: { city: 'Singapore', country: 'Singapore' }, owner: managerUser._id, organization: org._id },
    ]);

    // ── Contacts ──
    console.log('📇 Creating contacts...');
    const contacts = await Contact.insertMany([
        { name: 'James Wilson', email: 'james@artemis.com', phone: '+1 555-0201', company: 'Artemis Corp', position: 'CTO', status: 'active', owner: adminUser._id, organization: org._id, address: { city: 'San Francisco', country: 'USA' } },
        { name: 'Sarah Chen', email: 'sarah@helios.io', phone: '+1 555-0202', company: 'Helios Industrial', position: 'Procurement Head', status: 'active', owner: adminUser._id, organization: org._id, address: { city: 'Detroit', country: 'USA' } },
        { name: 'Oliver Smith', email: 'oliver@novasys.com', phone: '+44 7700 900001', company: 'Nova Systems', position: 'CEO', status: 'active', owner: managerUser._id, organization: org._id, address: { city: 'London', country: 'UK' } },
        { name: 'Aisha Khan', email: 'aisha@zenithtech.in', phone: '+91 98765 11111', company: 'Zenith Tech', position: 'Product Manager', status: 'active', owner: adminUser._id, organization: org._id, address: { city: 'Mumbai', country: 'India' } },
        { name: 'Liam Park', email: 'liam@pacificsol.sg', phone: '+65 9123 4567', company: 'Pacific Solutions', position: 'Director', status: 'inactive', owner: managerUser._id, organization: org._id, address: { city: 'Singapore', country: 'Singapore' } },
    ]);

    // ── Leads ──
    console.log('🎯 Creating leads...');
    const leads = await Lead.insertMany([
        { name: 'Carlos Mendez', email: 'carlos@startup.mx', phone: '+52 55 1234 5678', company: 'StartupMX', position: 'Co-Founder', source: 'website', status: 'new', score: 72, value: 15000, industry: 'E-Commerce', owner: adminUser._id, organization: org._id, nextFollowUp: new Date(Date.now() + 3 * 86400000) },
        { name: 'Fatima Al-Hassan', email: 'fatima@techco.ae', phone: '+971 50 123 4567', company: 'TechCo AE', position: 'IT Director', source: 'linkedin', status: 'contacted', score: 85, value: 42000, industry: 'Technology', owner: adminUser._id, organization: org._id, nextFollowUp: new Date(Date.now() + 1 * 86400000) },
        { name: 'Chen Wei', email: 'chenwei@biz.cn', phone: '+86 138 0000 1234', company: 'BizChina', position: 'CEO', source: 'referral', status: 'qualified', score: 91, value: 78000, industry: 'Manufacturing', owner: managerUser._id, organization: org._id },
        { name: 'Priya Reddy', email: 'priya@fintech.in', phone: '+91 98765 22222', company: 'FinTech India', position: 'Product Lead', source: 'email', status: 'proposal', score: 78, value: 28000, industry: 'Finance', owner: adminUser._id, organization: org._id },
        { name: 'Hans Mueller', email: 'hans@enterprise.de', phone: '+49 30 12345678', company: 'Enterprise DE', position: 'CIO', source: 'event', status: 'negotiation', score: 94, value: 120000, industry: 'Automotive', owner: managerUser._id, organization: org._id },
        { name: 'Maria Garcia', email: 'maria@shop.es', phone: '+34 91 123 4567', company: 'ShopES', position: 'CMO', source: 'cold_call', status: 'won', score: 88, value: 35000, industry: 'Retail', owner: adminUser._id, organization: org._id, convertedAt: new Date() },
        { name: 'Yuki Tanaka', email: 'yuki@corp.jp', phone: '+81 3 1234 5678', company: 'CorpJP', position: 'VP Operations', source: 'referral', status: 'lost', score: 45, value: 50000, industry: 'Logistics', owner: adminUser._id, organization: org._id },
        { name: 'Emma Johnson', email: 'emma@agency.co.uk', phone: '+44 20 7946 0200', company: 'AgencyUK', position: 'Director', source: 'website', status: 'contacted', score: 67, value: 22000, industry: 'Media', owner: managerUser._id, organization: org._id },
    ]);

    // ── Deals ──
    console.log('💼 Creating deals...');
    await Deal.insertMany([
        { title: 'Artemis ERP Implementation', value: 184000, stage: 'proposal', probability: 60, contact: contacts[0]._id, company: companies[0]._id, owner: adminUser._id, organization: org._id, expectedCloseDate: new Date(Date.now() + 30 * 86400000), notes: 'Enterprise ERP deal — in proposal stage' },
        { title: 'Helios HRMS License', value: 142000, stage: 'negotiation', probability: 75, contact: contacts[1]._id, company: companies[1]._id, owner: adminUser._id, organization: org._id, expectedCloseDate: new Date(Date.now() + 14 * 86400000) },
        { title: 'Nova Analytics Package', value: 98000, stage: 'closed_won', probability: 100, contact: contacts[2]._id, company: companies[2]._id, owner: managerUser._id, organization: org._id, expectedCloseDate: new Date() },
        { title: 'Zenith CRM Starter', value: 28000, stage: 'qualification', probability: 40, contact: contacts[3]._id, company: companies[3]._id, owner: adminUser._id, organization: org._id, expectedCloseDate: new Date(Date.now() + 45 * 86400000) },
        { title: 'Pacific Cloud Infrastructure', value: 55000, stage: 'closed_lost', probability: 0, contact: contacts[4]._id, company: companies[4]._id, owner: managerUser._id, organization: org._id, expectedCloseDate: new Date(Date.now() - 7 * 86400000) },
    ]);

    // ── Orders ──
    console.log('🛒 Creating orders...');
    const orderData = [
        { status: 'delivered', paymentStatus: 'paid', total: 4999, subtotal: 4499, tax: 500, items: [{ name: 'Operon ERP Suite', quantity: 1, price: 4499, total: 4499 }] },
        { status: 'delivered', paymentStatus: 'paid', total: 3998, subtotal: 3598, tax: 400, items: [{ name: 'HRMS Pro Module', quantity: 2, price: 1799, total: 3598 }] },
        { status: 'shipped', paymentStatus: 'paid', total: 2499, subtotal: 2249, tax: 250, items: [{ name: 'MacBook Pro M3', quantity: 1, price: 2249, total: 2249 }] },
        { status: 'processing', paymentStatus: 'unpaid', total: 1499, subtotal: 1349, tax: 150, items: [{ name: 'Analytics Dashboard', quantity: 1, price: 1349, total: 1349 }] },
        { status: 'delivered', paymentStatus: 'paid', total: 8996, subtotal: 8096, tax: 900, items: [{ name: 'CRM Starter Pack', quantity: 4, price: 999, total: 3996 }, { name: 'Cloud Server 8GB', quantity: 4, price: 299, total: 1196 }] },
        { status: 'pending', paymentStatus: 'unpaid', total: 598, subtotal: 538, tax: 60, items: [{ name: 'SSL Certificate', quantity: 4, price: 134, total: 536 }] },
        { status: 'delivered', paymentStatus: 'paid', total: 1347, subtotal: 1212, tax: 135, items: [{ name: 'Office Chair Ergonomic', quantity: 3, price: 404, total: 1212 }] },
        { status: 'delivered', paymentStatus: 'paid', total: 5999, subtotal: 5399, tax: 600, items: [{ name: 'Operon ERP Suite', quantity: 1, price: 4499, total: 4499 }, { name: 'HRMS Pro Module', quantity: 1, price: 900, total: 900 }] },
    ];
    await Order.insertMany(orderData.map((o, i) => ({
        ...o, orderNumber: `ORD-2024-${String(1001 + i).padStart(5, '0')}`,
        customer: contacts[i % contacts.length]._id,
        organization: org._id, createdBy: adminUser._id,
        type: 'sale',
    })));

    // ── Expenses ──
    console.log('💳 Creating expenses...');
    await Expense.insertMany([
        { title: 'AWS Cloud Services', amount: 2340, category: 'Infrastructure', status: 'approved', date: new Date(Date.now() - 5 * 86400000), description: 'Monthly cloud hosting bill — March 2024', submittedBy: adminUser._id, organization: org._id },
        { title: 'Team Lunch & Outing', amount: 485, category: 'Meals', status: 'approved', date: new Date(Date.now() - 2 * 86400000), description: 'Team lunch for project completion celebration', submittedBy: managerUser._id, organization: org._id },
        { title: 'Flight Tickets — Delhi to Mumbai', amount: 12800, category: 'Travel', status: 'pending', date: new Date(), description: 'Business travel for client meeting', submittedBy: adminUser._id, organization: org._id },
        { title: 'Office Supplies', amount: 340, category: 'Office', status: 'approved', date: new Date(Date.now() - 10 * 86400000), description: 'Stationery and printer ink', submittedBy: managerUser._id, organization: org._id },
        { title: 'Software Subscriptions', amount: 1200, category: 'Software', status: 'approved', date: new Date(Date.now() - 7 * 86400000), description: 'Figma, Notion, Linear subscriptions', submittedBy: adminUser._id, organization: org._id },
    ]);

    // ── Invoices ──
    console.log('🧾 Creating invoices...');
    await Invoice.insertMany([
        { invoiceNumber: 'INV-2024-001', customer: contacts[0]._id, items: [{ description: 'ERP Setup Fee', quantity: 1, price: 50000, total: 50000 }], subtotal: 50000, tax: 9000, total: 59000, status: 'paid', issueDate: new Date(Date.now() - 30 * 86400000), dueDate: new Date(Date.now() - 15 * 86400000), organization: org._id, createdBy: adminUser._id },
        { invoiceNumber: 'INV-2024-002', customer: contacts[1]._id, items: [{ description: 'HRMS Annual License', quantity: 1, price: 24000, total: 24000 }], subtotal: 24000, tax: 4320, total: 28320, status: 'sent', issueDate: new Date(Date.now() - 10 * 86400000), dueDate: new Date(Date.now() + 20 * 86400000), organization: org._id, createdBy: adminUser._id },
        { invoiceNumber: 'INV-2024-003', customer: contacts[2]._id, items: [{ description: 'Analytics Package Setup', quantity: 1, price: 15000, total: 15000 }, { description: 'Training Sessions', quantity: 5, price: 1000, total: 5000 }], subtotal: 20000, tax: 3600, total: 23600, status: 'overdue', issueDate: new Date(Date.now() - 45 * 86400000), dueDate: new Date(Date.now() - 15 * 86400000), organization: org._id, createdBy: managerUser._id },
        { invoiceNumber: 'INV-2024-004', customer: contacts[3]._id, items: [{ description: 'CRM Starter Pack', quantity: 3, price: 999, total: 2997 }], subtotal: 2997, tax: 540, total: 3537, status: 'draft', issueDate: new Date(), dueDate: new Date(Date.now() + 30 * 86400000), organization: org._id, createdBy: adminUser._id },
    ]);

    // ── Payroll ──
    console.log('💰 Creating payroll records...');
    const period = 'March 2024';
    await Payroll.insertMany(employees.slice(0, 5).map(emp => ({
        employee: emp._id, period,
        baseSalary: emp.salary,
        allowances: Math.round(emp.salary * 0.15),
        deductions: Math.round(emp.salary * 0.12),
        netPay: Math.round(emp.salary + emp.salary * 0.15 - emp.salary * 0.12),
        status: 'paid', payDate: new Date(Date.now() - 5 * 86400000),
        organization: org._id,
    })));

    // ── Attendance ──
    console.log('📋 Creating attendance records...');
    const today = new Date();
    await Attendance.insertMany(employees.map((emp, i) => ({
        employee: emp._id, date: today,
        checkIn: `0${8 + (i % 2)}:${i % 2 === 0 ? '00' : '30'} AM`,
        checkOut: i < 7 ? '06:00 PM' : null,
        status: i < 7 ? 'present' : i === 7 ? 'late' : 'absent',
        hours: i < 7 ? 9 : i === 7 ? 7 : 0,
        organization: org._id,
    })));

    // ── Leaves ──
    console.log('🏖️  Creating leave requests...');
    await Leave.insertMany([
        { employee: employees[0]._id, type: 'sick', startDate: new Date(Date.now() + 2 * 86400000), endDate: new Date(Date.now() + 4 * 86400000), days: 3, reason: 'Medical appointment and recovery', status: 'pending', organization: org._id },
        { employee: employees[2]._id, type: 'annual', startDate: new Date(Date.now() + 10 * 86400000), endDate: new Date(Date.now() + 16 * 86400000), days: 7, reason: 'Family vacation', status: 'approved', approvedBy: adminUser._id, organization: org._id },
        { employee: employees[5]._id, type: 'personal', startDate: new Date(Date.now() - 1 * 86400000), endDate: new Date(Date.now() - 1 * 86400000), days: 1, reason: 'Personal work', status: 'approved', approvedBy: managerUser._id, organization: org._id },
    ]);

    // ── Events (Calendar) ──
    console.log('📅 Creating calendar events...');
    await Event.insertMany([
        { title: 'Q1 Business Review', description: 'Quarterly business performance review with all department heads', startDate: new Date(Date.now() + 2 * 86400000), startTime: '10:00 AM', type: 'meeting', location: 'Conference Room A', color: 'bg-indigo-500', shadow: 'shadow-indigo-500/20', organization: org._id, createdBy: adminUser._id },
        { title: 'Product Launch — ERP v2.0', description: 'Launch event for the new ERP version', startDate: new Date(Date.now() + 7 * 86400000), startTime: '02:00 PM', type: 'launch', location: 'Main Hall', color: 'bg-[var(--primary-500)]', shadow: 'shadow-purple-500/20', organization: org._id, createdBy: adminUser._id },
        { title: 'Team Building Activity', description: 'Annual team outing to Okhla Bird Sanctuary', startDate: new Date(Date.now() + 14 * 86400000), startTime: '09:00 AM', type: 'social', location: 'New Delhi', color: 'bg-emerald-500', shadow: 'shadow-emerald-500/20', organization: org._id, createdBy: managerUser._id },
        { title: 'Investor Presentation', description: 'Series A funding pitch to investors', startDate: new Date(Date.now() + 5 * 86400000), startTime: '11:00 AM', type: 'meeting', location: 'Virtual — Google Meet', color: 'bg-amber-500', shadow: 'shadow-amber-500/20', organization: org._id, createdBy: adminUser._id },
        { title: 'Annual Employee Appraisal', description: 'Performance review and salary revision discussions', startDate: new Date(Date.now() + 20 * 86400000), startTime: '10:00 AM', type: 'hr', location: 'HR Office', color: 'bg-rose-500', shadow: 'shadow-rose-500/20', organization: org._id, createdBy: managerUser._id },
        { title: 'Company Anniversary Celebration', description: 'Operon completes 3 years! All-hands celebration party.', startDate: new Date(Date.now() + 30 * 86400000), startTime: '06:00 PM', type: 'social', location: 'Terrace Lounge, HQ', color: 'bg-pink-500', shadow: 'shadow-pink-500/20', organization: org._id, createdBy: adminUser._id },
    ]);

    // ── Tasks (Kanban) ──
    console.log('✅ Creating tasks...');
    await Task.insertMany([
        { title: 'Set up CI/CD pipeline for production deployment', status: 'todo', priority: 'high', module: 'devops', dueDate: new Date(Date.now() + 7 * 86400000), assignee: employees[6]._id, createdBy: adminUser._id, organization: org._id },
        { title: 'Design new onboarding flow for mobile app', status: 'todo', priority: 'medium', module: 'design', dueDate: new Date(Date.now() + 10 * 86400000), assignee: employees[7]._id, createdBy: adminUser._id, organization: org._id },
        { title: 'Fix login page responsive layout bug', status: 'in_progress', priority: 'urgent', module: 'frontend', dueDate: new Date(Date.now() + 1 * 86400000), assignee: employees[0]._id, createdBy: adminUser._id, organization: org._id },
        { title: 'Integrate Razorpay payment gateway', status: 'in_progress', priority: 'high', module: 'backend', dueDate: new Date(Date.now() + 3 * 86400000), assignee: employees[1]._id, createdBy: adminUser._id, organization: org._id },
        { title: 'Write API documentation for public endpoints', status: 'in_progress', priority: 'medium', module: 'backend', dueDate: new Date(Date.now() + 5 * 86400000), assignee: employees[1]._id, createdBy: managerUser._id, organization: org._id },
        { title: 'Review Q1 sales performance report', status: 'review', priority: 'high', module: 'sales', dueDate: new Date(Date.now() + 2 * 86400000), assignee: employees[2]._id, createdBy: managerUser._id, organization: org._id },
        { title: 'Finalize employee handbook for 2024', status: 'review', priority: 'medium', module: 'hr', dueDate: new Date(Date.now() + 4 * 86400000), assignee: employees[3]._id, createdBy: adminUser._id, organization: org._id },
        { title: 'Migrate database to MongoDB Atlas M10', status: 'done', priority: 'high', module: 'devops', dueDate: new Date(Date.now() - 3 * 86400000), assignee: employees[6]._id, createdBy: adminUser._id, organization: org._id },
        { title: 'Launch LinkedIn marketing campaign for Q2', status: 'done', priority: 'medium', module: 'marketing', dueDate: new Date(Date.now() - 1 * 86400000), assignee: employees[5]._id, createdBy: managerUser._id, organization: org._id },
    ]);

    // ── Notifications ──
    console.log('🔔 Creating notifications...');
    await Notification.insertMany([
        { title: 'New Lead Added', message: 'Carlos Mendez from StartupMX has been added as a new lead.', type: 'info', priority: 'low', read: false, user: adminUser._id, organization: org._id },
        { title: 'Invoice Overdue', message: 'Invoice INV-2024-003 for Nova Systems is now overdue by 15 days.', type: 'warning', priority: 'high', read: false, user: adminUser._id, organization: org._id },
        { title: 'Deal Won 🎉', message: 'Nova Analytics Package deal has been marked as Won! Value: $98,000.', type: 'success', priority: 'high', read: true, user: managerUser._id, organization: org._id },
        { title: 'Leave Request Pending', message: 'Rahul Verma has submitted a sick leave request for Mar 3-5.', type: 'info', priority: 'medium', read: false, user: adminUser._id, organization: org._id },
        { title: 'Payroll Processed', message: 'March 2024 payroll for 5 employees has been processed successfully.', type: 'success', priority: 'medium', read: true, user: adminUser._id, organization: org._id },
    ]);

    // ── RBAC: Permissions ────────────────────────────────────────────────
    // (Already seeded above in the first pass)
    console.log(`   ✅ ${permDefs.length} permissions verified`);

    // ── RBAC: Roles ──────────────────────────────────────────────────────────
    // (Wait, the duplicate block is actually further down, let's remove it)
    console.log('\n🎉 Seed complete! Summary:');
    console.log(`   Organization: Operon Technologies (operon.app)`);
    console.log(`   Demo Users:   19 (One for each RBAC System Role)`);
    console.log(`   Employees:    ${employees.length}`);
    console.log(`   Products:     ${products.length}`);
    console.log(`   Leads:        8`);
    console.log(`   Deals:        5`);
    console.log(`   Orders:       8`);
    console.log(`   Events:       6`);
    console.log(`   Tasks:        9`);
    console.log(`   Permissions:  ${permDefs.length}`);
    console.log(`   Roles:        ${seededRoles.length}`);
    console.log(`\n✅ Access USERS.md for all credentials.`);
    console.log(`✅ Login at http://localhost:3000/login\n`);

    await mongoose.disconnect();
    process.exit(0);
}

seed().catch(err => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});
