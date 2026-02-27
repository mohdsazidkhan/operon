/**
 * Operon Seed Script
 * Run: node scripts/seed.js
 * Inserts realistic demo data into MongoDB
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
    ]);
    console.log('✅ Cleared!\n');

    // ── Organization ──
    console.log('🏢 Creating organization...');
    const org = await Organization.create({
        name: 'Operon Technologies', slug: 'operon',
        industry: 'Software & Technology', website: 'https://operon.io',
        plan: 'pro', seats: 50,
        address: { street: '42 Innovation Park', city: 'New Delhi', state: 'Delhi', country: 'India', zip: '110001' },
        settings: { currency: 'USD', timezone: 'Asia/Kolkata' },
    });

    // ── Admin User ──
    console.log('👤 Creating admin user...');
    const hashedPassword = await bcrypt.hash('Admin@123', 12);
    const adminUser = await User.create({
        name: 'Mohd Sazid Khan', email: 'admin@operon.io', password: hashedPassword,
        role: 'admin', organization: org._id,
        department: 'Engineering', position: 'System Architect & Founder',
        avatar: 'https://i.pravatar.cc/150?u=admin',
        phone: '+91 98765 43210',
    });

    const managerUser = await User.create({
        name: 'Priya Sharma', email: 'priya@operon.io', password: hashedPassword,
        role: 'manager', organization: org._id,
        department: 'Operations', position: 'Operations Manager',
        avatar: 'https://i.pravatar.cc/150?u=priya',
    });

    // ── Employees ──
    console.log('👥 Creating employees...');
    const employeeData = [
        { name: 'Rahul Verma', email: 'rahul@operon.io', department: 'Engineering', position: 'Frontend Developer', salary: 85000, skills: ['React', 'TypeScript', 'CSS'] },
        { name: 'Sneha Patel', email: 'sneha@operon.io', department: 'Engineering', position: 'Backend Developer', salary: 90000, skills: ['Node.js', 'MongoDB', 'AWS'] },
        { name: 'Arjun Mehta', email: 'arjun@operon.io', department: 'Sales', position: 'Sales Executive', salary: 70000, skills: ['CRM', 'Negotiation', 'Cold Calling'] },
        { name: 'Nisha Gupta', email: 'nisha@operon.io', department: 'HR', position: 'HR Manager', salary: 75000, skills: ['Recruitment', 'Payroll', 'Performance Review'] },
        { name: 'Vikram Singh', email: 'vikram@operon.io', department: 'Finance', position: 'Finance Analyst', salary: 80000, skills: ['Excel', 'QuickBooks', 'Financial Modeling'] },
        { name: 'Anjali Desai', email: 'anjali@operon.io', department: 'Marketing', position: 'Marketing Lead', salary: 72000, skills: ['SEO', 'Content Strategy', 'Google Ads'] },
        { name: 'Rohan Kapoor', email: 'rohan@operon.io', department: 'Engineering', position: 'DevOps Engineer', salary: 95000, skills: ['Docker', 'Kubernetes', 'CI/CD'] },
        { name: 'Divya Nair', email: 'divya@operon.io', department: 'Design', position: 'UI/UX Designer', salary: 78000, skills: ['Figma', 'Prototyping', 'User Research'] },
        { name: 'Karan Joshi', email: 'karan@operon.io', department: 'Sales', position: 'Account Manager', salary: 68000, skills: ['Client Relations', 'Salesforce', 'Upselling'] },
        { name: 'Meera Iyer', email: 'meera@operon.io', department: 'Finance', position: 'Accountant', salary: 65000, skills: ['Tally', 'GST', 'Bookkeeping'] },
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

    console.log('\n🎉 Seed complete! Summary:');
    console.log(`   Organization: Operon Technologies`);
    console.log(`   Admin Email:  admin@operon.io`);
    console.log(`   Password:     Admin@123`);
    console.log(`   Employees:    ${employees.length}`);
    console.log(`   Products:     ${products.length}`);
    console.log(`   Leads:        8`);
    console.log(`   Deals:        5`);
    console.log(`   Orders:       8`);
    console.log(`   Events:       6`);
    console.log(`   Tasks:        9`);
    console.log(`\n✅ You can log in at http://localhost:3000/login\n`);

    await mongoose.disconnect();
    process.exit(0);
}

seed().catch(err => {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
});
