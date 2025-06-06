"use client";

import { useMemo } from "react";
import {
  PolarGrid,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Legend,
} from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { GeneratorData } from "@/app/types";
import {
  GenerationMixchartConfig,
  GenerationMixchartConfigSmall,
} from "@/utilities/GenerationMixChartConfig";

type CarrierType = keyof typeof GenerationMixchartConfigSmall;

interface ProcessedDataItem {
  carrier: string;
  value: string;
  percentage: string;
  fill: string;
}

const chartConfig = GenerationMixchartConfig;

interface ChartRadialProps {
  data: GeneratorData[];
  valueKey: "p_nom" | "p_nom_opt";
  title: string;
}

export function ChartRadial({ data, valueKey, title }: ChartRadialProps) {
  const processedData = useMemo(() => {
    const groupedData = data
      .filter((item) => item.carrier !== "load")
      .reduce((acc: { [key: string]: number }, item) => {
        const value = Number(item[valueKey]);
        if (!isNaN(value) && value > 0) {
          if (!acc[item.carrier]) {
            acc[item.carrier] = 0;
          }
          acc[item.carrier] += value;
        }
        return acc;
      }, {});

    const totalValue = Object.values(groupedData).reduce(
      (sum, value) => sum + value,
      0,
    );

    return Object.entries(groupedData)
      .map(([carrier, value]) => {
        const carrierKey = carrier.toLowerCase() as CarrierType;
        const percentage = (value / totalValue) * 100;

        return {
          carrier,
          value: value.toFixed(2),
          actualValue: value,
          percentage: percentage.toFixed(1),
          displayValue: percentage,
          fill:
            GenerationMixchartConfigSmall[carrier.toLowerCase() as CarrierType]
              ?.color || "hsl(var(--chart-1))",
        };
      })
      .sort((a, b) => b.actualValue - a.actualValue);
  }, [data, valueKey]);

  const totalValue = useMemo(() => {
    return processedData.reduce(
      (sum: number, item: ProcessedDataItem) => sum + Number(item.value),
      0,
    );
  }, [processedData]);

  const totalPercentage = useMemo(() => {
    return processedData.reduce(
      (sum: number, item: ProcessedDataItem) => sum + Number(item.percentage),
      0,
    );
  }, [processedData]);

  return (
    <>
      <ChartContainer config={chartConfig} className="w-full aspect-square">
        <RadialBarChart
          data={processedData}
          innerRadius="20%"
          outerRadius="100%"
          startAngle={180}
          endAngle={-180}
          barSize={15}
        >
          <PolarGrid gridType="circle" />
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelKey="carrier"
                formatter={(value, name, item, index) => {
                  return (
                    <>
                      <div
                        className="h-10 w-2.5 shrink-0 rounded-[2px]"
                        style={{
                          backgroundColor: item.payload.fill,
                        }}
                      />
                      <div className="flex flex-col gap-1">
                        <div className="flex gap-2">
                          <span>{`${
                            typeof item.payload.actualValue === "number"
                              ? item.payload.actualValue.toFixed(2)
                              : Number(value).toFixed(2)
                          } MW`}</span>
                        </div>
                        <span>{`${item.payload.percentage}%`}</span>
                      </div>
                    </>
                  );
                }}
              />
            }
          />
          <RadialBar
            dataKey="displayValue"
            background
            cornerRadius={5}
            label={{
              position: "outside",
              fill: "#fff",
              fontSize: 10,
              formatter: (value: number, entry: any) => {
                if (!entry?.payload?.percentage) return "";
                const percentage = Number(entry.payload.percentage);
                return percentage > 5 ? `${percentage.toFixed(1)}%` : "";
              },
            }}
          />

          <Legend
            content={<ChartRadialLegendcontent />}
            wrapperStyle={{ paddingBottom: 0, marginBottom: 0 }}
          />
        </RadialBarChart>
      </ChartContainer>
    </>
  );
}

const ChartRadialLegendcontent = (props: any) => {
  const { payload } = props;
  if (!payload || !Array.isArray(payload)) {
    return <div>No data available</div>;
  }

  return (
    <div className="flex flex-wrap gap-4 justify-center mt-2 translate-y-9">
      {payload.map((entry, index) => (
        <div key={`item-${index}`} className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-sm"
            style={{ backgroundColor: entry.payload.fill }}
          />
          <span className="text-xs">
            {entry.payload.carrier === "ror"
              ? "run of river"
              : entry.payload.carrier}{" "}
            ({entry.payload.percentage}%)
          </span>
        </div>
      ))}
    </div>
  );
};
