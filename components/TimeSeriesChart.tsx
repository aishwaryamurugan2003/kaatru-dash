
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
} from 'recharts';
import { ChartSeries } from '../types';

interface TimeSeriesChartProps {
  data: ChartSeries[];
  loading: boolean;
}

const COLORS = ['#3b82f6', '#16a34a', '#f97316', '#ef4444', '#8b5cf6'];

const ChartSkeleton: React.FC = () => (
  <div className="w-full h-full bg-gray-200 dark:bg-gray-700 animate-pulse rounded-md"></div>
);

const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({ data, loading }) => {
  if (loading) {
    return <ChartSkeleton />;
  }

  if (!data || data.length === 0 || data.every(series => series.data.length === 0)) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
        <p>No data to display. Please select a device.</p>
      </div>
    );
  }

  // Combine all data points for a unified timeline on the X-axis
  const allPoints = data.flatMap(series => series.data);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
        <XAxis
          dataKey="dTS"
          type="number"
          domain={['dataMin', 'dataMax']}
          tickFormatter={(unixTime) => new Date(unixTime).toLocaleTimeString()}
          stroke="currentColor"
          tick={{ fill: 'currentColor', fontSize: 12 }}
        />
        <YAxis 
          label={{ value: 'PM2.5', angle: -90, position: 'insideLeft', fill: 'currentColor' }}
          stroke="currentColor"
          tick={{ fill: 'currentColor', fontSize: 12 }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(31, 41, 55, 0.8)',
            borderColor: 'rgba(75, 85, 99, 0.8)',
            color: '#fff',
            borderRadius: '0.5rem'
          }}
          labelFormatter={(label) => new Date(label).toLocaleString()}
        />
        <Legend />
        {data.map((series, index) => (
          <Line
            key={series.deviceId}
            type="monotone"
            data={series.data}
            dataKey="sPM2"
            name={series.deviceId}
            stroke={COLORS[index % COLORS.length]}
            strokeWidth={2}
            dot={false}
          />
        ))}
         <Brush dataKey="dTS" height={30} stroke="#3b82f6" tickFormatter={(unixTime) => new Date(unixTime).toLocaleTimeString()} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default TimeSeriesChart;
