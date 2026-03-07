# Operon - Enterprise Unified Dashboard

Operon is a professional, high-performance enterprise dashboard application built with **Next.js 15**, **MongoDB**, and **Tailwind CSS**. It provides a unified visual experience for Managing CRM, ERP, and HRMS data with a focus on premium aesthetics and developer-friendly architecture.

## 🚀 Key Features

- **Unified Dashboard**: Seamlessly switch between CRM, ERP, and HR modules.
- **Premium Aesthetics**: Glassmorphism, smooth animations (Framer Motion), and dynamic dark/light modes.
- **Micro-Services Ready**: Clean separation of concerns with dedicated API routes and data-access layers.
- **Real-time Analytics**: Interactive charts powered by ApexCharts.
- **Role-based Access**: Comprehensive demo roles predefined for immediate testing.
- **Responsive Design**: Fully optimized for Desktop, Tablet, and Mobile views.

## 🛠️ Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + Vanilla CSS Variables
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Database**: MongoDB (Mongoose ODM)
- **State Management**: Zustand
- **Forms**: React Hook Form
- **Authentication**: JWT Based with custom middleware

## 📦 Installation & Setup

### 1. Prerequisite
- Node.js 18+ 
- MongoDB Instance (Local or Atlas)

### 2. Clone and Install
```bash
git clone <repository-url>
cd operon
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env` and fill in your credentials:
```bash
cp .env.example .env
```

### 4. Seed Demo Data
Populate your database with professional demo data:
```bash
npm run seed
```

### 5. Start Development
```bash
npm run dev
```

## 🏗️ Production Build
To create an optimized production build:
```bash
npm run build
npm run start
```

## 📁 Project Structure

- `src/app`: Next.js App Router (Pages, Layouts, API)
- `src/components`: Reusable UI and Dashboard components
- `src/lib`: Utility functions and database access layer
- `src/store`: Global state management with Zustand
- `scripts`: Maintenance and seeding scripts
- `public`: Static assets (Logos, images)

## 📄 License
Check your purchase agreement for licensing details.

---
Created with ❤️ for professional enterprise solutions.
