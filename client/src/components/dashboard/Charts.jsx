import React from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const palette = {
  'Not Started': '#9ca3af',
  'To Do': '#9ca3af',
  'In Progress': '#3b82f6',
  Review: '#8b5cf6',
  Completed: '#10b981',
  Low: '#10b981',
  Medium: '#f59e0b',
  High: '#ef4444',
};

export const StatusPieChart = ({ data = [] }) => {
  const chartData = {
    labels: data.map((d) => d._id || 'Unknown'),
    datasets: [
      {
        data: data.map((d) => d.count),
        backgroundColor: data.map((d) => palette[d._id] || '#6366f1'),
        borderWidth: 0,
      },
    ],
  };

  return (
    <Pie
      data={chartData}
      options={{
        plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 14 } } },
        maintainAspectRatio: false,
      }}
    />
  );
};

export const PriorityBarChart = ({ data = [] }) => {
  const order = ['Low', 'Medium', 'High'];
  const sorted = [...data].sort((a, b) => order.indexOf(a._id) - order.indexOf(b._id));

  const chartData = {
    labels: sorted.map((d) => d._id || 'Unknown'),
    datasets: [
      {
        label: 'Tasks',
        data: sorted.map((d) => d.count),
        backgroundColor: sorted.map((d) => palette[d._id] || '#6366f1'),
        borderRadius: 6,
        maxBarThickness: 60,
      },
    ],
  };

  return (
    <Bar
      data={chartData}
      options={{
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1 } },
          x: { grid: { display: false } },
        },
        maintainAspectRatio: false,
      }}
    />
  );
};

export const ProjectStatusBarChart = ({ data = [] }) => {
  const chartData = {
    labels: data.map((d) => d._id || 'Unknown'),
    datasets: [
      {
        label: 'Projects',
        data: data.map((d) => d.count),
        backgroundColor: data.map((d) => palette[d._id] || '#6366f1'),
        borderRadius: 6,
        maxBarThickness: 60,
      },
    ],
  };

  return (
    <Bar
      data={chartData}
      options={{
        indexAxis: 'y',
        plugins: { legend: { display: false } },
        scales: {
          x: { beginAtZero: true, ticks: { stepSize: 1 } },
          y: { grid: { display: false } },
        },
        maintainAspectRatio: false,
      }}
    />
  );
};
