'use client';

import dynamic from 'next/dynamic';
const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

export function MainRevenueChart({ revenueData, expenseData }) {
    const revenueChart = {
        options: {
            chart: { type: 'area', toolbar: { show: false }, background: 'transparent', sparkline: { enabled: false } },
            colors: ['#8b5cf6', '#3b82f6'],
            tooltip: { theme: 'dark', style: { fontSize: '12px', fontFamily: 'Inter' } },
            stroke: { curve: 'smooth', width: 3, lineCap: 'round' },
            grid: { borderColor: '#1e293b', strokeDashArray: 4, padding: { left: 20, right: 20 } },
            xaxis: {
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                axisBorder: { show: false },
                axisTicks: { show: false },
                labels: { style: { colors: '#64748b', fontWeight: 600, fontSize: '10px' } }
            },
            yaxis: { labels: { style: { colors: '#64748b', fontWeight: 600, fontSize: '10px' }, formatter: v => `$${v}k` } },
            fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 100] } },
            legend: { position: 'top', horizontalAlign: 'right', labels: { colors: '#94a3b8' }, markers: { radius: 12 } }
        },
        series: [
            { name: 'Revenue', data: revenueData || [45, 52, 38, 65, 48, 72] },
            { name: 'Expenses', data: expenseData || [32, 41, 35, 51, 39, 42] }
        ],
    };

    return <ReactApexChart options={revenueChart.options} series={revenueChart.series} type="area" height="100%" />;
}

export function FunnelChart({ conversionData }) {
    const funnelChart = {
        options: {
            chart: { type: 'bar', toolbar: { show: false }, background: 'transparent' },
            colors: ['#8b5cf6'],
            plotOptions: {
                bar: {
                    horizontal: true,
                    borderRadius: 12,
                    barHeight: '60%',
                    distributed: true,
                    dataLabels: { position: 'center' }
                }
            },
            dataLabels: {
                enabled: true,
                formatter: val => val,
                style: { colors: ['#fff'], fontSize: '11px', fontWeight: 'bold' }
            },
            xaxis: {
                categories: ['New', 'Lead', 'Qual', 'Prop', 'Nego', 'Won'],
                labels: { style: { colors: '#64748b', fontWeight: 600, fontSize: '10px' } },
                axisBorder: { show: false }
            },
            yaxis: { labels: { style: { colors: '#94a3b8', fontWeight: 600, fontSize: '11px' } } },
            grid: { show: false }
        },
        series: [{ name: 'Conversion', data: conversionData || [85, 62, 44, 31, 19, 12] }],
    };

    return <ReactApexChart options={funnelChart.options} series={funnelChart.series} type="bar" height="100%" />;
}
