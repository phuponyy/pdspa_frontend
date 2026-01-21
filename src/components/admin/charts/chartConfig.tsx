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
  plugins: {
    legend: {
      labels: {
        color: "#cbd5f5",
        font: { size: 11, weight: "600" },
      },
    },
  },
  scales: {
    x: {
      ticks: { color: "#94a3b8", font: { size: 10 } },
      grid: { color: "rgba(148, 163, 184, 0.12)" },
    },
    y: {
      ticks: { color: "#94a3b8", font: { size: 10 } },
      grid: { color: "rgba(148, 163, 184, 0.12)" },
    },
  },
};
