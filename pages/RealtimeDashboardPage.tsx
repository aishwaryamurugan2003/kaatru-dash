import { useEffect, useState, useMemo } from "react";
import { apiService, Endpoint } from "../services/api";
import { useRealtimeDevices } from "../hooks/useRealtimeDevices";
import RealtimeMapAll from "@/components/RealtimeMapAll";
import Loading from "../components/Loading";
import SensorHistoryChart from "@/components/SensorHistoryChart";

/* ---------------------------------------------
   UTILS
--------------------------------------------- */
function calculateAverages(devices: Record<string, any>) {
  const list = Object.values(devices);

  const avg = (key: string) => {
    const vals = list
      .map((d: any) => d?.[key])
      .filter((v) => typeof v === "number");
    if (!vals.length) return "--";
    return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
  };

  return {
    pm25: avg("sPM2"),
    pm10: avg("sPM10"),
    temp: avg("temp"),
    humidity: avg("rh"),
  };
}

const RealtimeDashboardPage: React.FC = () => {
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [groupDevices, setGroupDevices] = useState<string[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  /* 🔥 NEW STATES */
  const [activeDeviceId, setActiveDeviceId] = useState<string | null>(null);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [flipped, setFlipped] = useState(false);

  /* LIVE DEVICE DATA */
  const devices = useRealtimeDevices(selectedGroup, selectedDevices);

  /* STABLE DEVICE ORDER */
  const activeDeviceIds = useMemo(
    () => Object.keys(devices).sort(),
    [devices]
  );

  /* AUTO-ROTATE DEVICE */
  useEffect(() => {
    if (!autoRotate || activeDeviceIds.length === 0) return;

    const interval = setInterval(() => {
      setActiveDeviceId((prev) => {
        const idx = prev
          ? activeDeviceIds.indexOf(prev)
          : 0;
        return activeDeviceIds[(idx + 1) % activeDeviceIds.length];
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRotate, activeDeviceIds]);

  /* SAFETY RESET */
  useEffect(() => {
    if (
      activeDeviceId &&
      !activeDeviceIds.includes(activeDeviceId)
    ) {
      setActiveDeviceId(activeDeviceIds[0] ?? null);
    }
  }, [activeDeviceIds, activeDeviceId]);

  /* DEVICE IN FOCUS */
  const focusedDeviceId =
    selectedDeviceId ?? activeDeviceId ?? activeDeviceIds[0];

  const focusedDevice = focusedDeviceId
    ? devices[focusedDeviceId]
    : null;

  /* AGGREGATE VALUES */
  const aggregate = useMemo(
    () => calculateAverages(devices),
    [devices]
  );

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

        const devs = res.data.devices || [];
        setGroupDevices(devs);
        setSelectedDevices(devs);
        setActiveDeviceId(devs[0] ?? null);
        setSelectedDeviceId(null);
        setAutoRotate(true);
        setFlipped(false);
      } catch (err) {
        console.error("Failed to load group devices", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDevices();
  }, [selectedGroup]);

  function toggleDevice(id: string) {
    setSelectedDevices((prev) =>
      prev.includes(id)
        ? prev.filter((d) => d !== id)
        : [...prev, id]
    );
  }

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

      {/* MAIN GRID */}
      <div className="flex gap-4">

        {/* LIVE MAP */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow p-2">
          <h2 className="font-semibold mb-2">Live Map</h2>
          <div className="h-[400px] rounded overflow-hidden">
            <RealtimeMapAll
              devices={devices}
              activeId={focusedDeviceId}
              onMarkerClick={(id: string) => {
                setSelectedDeviceId(id);
                setAutoRotate(false);
                setFlipped(true);
              }}
            />
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-[450px] flex flex-col gap-4">
          {!flipped ? (
  /* -------- AGGREGATE -------- */
  <div className="grid grid-cols-2 gap-3">
    <SensorCard label="PM2.5 (Avg)" value={aggregate.pm25} />
    <SensorCard label="PM10 (Avg)" value={aggregate.pm10} />
    <SensorCard label="Temp (Avg)" value={aggregate.temp} />
    <SensorCard label="Humidity (Avg)" value={aggregate.humidity} />

    <SensorCard label="PM2.5" value={focusedDevice?.sPM2 ?? "--"} />
    <SensorCard label="PM10" value={focusedDevice?.sPM10 ?? "--"} />
    <SensorCard label="Temp" value={focusedDevice?.temp ?? "--"} />
    <SensorCard label="Humidity" value={focusedDevice?.rh ?? "--"} />
  </div>
) : (
  /* -------- CHART -------- */
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-3 h-[350px]">
    <div className="flex justify-between mb-2">
      <h2 className="font-semibold">
        Device History ({focusedDeviceId})
      </h2>
      <button
        className="text-blue-600 text-sm"
        onClick={() => {
          setFlipped(false);
          setSelectedDeviceId(null);
          setAutoRotate(true);
        }}
      >
        Back
      </button>
    </div>

    <SensorHistoryChart deviceId={focusedDeviceId} />
  </div>
)}

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
