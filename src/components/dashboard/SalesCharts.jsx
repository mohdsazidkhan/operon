'use client';

import dynamic from 'next/dynamic';
const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

export function PipelineDensityChart({ data }) {
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
                style: { fontSize: '10px', colors: ['#94a3b8'], fontWeight: 700 }
            },
            xaxis: {
                categories: ['Prospecting', 'Qual', 'Proposal', 'Nego', 'Won', 'Lost'],
                labels: { style: { colors: '#64748b', fontSize: '10px', fontWeight: 600 } },
                axisBorder: { show: false }
            },
            yaxis: {
                labels: {
                    formatter: v => `$${(v / 1000).toFixed(0)}k`,
                    style: { colors: '#64748b', fontWeight: 600 }
                }
            },
            grid: { borderColor: '#1e293b', strokeDashArray: 4 },
            legend: { show: false },
            theme: { mode: 'dark' }
        },
        series: [{ name: 'Value', data: data || [38000, 72000, 125000, 48000, 305000, 15000] }],
    };
    return <ReactApexChart options={pipelineChart.options} series={pipelineChart.series} type="bar" height="100%" />;
}

export function ResolutionMatrixChart({ data }) {
    const winLossChart = {
        options: {
            chart: { type: 'donut', background: 'transparent' },
            colors: ['#10b981', '#f43f5e', '#f59e0b'],
            labels: ['Won', 'Lost', 'In Progress'],
            stroke: { show: false },
            legend: { position: 'bottom', labels: { colors: '#94a3b8' }, markers: { radius: 12 } },
            plotOptions: {
                pie: {
                    donut: {
                        size: '75%',
                        labels: {
                            show: true,
                            total: {
                                show: true, label: 'Win Rate', color: '#94a3b8', fontSize: '12px', fontWeight: 700,
                                formatter: () => '63%'
                            },
                            value: { color: '#fff', fontSize: '20px', fontWeight: 800 }
                        }
                    }
                }
            },
            theme: { mode: 'dark' }
        },
        series: data || [305000, 15000, 178000],
    };
    return <ReactApexChart options={winLossChart.options} series={winLossChart.series} type="donut" height="100%" />;
}

export function RevenueTrajectoryChart() {
    const monthlyChart = {
        options: {
            chart: { type: 'line', toolbar: { show: false }, background: 'transparent' },
            colors: ['#8b5cf6', '#10b981'],
            stroke: { curve: 'smooth', width: 4 },
            xaxis: {
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                labels: { style: { colors: '#64748b', fontSize: '10px' } }
            },
            yaxis: {
                labels: {
                    formatter: v => `$${(v / 1000).toFixed(0)}k`,
                    style: { colors: '#64748b' }
                }
            },
            grid: { borderColor: '#1e293b', strokeDashArray: 4 },
            legend: { position: 'top', horizontalAlign: 'right', labels: { colors: '#94a3b8' }, markers: { radius: 12 } },
            theme: { mode: 'dark' }
        },
        series: [
            { name: 'Revenue', data: [18400, 22100, 29800, 24500, 31200, 28900, 35400, 38200, 29700, 42100, 38600, 45000] },
            { name: 'Target', data: [25000, 25000, 30000, 30000, 30000, 35000, 35000, 40000, 40000, 40000, 45000, 50000] },
        ],
    };
    return <ReactApexChart options={monthlyChart.options} series={monthlyChart.series} type="line" height="100%" />;
}
