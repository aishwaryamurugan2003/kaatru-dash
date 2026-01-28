import { useEffect, useMemo, useState } from "react";
import MapView from "../components/MapView";
import DeviceInfoPanel from "../components/DeviceInfoPanel";
import LiveChart from "../components/LiveChart";
import { useDeviceWebSocket } from "../hooks/useDeviceWebSocket";
import { useDeviceList } from "../hooks/useDeviceList";
import { DeviceData } from "../types/device";

export default function DataVisualizationPage() {

  // ✅ Dynamic Group
  const groupId = "GUR";

  // ✅ Load devices + mqtt topic automatically
  const { deviceIds, mqttTopic } = useDeviceList(groupId);

  // ✅ Live WS data
  const liveDevices = useDeviceWebSocket(deviceIds, mqttTopic);

  // ✅ Filter active devices (10 sec heartbeat)
  const deviceList: DeviceData[] = useMemo(() => {
    const now = Date.now();
    return Object.values(liveDevices).filter(d =>
      d?.lat &&
      d?.lon &&
      now - d.srvtime < 10000
    );
  }, [liveDevices]);

  const [index, setIndex] = useState(0);
  const [history, setHistory] = useState<DeviceData[]>([]);

  const activeDevice = deviceList[index];

  // 🔄 Rotate active device
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
      <div style={{ width: "50%", height: "100%" }}>
        <MapView devices={deviceList} activeIndex={index} />
      </div>

      {/* RIGHT PANEL */}
      <div style={{ width: "50%", display: "flex", flexDirection: "column" }}>

        <div style={{ height: "25%", borderBottom: "1px solid #ddd" }}>
          <DeviceInfoPanel device={activeDevice} />
        </div>

        <div style={{ height: "25%" }}>
          <LiveChart history={history} />
        </div>

        <div style={{ height: "50%", background: "#fafafa", padding: 10 }}>
          Active Devices: <b>{deviceList.length}</b>
          <br />
          Loaded Devices: {deviceIds.join(", ")}
          <br />
          MQTT Topic: {mqttTopic}
        </div>

      </div>
    </div>
  );
}
