/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  BarChart,
  Bar,
  ComposedChart
} from "recharts";
import { useTheme } from "../context/ThemeContext";

interface ProgressChartProps {
  data: any[];
  dataKey: string;
  label: string;
  color?: string;
  unit?: string;
  chartType?: "line" | "bar" | "composed";
  targetLineValue?: number;
  secondaryDataKey?: string;
}

export default function ProgressChart({
  data,
  dataKey,
  label,
  color = "#4f46e5",
  unit = "",
  chartType = "line",
  targetLineValue,
  secondaryDataKey
}: ProgressChartProps) {
  const { theme } = useTheme();
  const isLight = theme === "light";

  // Grid line color: distinct and visible in light mode
  const gridColor = isLight ? "#D1D5DB" : "#334155";
  // Axis lines & tick text colors: near black in light mode for excellent readability
  const textColor = isLight ? "#111827" : "#A3A3A3";

  if (!data || data.length === 0) {
    return (
      <div className="h-[220px] flex items-center justify-center border border-[var(--border)] rounded-xl bg-slate-50/50 dark:bg-slate-900/40 text-xs text-[var(--text-secondary)] font-medium">
        No progress data available yet. Keep tracking to log your records!
      </div>
    );
  }

  // Format date readable
  const formattedData = data.map((d) => {
    let formattedDate = d.date;
    try {
      const parts = d.date.split("-");
      if (parts.length === 3) {
        // MM/DD
        formattedDate = `${parts[1]}/${parts[2]}`;
      }
    } catch (_) {}
    return {
      ...d,
      formattedDate
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3.5 rounded-xl border border-slate-800 text-xs shadow-xl space-y-1">
          <p className="font-extrabold text-slate-400">Date: {label}</p>
          {payload.map((p: any, k: number) => (
            <p key={k} className="font-bold flex items-center space-x-1" style={{ color: p.color || "#818cf8" }}>
              <span>{p.name}:</span>
              <span>{p.value} {unit}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-[230px] w-full text-xs">
      <ResponsiveContainer width="100%" height="100%">
        {chartType === "line" ? (
          <LineChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} className="opacity-60" />
            <XAxis
              dataKey="formattedDate"
              stroke={textColor}
              tick={{ fill: textColor, fontWeight: 600 }}
              tickLine={false}
              axisLine={false}
              dy={10}
              className="font-semibold"
            />
            <YAxis
              stroke={textColor}
              tick={{ fill: textColor, fontWeight: 600 }}
              tickLine={false}
              axisLine={false}
              dx={-5}
              domain={["auto", "auto"]}
              className="font-semibold"
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey={dataKey}
              name={label}
              stroke={isLight && (color === "#4f46e5" || color === "indigo") ? "#312e81" : color} // Darker indigo in light mode for better contrast
              strokeWidth={2.5}
              activeDot={{ r: 6 }}
              dot={{ r: 2 }}
              animationDuration={500}
            />
            {targetLineValue !== undefined && (
              <ReferenceLine
                y={targetLineValue}
                stroke="#dc2626"
                strokeDasharray="4 4"
                label={{ value: "Target", fill: textColor, position: "right", fontSize: 10, fontWeight: "bold" }}
              />
            )}
          </LineChart>
        ) : chartType === "bar" ? (
          <BarChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} className="opacity-60" />
            <XAxis
              dataKey="formattedDate"
              stroke={textColor}
              tick={{ fill: textColor, fontWeight: 600 }}
              tickLine={false}
              axisLine={false}
              dy={10}
              className="font-semibold"
            />
            <YAxis
              stroke={textColor}
              tick={{ fill: textColor, fontWeight: 600 }}
              tickLine={false}
              axisLine={false}
              dx={-5}
              domain={["auto", "auto"]}
              className="font-semibold"
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey={dataKey} 
              name={label} 
              fill={isLight && (color === "#f43f5e" || color === "rose") ? "#be123c" : color} // Darker rose/pink in light mode for readability
              radius={[4, 4, 0, 0]} 
              maxBarSize={30} 
            />
          </BarChart>
        ) : (
          <ComposedChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} className="opacity-60" />
            <XAxis
              dataKey="formattedDate"
              stroke={textColor}
              tick={{ fill: textColor, fontWeight: 600 }}
              tickLine={false}
              axisLine={false}
              dy={10}
              className="font-semibold"
            />
            <YAxis
              stroke={textColor}
              tick={{ fill: textColor, fontWeight: 600 }}
              tickLine={false}
              axisLine={false}
              dx={-5}
              domain={[0, "auto"]}
              className="font-semibold"
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey={dataKey} 
              name={label} 
              fill={color} 
              opacity={isLight ? 0.9 : 0.7} 
              radius={[4, 4, 0, 0]} 
              maxBarSize={25} 
            />
            {secondaryDataKey && (
              <Line
                type="monotone"
                dataKey={secondaryDataKey}
                name="Calorie Goal"
                stroke={isLight ? "#047857" : "#10b981"} // Darker emerald in light mode
                strokeWidth={2.5}
                dot={false}
              />
            )}
            {targetLineValue !== undefined && (
              <ReferenceLine
                y={targetLineValue}
                stroke={isLight ? "#047857" : "#10b981"}
                strokeWidth={1.5}
                strokeDasharray="3 3"
              />
            )}
          </ComposedChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
