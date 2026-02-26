'use client';

import dynamic from 'next/dynamic';
import { useThemeStore } from '@/store/useThemeStore';
const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

export function PipelineDensityChart({ data }) {
    const { isDark } = useThemeStore();
    const pipelineChart = {
        options: {
            chart: { type: 'bar', toolbar: { show: false }, background: 'transparent' },
            colors: ['#8b5cf6', '#3b82f6', '#06b6d4', '#f59e0b', '#22c55e', '#ef4444'],
            plotOptions: {
                bar: {
                    borderRadius: 12, columnWidth: '50%', distributed: true,
                    dataLabels: { position: 'top' }
                }
            },
            dataLabels: {
                enabled: true, offsetY: -20,
                style: { fontSize: '10px', colors: ['var(--text-muted)'], fontWeight: 700 }
            },
            xaxis: {
                categories: ['Prospecting', 'Qual', 'Proposal', 'Nego', 'Won', 'Lost'],
                labels: { style: { colors: 'var(--text-muted)', fontSize: '10px', fontWeight: 600 } },
                axisBorder: { show: false }
            },
            yaxis: {
                labels: {
                    formatter: v => `$${(v / 1000).toFixed(0)}k`,
                    style: { colors: 'var(--text-muted)', fontWeight: 600 }
                }
            },
            grid: { borderColor: 'var(--border)', strokeDashArray: 4 },
            legend: { show: false },
            theme: { mode: isDark ? 'dark' : 'light' },
            tooltip: { theme: isDark ? 'dark' : 'light' }
        },
        series: [{ name: 'Value', data: data || [38000, 72000, 125000, 48000, 305000, 15000] }],
    };
    return <ReactApexChart options={pipelineChart.options} series={pipelineChart.series} type="bar" height="100%" />;
}

export function ResolutionMatrixChart({ data }) {
    const { isDark } = useThemeStore();
    const winLossChart = {
        options: {
            chart: { type: 'donut', background: 'transparent' },
            colors: ['#10b981', '#f43f5e', '#f59e0b'],
            labels: ['Won', 'Lost', 'In Progress'],
            stroke: { show: false },
            legend: { position: 'bottom', labels: { colors: 'var(--text-secondary)' }, markers: { radius: 12 } },
            plotOptions: {
                pie: {
                    donut: {
                        size: '75%',
                        labels: {
                            show: true,
                            total: {
                                show: true, label: 'Win Rate', color: 'var(--text-muted)', fontSize: '12px', fontWeight: 700,
                                formatter: () => '63%'
                            },
                            value: { color: 'var(--text-primary)', fontSize: '20px', fontWeight: 800 }
                        }
                    }
                }
            },
            theme: { mode: isDark ? 'dark' : 'light' },
            tooltip: { theme: isDark ? 'dark' : 'light' }
        },
        series: data || [305000, 15000, 178000],
    };
    return <ReactApexChart options={winLossChart.options} series={winLossChart.series} type="donut" height="100%" />;
}

export function RevenueTrajectoryChart() {
    const { isDark } = useThemeStore();
    const monthlyChart = {
        options: {
            chart: { type: 'line', toolbar: { show: false }, background: 'transparent' },
            colors: ['#8b5cf6', '#10b981'],
            stroke: { curve: 'smooth', width: 4 },
            xaxis: {
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                labels: { style: { colors: 'var(--text-muted)', fontSize: '10px' } }
            },
            yaxis: {
                labels: {
                    formatter: v => `$${(v / 1000).toFixed(0)}k`,
                    style: { colors: 'var(--text-muted)' }
                }
            },
            grid: { borderColor: 'var(--border)', strokeDashArray: 4 },
            legend: { position: 'top', horizontalAlign: 'right', labels: { colors: 'var(--text-secondary)' }, markers: { radius: 12 } },
            theme: { mode: isDark ? 'dark' : 'light' },
            tooltip: { theme: isDark ? 'dark' : 'light' }
        },
        series: [
            { name: 'Revenue', data: [18400, 22100, 29800, 24500, 31200, 28900, 35400, 38200, 29700, 42100, 38600, 45000] },
            { name: 'Target', data: [25000, 25000, 30000, 30000, 30000, 35000, 35000, 40000, 40000, 40000, 45000, 50000] },
        ],
    };
    return <ReactApexChart options={monthlyChart.options} series={monthlyChart.series} type="line" height="100%" />;
}
