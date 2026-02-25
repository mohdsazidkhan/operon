import api from './api';

export const leadsService = {
    getAll: (params) => api.get('/leads', { params }),
    getOne: (id) => api.get(`/leads/${id}`),
    create: (data) => api.post('/leads', data),
    update: (id, data) => api.put(`/leads/${id}`, data),
    delete: (id) => api.delete(`/leads/${id}`),
};

export const dealsService = {
    getAll: (params) => api.get('/deals', { params }),
    create: (data) => api.post('/deals', data),
    update: (id, data) => api.put(`/deals/${id}`, data),
    delete: (id) => api.delete(`/deals/${id}`),
};

export const contactsService = {
    getAll: (params) => api.get('/contacts', { params }),
    create: (data) => api.post('/contacts', data),
    update: (id, data) => api.put(`/contacts/${id}`, data),
    delete: (id) => api.delete(`/contacts/${id}`),
};

export const companiesService = {
    getAll: (params) => api.get('/companies', { params }),
    create: (data) => api.post('/companies', data),
    update: (id, data) => api.put(`/companies/${id}`, data),
    delete: (id) => api.delete(`/companies/${id}`),
};

export const productsService = {
    getAll: (params) => api.get('/products', { params }),
    create: (data) => api.post('/products', data),
    update: (id, data) => api.put(`/products/${id}`, data),
    delete: (id) => api.delete(`/products/${id}`),
};

export const ordersService = {
    getAll: (params) => api.get('/orders', { params }),
    create: (data) => api.post('/orders', data),
    update: (id, data) => api.put(`/orders/${id}`, data),
};

export const invoicesService = {
    getAll: (params) => api.get('/invoices', { params }),
    getOne: (id) => api.get(`/invoices/${id}`),
    create: (data) => api.post('/invoices', data),
    update: (id, data) => api.put(`/invoices/${id}`, data),
    delete: (id) => api.delete(`/invoices/${id}`),
};

export const expensesService = {
    getAll: (params) => api.get('/expenses', { params }),
    create: (data) => api.post('/expenses', data),
    update: (id, data) => api.put(`/expenses/${id}`, data),
};

export const employeesService = {
    getAll: (params) => api.get('/employees', { params }),
    getOne: (id) => api.get(`/employees/${id}`),
    create: (data) => api.post('/employees', data),
    update: (id, data) => api.put(`/employees/${id}`, data),
    delete: (id) => api.delete(`/employees/${id}`),
};

export const attendanceService = {
    getAll: (params) => api.get('/attendance', { params }),
    create: (data) => api.post('/attendance', data),
};

export const leavesService = {
    getAll: (params) => api.get('/leaves', { params }),
    create: (data) => api.post('/leaves', data),
    update: (id, data) => api.put(`/leaves/${id}`, data),
};

export const payrollService = {
    getAll: (params) => api.get('/payroll', { params }),
    create: (data) => api.post('/payroll', data),
    update: (id, data) => api.put(`/payroll/${id}`, data),
};

export const tasksService = {
    getAll: (params) => api.get('/tasks', { params }),
    create: (data) => api.post('/tasks', data),
    update: (id, data) => api.put(`/tasks/${id}`, data),
    delete: (id) => api.delete(`/tasks/${id}`),
};

export const notificationsService = {
    getAll: () => api.get('/notifications'),
    markRead: (id) => api.put(`/notifications/${id}`, { read: true }),
};

export const dashboardService = {
    getOverview: () => api.get('/dashboard/overview'),
    getSales: () => api.get('/dashboard/sales'),
    getHR: () => api.get('/dashboard/hr'),
    getFinance: () => api.get('/dashboard/finance'),
};
