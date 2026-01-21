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
              backgroundColor: `${color}33`,
              tension: 0.35,
              fill: true,
              pointRadius: 3,
            },
          ],
        }}
      />
    </div>
  );
}
