import { DeviceData } from "../types/device";

export default function DeviceInfoPanel({ device }: { device?: DeviceData }) {
  if (!device) return <div>No Device Selected</div>;

  return (
    <div style={{ padding: 10 }}>
      <h3>{device.id}</h3>
      <p>PM2.5: {device.sPM2}</p>
      <p>PM10: {device.sPM10}</p>
      <p>Temp: {device.temp} °C</p>
      <p>Humidity: {device.rh} %</p>
    </div>
  );
}
