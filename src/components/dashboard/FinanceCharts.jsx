'use client';

import dynamic from 'next/dynamic';
import { useThemeStore } from '@/store/useThemeStore';
const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

export function PLVarianceChart() {
    const { isDark } = useThemeStore();
    const plChart = {
        options: {
            chart: { type: 'bar', toolbar: { show: false }, background: 'transparent', stacked: false },
            colors: ['#10b981', '#f43f5e', '#8b5cf6'],
            plotOptions: { bar: { borderRadius: 8, columnWidth: '55%', grouped: true } },
            xaxis: {
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                labels: { style: { colors: 'var(--text-muted)', fontSize: '10px', fontWeight: 600 } },
                axisBorder: { show: false }
            },
            yaxis: {
                labels: { formatter: v => `$${(v / 1000).toFixed(0)}k`, style: { colors: 'var(--text-muted)', fontWeight: 600 } }
            },
            grid: { borderColor: 'var(--border)', strokeDashArray: 4 },
            legend: { position: 'top', horizontalAlign: 'right', labels: { colors: 'var(--text-secondary)' }, markers: { radius: 12 } },
            theme: { mode: isDark ? 'dark' : 'light' },
            tooltip: { theme: isDark ? 'dark' : 'light' }
        },
        series: [
            { name: 'Revenue', data: [18400, 22100, 29800, 24500, 31200, 28900, 35400, 38200, 29700, 42100, 38600, 45000] },
            { name: 'Expenses', data: [12000, 14500, 16200, 13800, 17400, 15900, 19800, 18600, 16400, 21200, 19800, 22400] },
        ],
    };
    return <ReactApexChart options={plChart.options} series={plChart.series} type="bar" height="100%" />;
}

export function CashPropagationChart() {
    const { isDark } = useThemeStore();
    const cashflowChart = {
        options: {
            chart: { type: 'area', toolbar: { show: false }, background: 'transparent' },
            colors: ['#8b5cf6'],
            fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 100] } },
            stroke: { curve: 'smooth', width: 4 },
            xaxis: {
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                labels: { style: { colors: 'var(--text-muted)', fontSize: '10px' } }
            },
            yaxis: {
                labels: { formatter: v => `$${(v / 1000).toFixed(0)}k`, style: { colors: 'var(--text-muted)' } }
            },
            grid: { borderColor: 'var(--border)', strokeDashArray: 4 },
            theme: { mode: isDark ? 'dark' : 'light' },
            tooltip: { theme: isDark ? 'dark' : 'light' }
        },
        series: [{ name: 'Cash Flow', data: [6400, 7600, 13600, 10700, 13800, 13000] }],
    };
    return <ReactApexChart options={cashflowChart.options} series={cashflowChart.series} type="area" height="100%" />;
}

export function OverheadSegregationChart() {
    const { isDark } = useThemeStore();
    const expenseChart = {
        options: {
            chart: { type: 'donut', background: 'transparent' },
            labels: ['Software', 'Travel', 'Marketing', 'Meals', 'Office', 'Utilities'],
            colors: ['#8b5cf6', '#3b82f6', '#f59e0b', '#10b981', '#f43f5e', '#06b6d4'],
            stroke: { show: false },
            legend: { position: 'bottom', labels: { colors: 'var(--text-secondary)' }, markers: { radius: 12 } },
            plotOptions: {
                pie: {
                    donut: {
                        size: '75%',
                        labels: {
                            show: true,
                            total: {
                                show: true, label: 'Top Expense', color: 'var(--text-muted)', fontSize: '11px',
                                formatter: () => 'Software'
                            },
                            value: { color: 'var(--text-primary)', fontSize: '18px', fontWeight: 800 }
                        }
                    }
                }
            },
            theme: { mode: isDark ? 'dark' : 'light' },
            tooltip: { theme: isDark ? 'dark' : 'light' }
        },
        series: [4680, 1850, 2500, 380, 520, 800],
    };
    return <ReactApexChart options={expenseChart.options} series={expenseChart.series} type="donut" height="100%" />;
}
