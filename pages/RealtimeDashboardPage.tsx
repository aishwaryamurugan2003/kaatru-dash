import React, { useEffect, useState, useMemo } from "react";
import { apiService, Endpoint } from "../services/api";
import { useRealtimeDevices } from "../hooks/useRealtimeDevices";
import RealtimeChart from "../components/RealtimeChart";
import RealtimeMapAll from "@/components/RealtimeMapAll";
import Loading from "../components/Loading";

const RealtimeDashboardPage: React.FC = () => {
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [groupDevices, setGroupDevices] = useState<string[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // LIVE DEVICE DATA
  const devices = useRealtimeDevices(selectedGroup, selectedDevices);

  /* ACTIVE DEVICE IDS (STABLE ORDER) */
  const activeDeviceIds = useMemo(() => {
    return Object.keys(devices).sort();
  }, [devices]);

  const currentDeviceId = activeDeviceIds[currentIndex];
  const device = devices[currentDeviceId];

  /* ------------------------------------------------------------
      FETCH GROUPS
  ------------------------------------------------------------ */
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        const res: any = await apiService.get(Endpoint.GROUP_ALL);
        setGroups(Array.isArray(res.data) ? res.data : res.data.group || []);
      } catch (err) {
        console.error("Failed to load groups", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  /* ------------------------------------------------------------
      FETCH DEVICES WHEN GROUP SELECTED
  ------------------------------------------------------------ */
  useEffect(() => {
    if (!selectedGroup) return;

    const fetchDevices = async () => {
      try {
        setLoading(true);
        const res: any = await apiService.get(
          Endpoint.GROUP_DEVICES,
          { id: selectedGroup }
        );

        const devices = res.data.devices || [];
        setGroupDevices(devices);

        // Auto-select all devices
        setSelectedDevices(devices);
        setCurrentIndex(0);
      } catch (err) {
        console.error("Failed to load group devices", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, [selectedGroup]);

  /* ------------------------------------------------------------
      ROTATE DEVICE EVERY 5 SECONDS
  ------------------------------------------------------------ */
  useEffect(() => {
    if (activeDeviceIds.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) =>
        prev + 1 >= activeDeviceIds.length ? 0 : prev + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [activeDeviceIds.length]);

  /* SAFETY RESET */
  useEffect(() => {
    if (currentIndex >= activeDeviceIds.length) {
      setCurrentIndex(0);
    }
  }, [activeDeviceIds, currentIndex]);

  function toggleDevice(id: string) {
    setSelectedDevices((prev) =>
      prev.includes(id)
        ? prev.filter((d) => d !== id)
        : [...prev, id]
    );
  }

  /* ------------------------------------------------------------
      LOADING SCREEN
  ------------------------------------------------------------ */
  if (loading) {
    return <Loading fullScreen text="Loading realtime dashboard..." />;
  }

  return (
    <div className="p-6 space-y-4 bg-gray-50 dark:bg-gray-900">

      {/* TOP FILTER BAR */}
      <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-3 rounded-xl shadow">
        <select
          className="border p-2 rounded"
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
        >
          <option value="">Select Group</option>
          {groups.map((g: any) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>

        <div className="flex gap-2 flex-wrap">
          {groupDevices.map((id) => (
            <button
              key={id}
              onClick={() => toggleDevice(id)}
              className={`px-3 py-1 rounded ${
                selectedDevices.includes(id)
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200"
              }`}
            >
              {id}
            </button>
          ))}
        </div>
      </div>

      {/* DEBUG INFO */}
      <div className="flex gap-6 text-sm font-bold">
        <div className="text-green-600">
          Active Devices: {activeDeviceIds.length}
        </div>
        <div className="text-blue-600">
          Showing Device: {currentDeviceId || "--"}
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="flex gap-4">

        {/* LIVE MAP */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow p-2">
          <h2 className="font-semibold mb-2">Live Map</h2>
          <div className="h-[400px] rounded overflow-hidden">
            <RealtimeMapAll
              key={selectedGroup} 
              devices={devices}
              activeId={currentDeviceId}
            />
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-[450px] flex flex-col gap-4">

          {/* SENSOR CARDS */}
          <div className="grid grid-cols-2 gap-3">
            <SensorCard label="PM2.5" value={device?.sPM2 ?? "--"} />
            <SensorCard label="PM10" value={device?.sPM10 ?? "--"} />
            <SensorCard label="Temp" value={device?.temp ?? "--"} />
            <SensorCard label="Humidity" value={device?.rh ?? "--"} />

            {device?.nh3_ppm && <SensorCard label="NH3" value={device.nh3_ppm} />}
            {device?.co_ppb && <SensorCard label="CO" value={device.co_ppb} />}
            {device?.so2_ppb && <SensorCard label="SO2" value={device.so2_ppb} />}
            {device?.no2_ppb && <SensorCard label="NO2" value={device.no2_ppb} />}
            {device?.o3_ppb_compensated && (
              <SensorCard label="O3" value={device.o3_ppb_compensated} />
            )}
            {device?.k30Co2 && <SensorCard label="CO2" value={device.k30Co2} />}
          </div>

          {/* LIVE CHART */}
          <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow p-3">
            <h2 className="font-semibold mb-2">
              Last 5 Minutes (PM2.5)
            </h2>
            <div className="h-[250px]">
              <RealtimeChart value={Number(device?.sPM2)} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

const SensorCard = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-3">
    <div className="text-sm text-gray-500">{label}</div>
    <div className="text-xl font-bold">{value}</div>
  </div>
);

export default RealtimeDashboardPage;
