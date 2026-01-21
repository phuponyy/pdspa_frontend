"use client";

import { Doughnut } from "react-chartjs-2";
import { registerCharts } from "./chartConfig";

export default function DoughnutChart({
  labels,
  data,
  colors,
}: {
  labels: string[];
  data: number[];
  colors: string[];
}) {
  registerCharts();
  return (
    <div className="h-56 w-full">
      <Doughnut
        data={{
          labels,
          datasets: [
            {
              data,
              backgroundColor: colors,
              borderWidth: 0,
            },
          ],
        }}
        options={{
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "bottom", labels: { color: "#cbd5f5", font: { size: 11 } } },
          },
        }}
      />
    </div>
  );
}
