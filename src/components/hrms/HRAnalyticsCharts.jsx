'use client';

import dynamic from 'next/dynamic';
import { useThemeStore } from '@/store/useThemeStore';
const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

export function SalaryVelocityChart({ employees }) {
    const { isDark } = useThemeStore();

    const salaryChart = {
        options: {
            chart: { type: 'bar', toolbar: { show: false }, background: 'transparent' },
            colors: ['#8b5cf6'],
            plotOptions: { bar: { borderRadius: 8, horizontal: true, barHeight: '50%' } },
            xaxis: {
                categories: employees.slice(0, 8).map(e => e.name?.split(' ')[0] || 'Unknown'),
                labels: { style: { colors: isDark ? '#64748b' : '#94a3b8', fontWeight: 600, fontSize: '10px' } },
                axisBorder: { show: false }
            },
            yaxis: { labels: { style: { colors: isDark ? '#94a3b8' : '#64748b', fontWeight: 600, fontSize: '10px' } } },
            grid: { borderColor: isDark ? '#1e293b' : '#e2e8f0', strokeDashArray: 4 },
            theme: { mode: isDark ? 'dark' : 'light' },
            tooltip: { theme: isDark ? 'dark' : 'light' }
        },
        series: [{ name: 'Monthly Velocity', data: employees.slice(0, 8).map(e => e.salary || 0) }],
    };
    return <ReactApexChart options={salaryChart.options} series={salaryChart.series} type="bar" height="100%" />;
}

export function DepartmentalExpenditureChart({ employees }) {
    const { isDark } = useThemeStore();

    const deptPayroll = employees.reduce((acc, e) => {
        const dept = e.department || 'GENERIC';
        acc[dept] = (acc[dept] || 0) + (e.salary || 0);
        return acc;
    }, {});

    const deptChart = {
        options: {
            chart: { type: 'donut', background: 'transparent' },
            labels: Object.keys(deptPayroll),
            colors: ['#8b5cf6', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4'],
            legend: {
                position: 'bottom',
                labels: { colors: isDark ? '#94a3b8' : '#64748b', fontWeight: 600 },
                itemMargin: { horizontal: 10, vertical: 5 }
            },
            stroke: { show: false },
            dataLabels: { enabled: false },
            plotOptions: {
                pie: {
                    donut: {
                        size: '75%',
                        labels: {
                            show: true,
                            name: { show: true, color: isDark ? '#64748b' : '#94a3b8', fontSize: '10px', fontWeight: 900, offsetY: -10 },
                            value: { show: true, color: isDark ? '#fff' : '#1e293b', fontSize: '20px', fontWeight: 900, offsetY: 10, formatter: v => `$${Math.round(v / 1000)}k` },
                            total: { show: true, label: 'TOTAL FLOW', color: isDark ? '#64748b' : '#94a3b8', fontSize: '9px', fontWeight: 900 }
                        }
                    }
                }
            },
            theme: { mode: isDark ? 'dark' : 'light' }
        },
        series: Object.values(deptPayroll),
    };
    return <ReactApexChart options={deptChart.options} series={deptChart.series} type="donut" height="100%" width="100%" />;
}
