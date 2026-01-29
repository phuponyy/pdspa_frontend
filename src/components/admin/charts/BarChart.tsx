"use client";

import { Bar } from "react-chartjs-2";
import { baseChartOptions, registerCharts } from "./chartConfig";

export default function BarChart({
  labels,
  data,
  label,
  color = "#ff6a3d",
}: {
  labels: string[];
  data: number[];
  label: string;
  color?: string;
}) {
  registerCharts();
  return (
    <div className="h-64 w-full">
      <Bar
        options={baseChartOptions}
        data={{
          labels,
          datasets: [
            {
              label,
              data,
              backgroundColor: (context) => {
                const { chart } = context;
                const { ctx, chartArea } = chart;
                if (!chartArea) return `${color}66`;
                const gradient = ctx.createLinearGradient(
                  0,
                  chartArea.top,
                  0,
                  chartArea.bottom
                );
                gradient.addColorStop(0, `${color}cc`);
                gradient.addColorStop(1, `${color}33`);
                return gradient;
              },
              borderColor: color,
              borderRadius: 8,
              borderWidth: 1,
              borderSkipped: false,
              maxBarThickness: 28,
            },
          ],
        }}
      />
    </div>
  );
}
