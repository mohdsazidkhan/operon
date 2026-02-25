'use client';

import dynamic from 'next/dynamic';
const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

export function SalaryVelocityChart({ employees }) {
    const salaryChart = {
        options: {
            chart: { type: 'bar', toolbar: { show: false }, background: 'transparent' },
            colors: ['#8b5cf6'],
            plotOptions: { bar: { borderRadius: 8, horizontal: true, barHeight: '50%' } },
            xaxis: {
                categories: employees.slice(0, 8).map(e => e.name?.split(' ')[0] || 'Unknown'),
                labels: { style: { colors: '#64748b', fontWeight: 600, fontSize: '10px' } },
                axisBorder: { show: false }
            },
            yaxis: { labels: { style: { colors: '#94a3b8', fontWeight: 600, fontSize: '10px' } } },
            grid: { borderColor: '#1e293b', strokeDashArray: 4 },
            theme: { mode: 'dark' },
            tooltip: { theme: 'dark' }
        },
        series: [{ name: 'Monthly Velocity', data: employees.slice(0, 8).map(e => e.salary || 0) }],
    };
    return <ReactApexChart options={salaryChart.options} series={salaryChart.series} type="bar" height="100%" />;
}

export function DepartmentalExpenditureChart({ employees }) {
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
            legend: { position: 'bottom', labels: { colors: '#94a3b8', fontWeight: 600 }, itemMargin: { horizontal: 10, vertical: 5 } },
            stroke: { show: false },
            dataLabels: { enabled: false },
            plotOptions: {
                pie: {
                    donut: {
                        size: '75%',
                        labels: {
                            show: true,
                            name: { show: true, color: '#64748b', fontSize: '10px', fontWeight: 900, offsetY: -10 },
                            value: { show: true, color: '#fff', fontSize: '20px', fontWeight: 900, offsetY: 10, formatter: v => `$${Math.round(v / 1000)}k` },
                            total: { show: true, label: 'TOTAL FLOW', color: '#64748b', fontSize: '9px', fontWeight: 900 }
                        }
                    }
                }
            },
            theme: { mode: 'dark' }
        },
        series: Object.values(deptPayroll),
    };
    return <ReactApexChart options={deptChart.options} series={deptChart.series} type="donut" height="100%" width="100%" />;
}
