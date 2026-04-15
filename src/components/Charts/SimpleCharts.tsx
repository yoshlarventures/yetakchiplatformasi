import React from 'react';

// Bar Chart
interface BarChartProps {
  data: { label: string; value: number; color?: string }[];
  maxValue?: number;
  height?: number;
  showValues?: boolean;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  maxValue,
  height = 200,
  showValues = true,
}) => {
  const max = maxValue || Math.max(...data.map(d => d.value), 1);

  return (
    <div className="flex items-end justify-around gap-2" style={{ height }}>
      {data.map((item, index) => {
        const barHeight = (item.value / max) * 100;
        return (
          <div key={index} className="flex flex-col items-center flex-1 max-w-[60px]">
            <div className="relative w-full flex flex-col items-center">
              {showValues && (
                <span className="text-xs font-semibold text-gray-700 mb-1">
                  {item.value}
                </span>
              )}
              <div
                className="w-full rounded-t-lg transition-all duration-500 ease-out"
                style={{
                  height: `${Math.max(barHeight, 4)}%`,
                  backgroundColor: item.color || '#10b981',
                  minHeight: '8px',
                }}
              />
            </div>
            <span className="text-xs text-gray-500 mt-2 text-center truncate w-full">
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// Donut/Pie Chart
interface DonutChartProps {
  data: { label: string; value: number; color: string }[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string | number;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  data,
  size = 160,
  thickness = 24,
  centerLabel,
  centerValue,
}) => {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  let cumulativePercent = 0;

  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={thickness}
        />
        {/* Data segments */}
        {data.map((item, index) => {
          const percent = total > 0 ? item.value / total : 0;
          const strokeDasharray = `${percent * circumference} ${circumference}`;
          const strokeDashoffset = -cumulativePercent * circumference;
          cumulativePercent += percent;

          return (
            <circle
              key={index}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={item.color}
              strokeWidth={thickness}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          );
        })}
      </svg>
      {(centerLabel || centerValue) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {centerValue && (
            <span className="text-2xl font-bold text-gray-900">{centerValue}</span>
          )}
          {centerLabel && (
            <span className="text-xs text-gray-500">{centerLabel}</span>
          )}
        </div>
      )}
    </div>
  );
};

// Legend
interface LegendProps {
  items: { label: string; value: number; color: string }[];
  showPercentage?: boolean;
}

export const ChartLegend: React.FC<LegendProps> = ({ items, showPercentage = false }) => {
  const total = items.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm text-gray-600">{item.label}</span>
          </div>
          <span className="text-sm font-medium text-gray-900">
            {item.value}
            {showPercentage && total > 0 && (
              <span className="text-gray-400 ml-1">
                ({Math.round((item.value / total) * 100)}%)
              </span>
            )}
          </span>
        </div>
      ))}
    </div>
  );
};

// Progress Bar
interface ProgressBarProps {
  value: number;
  max: number;
  color?: string;
  label?: string;
  showValue?: boolean;
  height?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max,
  color = '#10b981',
  label,
  showValue = true,
  height = 8,
}) => {
  const percent = max > 0 ? Math.min((value / max) * 100, 100) : 0;

  return (
    <div>
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-1">
          {label && <span className="text-sm text-gray-600">{label}</span>}
          {showValue && (
            <span className="text-sm font-medium text-gray-900">
              {value} / {max}
            </span>
          )}
        </div>
      )}
      <div
        className="w-full bg-gray-200 rounded-full overflow-hidden"
        style={{ height }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${percent}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
};

// Mini Stat Card with trend
interface MiniStatProps {
  label: string;
  value: number | string;
  trend?: number;
  trendLabel?: string;
  icon?: React.ReactNode;
  color?: string;
}

export const MiniStat: React.FC<MiniStatProps> = ({
  label,
  value,
  trend,
  trendLabel,
  icon,
  color = '#10b981',
}) => {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-500">{label}</span>
        {icon && (
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${color}20` }}
          >
            {icon}
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {trend !== undefined && (
        <div className="flex items-center gap-1 mt-1">
          <span
            className={`text-xs font-medium ${
              trend >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
          {trendLabel && (
            <span className="text-xs text-gray-400">{trendLabel}</span>
          )}
        </div>
      )}
    </div>
  );
};

// Timeline/Horizontal Progress
interface TimelineItem {
  label: string;
  value: number;
  color: string;
}

interface HorizontalBarChartProps {
  data: TimelineItem[];
  maxValue?: number;
}

export const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({
  data,
  maxValue,
}) => {
  const max = maxValue || Math.max(...data.map(d => d.value), 1);

  return (
    <div className="space-y-3">
      {data.map((item, index) => (
        <div key={index}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-600">{item.label}</span>
            <span className="text-sm font-semibold text-gray-900">{item.value}</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(item.value / max) * 100}%`,
                backgroundColor: item.color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};
