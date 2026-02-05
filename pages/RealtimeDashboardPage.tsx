import { useEffect, useState, useMemo } from "react";
import { apiService, Endpoint } from "../services/api";
import { useRealtimeDevices } from "../hooks/useRealtimeDevices";
import RealtimeMapAll from "@/components/RealtimeMapAll";
import Loading from "../components/Loading";
import SensorHistoryChart from "@/components/SensorHistoryChart";
import ReactCardFlip from "react-card-flip";
import Select from "react-select";


interface Option {
  label: string;
  value: string;
}

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

  /* STATES */
  const [activeDeviceId, setActiveDeviceId] = useState<string | null>(null);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [flipped, setFlipped] = useState(false);

  /* LIVE DEVICE DATA */
  const devices = useRealtimeDevices(selectedGroup, selectedDevices);

  const filteredDevices = useMemo(() => {
  const result: Record<string, any> = {};
  selectedDevices.forEach((id) => {
    if (devices[id]) {
      result[id] = devices[id];
    }
  });
  return result;
}, [devices, selectedDevices]);

const isRealtimeLoading =
  selectedGroup &&
  selectedDevices.length > 0 &&
  Object.keys(filteredDevices).length === 0;



  /* STABLE DEVICE ORDER */
const activeDeviceIds = useMemo(
  () => Object.keys(filteredDevices).sort(),
  [filteredDevices]
);


  /* RESET FOCUS WHEN GROUP CHANGES */
  useEffect(() => {
    setSelectedDeviceId(null);
    setActiveDeviceId(null);
    setFlipped(false);
    setAutoRotate(true);
  }, [selectedGroup]);

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

  /* SAFE DEVICE FOCUS LOGIC */
  const focusedDeviceId = useMemo(() => {
    if (selectedDeviceId && devices[selectedDeviceId]) {
      return selectedDeviceId;
    }

    if (activeDeviceId && devices[activeDeviceId]) {
      return activeDeviceId;
    }

    return activeDeviceIds[0] ?? null;
  }, [selectedDeviceId, activeDeviceId, activeDeviceIds, devices]);

  const focusedDevice = focusedDeviceId
    ? filteredDevices[focusedDeviceId]
    : null;

  /* AGGREGATE VALUES */
  const aggregate = useMemo(
    () => calculateAverages(filteredDevices),
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

if (loading || isRealtimeLoading) {
  return <Loading fullScreen text="Loading realtime dashboard..." />;
}


  return (
    <div className="p-6 space-y-4 bg-gray-50 dark:bg-gray-900">

      {/* TOP FILTER BAR */}
      <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-3 rounded-xl shadow">
<Select
  options={groups.map((g: any) => ({
    label: g.name,
    value: g.id,
  }))}
  value={
    groups
      .map((g: any) => ({
        label: g.name,
        value: g.id,
      }))
      .find((g) => g.value === selectedGroup) || null
  }
  onChange={(opt) =>
    setSelectedGroup((opt as Option)?.value || "")
  }
  placeholder="Select Group"
  className="w-64"
/>


<Select
  isMulti
  options={groupDevices.map((id) => ({
    label: id,
    value: id,
  }))}
  value={selectedDevices.map((id) => ({
    label: id,
    value: id,
  }))}
  onChange={(opts) =>
    setSelectedDevices(
      (opts as Option[]).map((o) => o.value)
    )
  }
  placeholder="Select Devices"
  className="w-full min-w-[400px]"
  styles={{
    valueContainer: (base) => ({
      ...base,
      maxHeight: "120px",
      overflowY: "auto",
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
    }),
  }}
/>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-[3fr_2fr] gap-4">

        {/* LIVE MAP */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
          <h2 className="font-semibold mb-2">Live Map</h2>
          <div className="h-[400px] rounded overflow-hidden">
            <RealtimeMapAll
            devices={filteredDevices}
              activeId={focusedDeviceId}
              onMarkerClick={(id: string) => {
                setSelectedDeviceId(id);
                setAutoRotate(false);
                setFlipped(true);
              }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-6">
  <ReactCardFlip isFlipped={flipped} flipDirection="horizontal">

    {/* ---------------- FRONT SIDE (CARDS) ---------------- */}
    <div className="space-y-6">

      {/* AGGREGATE */}
      <div>
        <h2 className="text-lg font-semibold mb-3 text-center">
          AGGREGATE
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow p-8 flex items-center justify-center text-center">
            <div>
              <div className="text-gray-500 text-xl">PM 2.5</div>
              <div className="text-5xl font-bold">
                {aggregate.pm25}
                <span className="text-base font-normal ml-1">µg/m³</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <SensorCard label="Temperature" value={aggregate.temp} unit="°C" />
            <SensorCard label="Humidity" value={aggregate.humidity} unit="%" />
            <SensorCard label="PM 1" value={aggregate.pm25} unit="µg/m³" />
            <SensorCard label="PM 10" value={aggregate.pm10} unit="µg/m³" />
          </div>
        </div>
      </div>

      {/* DEVICE */}
      <div>
        <h2 className="text-lg font-semibold text-center mb-3">
          {focusedDeviceId || "Device"}
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid grid-cols-2 gap-4">
            <SensorCard label="PM 1" value={focusedDevice?.sPM2 ?? "--"} unit="µg/m³" />
            <SensorCard label="PM 10" value={focusedDevice?.sPM10 ?? "--"} unit="µg/m³" />
            <SensorCard label="Temperature" value={focusedDevice?.temp ?? "--"} unit="°C" />
            <SensorCard label="Humidity" value={focusedDevice?.rh ?? "--"} unit="%" />
          </div>

          <div className="bg-white rounded-xl shadow p-8 flex items-center justify-center text-center">
            <div>
              <div className="text-gray-500 text-xl">PM 2.5</div>
              <div className="text-5xl font-bold">
                {focusedDevice?.sPM2 ?? "--"}
                <span className="text-base font-normal ml-1">µg/m³</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

    {/* ---------------- BACK SIDE (CHART) ---------------- */}
    <div className="bg-white rounded-xl shadow p-3 h-[420px]">
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

  </ReactCardFlip>
</div>




      </div>
    </div>
  );
};

const SensorCard = ({
  label,
  value,
  unit,
}: {
  label: string;
  value: string | number;
  unit?: string;
}) => (
  <div className="bg-white rounded-xl shadow p-4 text-center">
    <div className="text-sm text-gray-500">{label}</div>
    <div className="text-2xl font-bold">
      {value}
      {unit && <span className="text-sm font-normal ml-1">{unit}</span>}
    </div>
  </div>
);

export default RealtimeDashboardPage;