import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import { LatLngTuple } from "leaflet";
import { useEffect } from "react";
import { DeviceData } from "../types/device";

interface Props {
  devices: DeviceData[];
  activeIndex: number;
}

/* 🔥 Auto fly-to component */
function FlyToDevice({ center }: { center: LatLngTuple }) {
  const map = useMap();

  useEffect(() => {
    if (!center) return;
    map.flyTo(center, 14, { duration: 2 });
  }, [center]);

  return null;
}

export default function MapView({ devices, activeIndex }: Props) {

  // ✅ Safe fallback center
  const center: LatLngTuple =
    devices.length > 0 && devices[activeIndex]
      ? [devices[activeIndex].lat, devices[activeIndex].lon]
      : [13.0827, 80.2707]; // Chennai fallback

  return (
    // ✅ IMPORTANT: Wrapper div OUTSIDE MapContainer
    <div style={{ width: "100%", height: "100vh" }}>

      <MapContainer
        center={center}
        zoom={14}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom
      >
        {/* Auto move map */}
        <FlyToDevice center={center} />

        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Render Markers */}
        {devices.map((d) => {
          if (!d.lat || !d.lon) return null;

          return (
            <Marker
              key={d.id}
              position={[d.lat, d.lon] as LatLngTuple}
            />
          );
        })}

      </MapContainer>
    </div>
  );
}
