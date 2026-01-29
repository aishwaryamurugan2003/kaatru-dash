import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";

export default function RealtimeChart({ value }: { value?: number }) {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    if (value === undefined || isNaN(value)) return;

    setData((prev) => {
      const newData = [...prev, { time: new Date().toLocaleTimeString(), value }];
      return newData.slice(-60); // last 60 points
    });
  }, [value]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <XAxis dataKey="time" hide />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="value" stroke="#2563eb" dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
