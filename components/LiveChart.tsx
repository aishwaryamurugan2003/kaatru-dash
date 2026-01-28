import { LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";
import { DeviceData } from "../types/device";

export default function LiveChart({ history }: { history: DeviceData[] }) {
  return (
    <LineChart width={400} height={250} data={history}>
      <XAxis dataKey="srvtime" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="sPM2" stroke="#00ff00" />
      <Line type="monotone" dataKey="temp" stroke="#ff0000" />
    </LineChart>
  );
}
