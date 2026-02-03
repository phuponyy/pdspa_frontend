"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

let registered = false;

export const registerCharts = () => {
  if (registered) return;
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Tooltip,
    Legend
  );
  registered = true;
};

export const baseChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  layout: {
    padding: { top: 8, bottom: 8, left: 4, right: 12 },
  },
  interaction: {
    intersect: false,
    mode: "index" as const,
  },
  plugins: {
    legend: {
      position: "bottom" as const,
      labels: {
        color: "#cbd5f5",
        font: { size: 11, weight: "bold" as const },
        usePointStyle: true,
        boxWidth: 8,
        boxHeight: 8,
      },
    },
    tooltip: {
      backgroundColor: "rgba(15, 23, 42, 0.92)",
      borderColor: "rgba(148, 163, 184, 0.25)",
      borderWidth: 1,
      titleColor: "#f8fafc",
      bodyColor: "#e2e8f0",
      padding: 12,
      displayColors: true,
      usePointStyle: true,
      callbacks: {
        label: (context: any) =>
          ` ${context?.parsed?.y?.toLocaleString?.() ?? 0}`,
      },
    },
  },
  scales: {
    x: {
      ticks: { color: "#94a3b8", font: { size: 10 } },
      grid: { color: "rgba(148, 163, 184, 0.08)" },
      border: { display: false },
    },
    y: {
      ticks: { color: "#94a3b8", font: { size: 10 } },
      grid: { color: "rgba(148, 163, 184, 0.08)" },
      border: { display: false },
    },
  },
};
