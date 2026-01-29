import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

export default function RealtimeMap({ lat, lon }: { lat?: number; lon?: number }) {
  if (!lat || !lon) {
    return <div className="h-full flex items-center justify-center">No GPS Data</div>;
  }

  return (
    <MapContainer center={[lat, lon]} zoom={12} style={{ height: "100%", width: "100%" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={[lat, lon]} icon={markerIcon}>
        <Popup>Device Location</Popup>
      </Marker>
    </MapContainer>
  );
}
