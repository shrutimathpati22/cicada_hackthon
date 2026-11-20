import React, { useMemo } from 'react';
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  ChartOptions,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { AlertItem, TelemetryPoint } from '../types/veilwatch';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

interface ThemeProps {
  theme: 'dark' | 'light';
}

export const CpuMemoryChart: React.FC<{ data: TelemetryPoint[] } & ThemeProps> = ({
  data,
  theme,
}) => {
  const isDark = theme === 'dark';
  const gridColor = isDark ? 'rgba(232, 195, 106, 0.12)' : 'rgba(217, 154, 37, 0.14)';
  const tickColor = isDark ? '#D5C6AE' : '#6A5B47';

  const chartData = useMemo(
    () => ({
      labels: data.map((p) => p.label),
      datasets: [
        {
          label: 'CPU Load (%)',
          data: data.map((p) => p.cpu),
          borderColor: '#D99A25',
          backgroundColor: 'rgba(245, 197, 66, 0.22)',
          borderWidth: 2.2,
          tension: 0.38,
          fill: true,
          pointRadius: 2.5,
          pointBackgroundColor: '#F5C542',
          pointHoverRadius: 5,
        },
        {
          label: 'Memory Utilization (%)',
          data: data.map((p) => p.memory),
          borderColor: isDark ? '#E8C36A' : '#8F5A0B',
          backgroundColor: isDark ? 'rgba(232, 195, 106, 0.12)' : 'rgba(232, 195, 106, 0.18)',
          borderWidth: 2,
          tension: 0.38,
          fill: true,
          pointRadius: 2.5,
          pointBackgroundColor: isDark ? '#E8C36A' : '#8F5A0B',
          pointHoverRadius: 5,
        },
      ],
    }),
    [data, isDark]
  );

  const options: ChartOptions<'line'> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 750, easing: 'easeOutQuart' },
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          position: 'top',
          align: 'end',
          labels: {
            color: tickColor,
            boxWidth: 10,
            usePointStyle: true,
            font: { family: 'DM Sans, sans-serif', size: 12 },
          },
        },
        tooltip: {
          backgroundColor: isDark ? '#221B11' : '#FFF9EF',
          titleColor: isDark ? '#FFF9EF' : '#29231B',
          bodyColor: isDark ? '#E8C36A' : '#6A5B47',
          borderColor: 'rgba(217, 154, 37, 0.45)',
          borderWidth: 1,
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: tickColor, maxTicksLimit: 7, font: { size: 11 } },
        },
        y: {
          min: 0,
          max: 100,
          grid: { color: gridColor },
          ticks: {
            color: tickColor,
            callback: (val) => `${val}%`,
            font: { family: 'JetBrains Mono, monospace', size: 11 },
          },
        },
      },
    }),
    [gridColor, isDark, tickColor]
  );

  return <Line data={chartData} options={options} />;
};

export const NetworkTrafficChart: React.FC<{ data: TelemetryPoint[] } & ThemeProps> = ({
  data,
  theme,
}) => {
  const isDark = theme === 'dark';
  const gridColor = isDark ? 'rgba(232, 195, 106, 0.12)' : 'rgba(217, 154, 37, 0.14)';
  const tickColor = isDark ? '#D5C6AE' : '#6A5B47';

  const chartData = useMemo(
    () => ({
      labels: data.map((p) => p.label),
      datasets: [
        {
          label: 'Ingress (Mbps)',
          data: data.map((p) => p.networkInMbps),
          borderColor: '#D99A25',
          backgroundColor: 'rgba(245, 197, 66, 0.24)',
          borderWidth: 2.2,
          tension: 0.38,
          fill: true,
          pointRadius: 2.5,
          pointBackgroundColor: '#D99A25',
        },
        {
          label: 'Sanitized Egress (Mbps)',
          data: data.map((p) => p.networkOutMbps),
          borderColor: isDark ? '#F5C542' : '#7A5416',
          backgroundColor: 'rgba(232, 195, 106, 0.16)',
          borderWidth: 2,
          tension: 0.38,
          fill: true,
          pointRadius: 2.5,
          pointBackgroundColor: isDark ? '#F5C542' : '#7A5416',
        },
      ],
    }),
    [data, isDark]
  );

  const options: ChartOptions<'line'> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 750, easing: 'easeOutQuart' },
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          position: 'top',
          align: 'end',
          labels: {
            color: tickColor,
            boxWidth: 10,
            usePointStyle: true,
            font: { family: 'DM Sans, sans-serif', size: 12 },
          },
        },
        tooltip: {
          backgroundColor: isDark ? '#221B11' : '#FFF9EF',
          titleColor: isDark ? '#FFF9EF' : '#29231B',
          bodyColor: isDark ? '#E8C36A' : '#6A5B47',
          borderColor: 'rgba(217, 154, 37, 0.45)',
          borderWidth: 1,
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: tickColor, maxTicksLimit: 7, font: { size: 11 } },
        },
        y: {
          beginAtZero: true,
          grid: { color: gridColor },
          ticks: {
            color: tickColor,
            callback: (val) => `${val}M`,
            font: { family: 'JetBrains Mono, monospace', size: 11 },
          },
        },
      },
    }),
    [gridColor, isDark, tickColor]
  );

  return <Line data={chartData} options={options} />;
};

export const PredictiveTrendChart: React.FC<
  {
    labels: string[];
    cpu: number[];
    memory: number[];
    responseMs: number[];
    cpuThreshold: number;
  } & ThemeProps
> = ({ labels, cpu, memory, responseMs, cpuThreshold, theme }) => {
  const isDark = theme === 'dark';
  const gridColor = isDark ? 'rgba(232, 195, 106, 0.12)' : 'rgba(217, 154, 37, 0.14)';
  const tickColor = isDark ? '#D5C6AE' : '#6A5B47';

  const chartData = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: 'CPU (%)',
          data: cpu,
          borderColor: '#D99A25',
          backgroundColor: 'rgba(245, 197, 66, 0.18)',
          borderWidth: 2.2,
          tension: 0.34,
        },
        {
          label: 'Memory (%)',
          data: memory,
          borderColor: isDark ? '#E8C36A' : '#7A5416',
          backgroundColor: 'rgba(232, 195, 106, 0.14)',
          borderWidth: 2,
          tension: 0.34,
        },
        {
          label: `CPU Warning Baseline (${cpuThreshold}%)`,
          data: labels.map(() => cpuThreshold),
          borderColor: '#BE123C',
          borderDash: [6, 5],
          borderWidth: 1.5,
          pointRadius: 0,
        },
        {
          label: 'Scaled Latency (ms / 4)',
          data: responseMs.map((r) => Math.min(100, Math.round(r / 4))),
          borderColor: '#B87914',
          borderWidth: 1.8,
          tension: 0.34,
        },
      ],
    }),
    [labels, cpu, memory, responseMs, cpuThreshold, isDark]
  );

  const options: ChartOptions<'line'> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 750, easing: 'easeOutQuart' },
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          position: 'top',
          align: 'end',
          labels: { color: tickColor, boxWidth: 10, usePointStyle: true, font: { size: 11 } },
        },
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: tickColor, font: { size: 11 } } },
        y: {
          min: 0,
          max: 105,
          grid: { color: gridColor },
          ticks: { color: tickColor, font: { family: 'JetBrains Mono, monospace', size: 11 } },
        },
      },
    }),
    [gridColor, tickColor]
  );

  return <Line data={chartData} options={options} />;
};

export const AlertDistributionChart: React.FC<{ alerts: AlertItem[] } & ThemeProps> = ({
  alerts,
  theme,
}) => {
  const isDark = theme === 'dark';
  const tickColor = isDark ? '#D5C6AE' : '#6A5B47';

  const counts = useMemo(() => {
    const map = { low: 0, medium: 0, high: 0, critical: 0 };
    alerts.forEach((a) => {
      map[a.severity] += 1;
    });
    return map;
  }, [alerts]);

  const data = {
    labels: ['Low', 'Medium', 'High', 'Critical'],
    datasets: [
      {
        label: 'Alerts',
        data: [counts.low, counts.medium, counts.high, counts.critical],
        backgroundColor: [
          'rgba(232, 195, 106, 0.90)',
          'rgba(245, 197, 66, 0.92)',
          'rgba(217, 154, 37, 0.92)',
          'rgba(190, 18, 60, 0.85)',
        ],
        borderColor: isDark ? '#221B11' : '#FFF9EF',
        borderWidth: 2,
      },
    ],
  };

  return (
    <Doughnut
      data={data}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 750, easing: 'easeOutQuart' },
        cutout: '66%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: tickColor,
              padding: 16,
              usePointStyle: true,
              font: { size: 12 },
            },
          },
        },
      }}
    />
  );
};

export const PrivacyDecisionBarChart: React.FC<
  { approved: number; blocked: number } & ThemeProps
> = ({ approved, blocked, theme }) => {
  const isDark = theme === 'dark';
  const gridColor = isDark ? 'rgba(232, 195, 106, 0.12)' : 'rgba(217, 154, 37, 0.14)';
  const tickColor = isDark ? '#D5C6AE' : '#6A5B47';

  const data = {
    labels: ['Approved Summaries', 'Blocked Exports'],
    datasets: [
      {
        label: 'Inspections',
        data: [approved, blocked],
        backgroundColor: ['rgba(245, 197, 66, 0.9)', 'rgba(217, 154, 37, 0.9)'],
        borderRadius: 8,
        barThickness: 42,
      },
    ],
  };

  return (
    <Bar
      data={data}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 750, easing: 'easeOutQuart' },
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: tickColor } },
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1, color: tickColor, font: { family: 'JetBrains Mono, monospace' } },
            grid: { color: gridColor },
          },
        },
      }}
    />
  );
};
