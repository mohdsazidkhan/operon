import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import Employee from '@/models/Employee';
import Lead from '@/models/Lead';
import Order from '@/models/Order';
import Task from '@/models/Task';
import Contact from '@/models/Contact';
import Deal from '@/models/Deal';

export async function getDashboardStats() {
    await dbConnect();
    const [products, employees, leads, orders] = await Promise.all([
        Product.countDocuments(),
        Employee.countDocuments(),
        Lead.countDocuments(),
        Order.countDocuments()
    ]);

    const totalRevenue = await Order.aggregate([
        { $match: { type: 'sale', status: 'delivered' } },
        { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    return {
        products,
        employees,
        leads,
        orders,
        revenue: totalRevenue[0]?.total || 0
    };
}

export async function getProducts(query = {}) {
    await dbConnect();
    const filter = {};
    if (query.search) {
        filter.$or = [
            { name: { $regex: query.search, $options: 'i' } },
            { sku: { $regex: query.search, $options: 'i' } }
        ];
    }
    return Product.find(filter).sort({ createdAt: -1 }).lean();
}

export async function getEmployees() {
    await dbConnect();
    return Employee.find({}).sort({ name: 1 }).lean();
}

export async function getLeads() {
    await dbConnect();
    return Lead.find({}).sort({ createdAt: -1 }).lean();
}

export async function getOrders() {
    await dbConnect();
    return Order.find({}).sort({ orderDate: -1 }).lean();
}

export async function getContacts() {
    await dbConnect();
    return Contact.find({}).sort({ name: 1 }).lean();
}

export async function getTasks() {
    await dbConnect();
    return Task.find({}).sort({ dueDate: 1 }).lean();
}

export async function getSalesStats() {
    await dbConnect();
    const deals = await Deal.find({}).lean();

    const pipelineValue = deals.reduce((sum, d) => sum + (d.value || 0), 0);
    const wonDeals = deals.filter(d => d.stage === 'closed_won');
    const wonValue = wonDeals.reduce((sum, d) => sum + (d.value || 0), 0);
    const activeDeals = deals.filter(d => !['closed_won', 'closed_lost'].includes(d.stage)).length;
    const avgDealSize = deals.length ? pipelineValue / deals.length : 0;

    const pipelineData = [
        deals.filter(d => d.stage === 'prospecting').reduce((s, d) => s + d.value, 0),
        deals.filter(d => d.stage === 'qualification').reduce((s, d) => s + d.value, 0),
        deals.filter(d => d.stage === 'proposal').reduce((s, d) => s + d.value, 0),
        deals.filter(d => d.stage === 'negotiation').reduce((s, d) => s + d.value, 0),
        wonValue,
        deals.filter(d => d.stage === 'closed_lost').reduce((s, d) => s + d.value, 0),
    ];

    return {
        pipelineValue,
        wonValue,
        activeDeals,
        avgDealSize,
        pipelineData,
        winLossData: [wonValue, deals.filter(d => d.stage === 'closed_lost').reduce((s, d) => s + d.value, 0), pipelineValue - wonValue]
    };
}
