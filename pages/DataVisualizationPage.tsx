import { useEffect, useMemo, useState } from "react";
import MapView from "../components/MapView";
import DeviceInfoPanel from "../components/DeviceInfoPanel";
import LiveChart from "../components/LiveChart";

import { useDeviceWebSocket } from "../hooks/useDeviceWebSocket";
import { useDeviceList } from "../hooks/useDeviceList";
import { useDeviceDetails } from "../hooks/useDeviceDetails";
import { DeviceData } from "../types/device";

export default function DataVisualizationPage() {

  // ✅ Dynamic Group
  const groupId = "GUR";

  // ✅ Load devices + mqtt topic
  const { deviceIds, mqttTopic } = useDeviceList(groupId);

  // ✅ Live WebSocket data
  const liveDevices = useDeviceWebSocket(deviceIds, mqttTopic);

  // ✅ Static GPS (like Flutter app)
  const staticGps = useDeviceDetails(deviceIds);

  // ✅ Merge WS + Static GPS
  const deviceList: DeviceData[] = useMemo(() => {
    const now = Date.now();

    return Object.values(liveDevices)
      .map(d => {
        const gps = staticGps[d.id];
        return {
          ...d,
          lat: d.lat || gps?.lat,
          lon: d.lon || gps?.lon,
        };
      })
      .filter(d => d.lat && d.lon); // ✅ Only require GPS (NOT srvtime)
  }, [liveDevices, staticGps]);

  const [index, setIndex] = useState(0);
  const [history, setHistory] = useState<DeviceData[]>([]);

  const activeDevice = deviceList[index];

  // 🔄 Rotate devices
  useEffect(() => {
    if (!deviceList.length) return;

    const timer = setInterval(() => {
      setIndex(i => (i + 1) % deviceList.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [deviceList]);

  // 📊 Chart history
  useEffect(() => {
    if (!activeDevice) return;
    setHistory(h => [...h.slice(-100), activeDevice]);
  }, [activeDevice]);

  return (
    <div style={{ display: "flex", height: "100vh", width: "100%" }}>

      {/* MAP */}
      <div style={{ width: "50%", height: "100vh" }}>
        <MapView devices={deviceList} activeIndex={index} />
      </div>

      {/* RIGHT PANEL */}
      <div style={{ width: "50%", display: "flex", flexDirection: "column" }}>

        {/* Device Info */}
        <div style={{ height: "25%", borderBottom: "1px solid #ddd" }}>
          <DeviceInfoPanel device={activeDevice} />
        </div>

        {/* Live Chart */}
        <div style={{ height: "25%" }}>
          <LiveChart history={history} />
        </div>

        {/* Debug Panel */}
        <div style={{ height: "50%", background: "#fafafa", padding: 10, fontSize: 12 }}>
          <b>DEBUG INFO</b>
          <br />
          Group ID: {groupId}
          <br />
          MQTT Topic: {mqttTopic}
          <br />
          Total Devices Loaded: {deviceIds.length}
          <br />
          Devices With GPS (Shown on Map): {deviceList.length}
          <br />
          Active Device Index: {index}
          <br />
          Active Device ID: {activeDevice?.id || "None"}
        </div>

      </div>
    </div>
  );
}
