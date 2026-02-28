# 👥 Operon Demo Users Directory

This document contains a complete list of demo users with specific RBAC roles seeded in the system. All passwords follow the standard pattern unless specified.

## ── GLOBAL DOMAIN: operon.app ──

| Role Name | Email | Password | Scope |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin@operon.app` | `SuperAdmin@123` | Full Platform Control |
| **Organization Admin** | `admin@operon.app` | `Admin@123` | Company-wide control |

---

### 🛡️ CRM ROLES
| Role Name | Email | Password |
| :--- | :--- | :--- |
| CRM Admin | `crmadmin@operon.app` | `CrmAdmin@123` |
| Sales Manager | `salesmanager@operon.app` | `SalesManager@123` |
| Sales Executive | `salesexec@operon.app` | `SalesExec@123` |
| Support Manager | `supportmanager@operon.app` | `SupportManager@123` |
| Support Agent | `supportagent@operon.app` | `SupportAgent@123` |
| Client Portal User | `client@operon.app` | `Client@123` |

---

### 👥 HRMS ROLES
| Role Name | Email | Password |
| :--- | :--- | :--- |
| HR Admin | `hradmin@operon.app` | `HrAdmin@123` |
| HR Manager | `hrmanager@operon.app` | `HrManager@123` |
| HR Executive | `hrexec@operon.app` | `HrExec@123` |
| Team Lead | `teamlead@operon.app` | `TeamLead@123` |
| Regular Employee | `employee@operon.app` | `Employee@123` |

---

### 📦 ERP ROLES
| Role Name | Email | Password |
| :--- | :--- | :--- |
| ERP Admin | `erpadmin@operon.app` | `ErpAdmin@123` |
| Operations Manager | `opsmanager@operon.app` | `OpsManager@123` |
| Inventory Manager | `inventory@operon.app` | `Inventory@123` |
| Procurement Manager | `procurement@operon.app` | `Procurement@123` |
| Finance Manager | `finance@operon.app` | `Finance@123` |
| Vendor Portal User | `vendor@operon.app` | `Vendor@123` |

---

## 🚀 How to use
1. Run `node scripts/seed.js` to ensure the database is populated.
2. Visit `http://localhost:3000/login`
3. Use any of the credentials above to test specific module permissions.
