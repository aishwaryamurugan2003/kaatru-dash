import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

const normalIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const activeIcon = new L.Icon({
  iconUrl: "https://maps.gstatic.com/mapfiles/ms2/micons/blue-dot.png",
});

export default function RealtimeMapAll({ devices, activeId }: any) {
  const deviceList = Object.values(devices) as any[];

  if (deviceList.length === 0) {
    return <div className="h-full flex items-center justify-center">No Devices</div>;
  }

  const first = deviceList[0];

  return (
    <MapContainer center={[first.lat, first.lon]} zoom={12} style={{ height: "100%", width: "100%" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

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
