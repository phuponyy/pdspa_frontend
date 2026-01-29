"use client";

import { Line } from "react-chartjs-2";
import { baseChartOptions, registerCharts } from "./chartConfig";

export default function LineChart({
  labels,
  data,
  label,
  color = "#2f7bff",
}: {
  labels: string[];
  data: number[];
  label: string;
  color?: string;
}) {
  registerCharts();
  return (
    <div className="h-64 w-full">
      <Line
        options={baseChartOptions}
        data={{
          labels,
          datasets: [
            {
              label,
              data,
              borderColor: color,
              backgroundColor: (context) => {
                const { chart } = context;
                const { ctx, chartArea } = chart;
                if (!chartArea) return `${color}22`;
                const gradient = ctx.createLinearGradient(
                  0,
                  chartArea.top,
                  0,
                  chartArea.bottom
                );
                gradient.addColorStop(0, `${color}55`);
                gradient.addColorStop(0.6, `${color}15`);
                gradient.addColorStop(1, "rgba(15, 23, 42, 0)");
                return gradient;
              },
              tension: 0.35,
              fill: true,
              borderWidth: 2.5,
              pointRadius: 0,
              pointHitRadius: 12,
              pointHoverRadius: 5,
              pointHoverBorderWidth: 2,
              pointHoverBackgroundColor: "#0f1722",
            },
          ],
        }}
      />
    </div>
  );
}
