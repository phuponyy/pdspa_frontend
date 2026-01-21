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
              backgroundColor: `${color}66`,
              borderColor: color,
              borderRadius: 8,
            },
          ],
        }}
      />
    </div>
  );
}
