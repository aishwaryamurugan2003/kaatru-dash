import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";

const normalIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const activeIcon = new L.Icon({
  iconUrl: "https://maps.gstatic.com/mapfiles/ms2/micons/blue-dot.png",
});

/* 🔥 AUTO FIT MAP TO ALL DEVICES */
function FitBounds({ devices }: any) {
  const map = useMap();

  useEffect(() => {
    const points = Object.values(devices)
      .filter((d: any) => d?.lat && d?.lon)
      .map((d: any) => [d.lat, d.lon] as [number, number]);

    if (points.length === 0) return;

    const bounds = L.latLngBounds(points);

    map.fitBounds(bounds, {
      padding: [50, 50],
      animate: true,
    });
  }, [devices, map]);

  return null;
}

export default function RealtimeMapAll({ devices, activeId }: any) {
  const deviceList = Object.values(devices) as any[];

  if (deviceList.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        No Devices
      </div>
    );
  }

  return (
    <MapContainer
      center={[20, 78]} // fallback only
      zoom={5}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* ✅ Auto zoom to show ALL devices */}
      <FitBounds devices={devices} />

      {deviceList.map((d) => (
        <Marker
          key={d.id}
          position={[d.lat, d.lon]}
          icon={d.id === activeId ? activeIcon : normalIcon}
        >
          <Popup>{d.id}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
