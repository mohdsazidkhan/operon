'use client';

import dynamic from 'next/dynamic';
const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

export function StockSaturationChart() {
    const stockChart = {
        options: {
            chart: { type: 'bar', toolbar: { show: false }, background: 'transparent' },
            colors: ['#8b5cf6', '#8b5cf6', '#ef4444', '#8b5cf6', '#ef4444'],
            plotOptions: {
                bar: {
                    borderRadius: 10, columnWidth: '50%', distributed: true,
                    dataLabels: { position: 'top' }
                }
            },
            xaxis: {
                categories: ['Cloud Srv', 'Neural Link', 'Bio Sensor', 'Nano Kit', 'Proxy Node'],
                labels: { style: { colors: '#64748b', fontSize: '10px', fontWeight: 600 } },
                axisBorder: { show: false }
            },
            yaxis: { labels: { style: { colors: '#64748b', fontWeight: 600 } } },
            grid: { borderColor: '#1e293b', strokeDashArray: 4 },
            legend: { show: false },
            theme: { mode: 'dark' }
        },
        series: [{ name: 'Stock Depth', data: [85, 64, 12, 53, 8] }],
    };
    return <ReactApexChart options={stockChart.options} series={stockChart.series} type="bar" height="100%" />;
}

export function DeliveryMatrixChart() {
    const orderStatusChart = {
        options: {
            chart: { type: 'donut', background: 'transparent' },
            labels: ['Fulfilled', 'Processing', 'Hold', 'Rejected'],
            colors: ['#10b981', '#3b82f6', '#f59e0b', '#f43f5e'],
            stroke: { show: false },
            legend: { position: 'bottom', labels: { colors: '#94a3b8' }, markers: { radius: 12 } },
            plotOptions: {
                pie: {
                    donut: {
                        size: '75%',
                        labels: {
                            show: true,
                            total: {
                                show: true, label: 'Fulfillment', color: '#94a3b8', fontSize: '11px',
                                formatter: () => '94.2%'
                            },
                            value: { color: '#fff', fontSize: '18px', fontWeight: 800 }
                        }
                    }
                }
            },
            theme: { mode: 'dark' }
        },
        series: [1240, 310, 45, 12],
    };
    return <ReactApexChart options={orderStatusChart.options} series={orderStatusChart.series} type="donut" height="100%" />;
}
