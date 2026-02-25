'use client';

import dynamic from 'next/dynamic';
const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

export function SectorAllocationChart({ total }) {
    const deptChart = {
        options: {
            chart: { type: 'donut', background: 'transparent' },
            labels: ['Engineering', 'Sales', 'Marketing', 'Finance', 'HR'],
            colors: ['#8b5cf6', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444'],
            stroke: { show: false },
            legend: { position: 'bottom', labels: { colors: '#94a3b8' }, markers: { radius: 12 } },
            plotOptions: {
                pie: {
                    donut: {
                        size: '70%',
                        labels: {
                            show: true,
                            total: {
                                show: true, label: 'Force Size', color: '#94a3b8', fontSize: '11px',
                                formatter: () => total || 15
                            },
                            value: { color: '#fff', fontSize: '18px', fontWeight: 800 }
                        }
                    }
                }
            },
            theme: { mode: 'dark' }
        },
        series: [6, 4, 2, 2, 1],
    };
    return <ReactApexChart options={deptChart.options} series={deptChart.series} type="donut" height="100%" />;
}

export function AttendanceDeltaChart() {
    const attendanceChart = {
        options: {
            chart: { type: 'bar', toolbar: { show: false }, background: 'transparent', stacked: true },
            colors: ['#10b981', '#f43f5e', '#f59e0b'],
            plotOptions: { bar: { borderRadius: 6, columnWidth: '40%' } },
            xaxis: {
                categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
                labels: { style: { colors: '#64748b', fontWeight: 600 } },
                axisBorder: { show: false }
            },
            yaxis: { labels: { style: { colors: '#64748b' } } },
            grid: { borderColor: '#1e293b', strokeDashArray: 4 },
            legend: { show: true, position: 'top', horizontalAlign: 'right', labels: { colors: '#94a3b8' } },
            theme: { mode: 'dark' }
        },
        series: [
            { name: 'Present', data: [12, 13, 11, 14, 10] },
            { name: 'Absent', data: [2, 1, 3, 0, 4] },
            { name: 'Late', data: [1, 1, 1, 1, 1] },
        ],
    };
    return <ReactApexChart options={attendanceChart.options} series={attendanceChart.series} type="bar" height="100%" />;
}
