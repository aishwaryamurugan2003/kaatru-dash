import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import * as L from "leaflet";
import { useEffect } from "react";

/* ---------------------------------------------
   MARKER ICONS
--------------------------------------------- */
const normalIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const activeIcon = new L.Icon({
  iconUrl: "https://maps.gstatic.com/mapfiles/ms2/micons/blue-dot.png",
});

/* ---------------------------------------------
   AUTO FLY TO ACTIVE DEVICE
--------------------------------------------- */
function FlyToActive({
  devices,
  activeId,
}: {
  devices: Record<string, any>;
  activeId?: string | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (!activeId) return;

    const device = devices[activeId];
    if (!device?.lat || !device?.lon) return;

    map.flyTo([device.lat, device.lon], 15, {
      duration: 2,
    });
  }, [activeId, devices, map]);

  return null;
}

/* ---------------------------------------------
   MAIN MAP COMPONENT
--------------------------------------------- */
interface Props {
  devices: Record<string, any>;
  activeId?: string | null;
  onMarkerClick?: (id: string) => void;
}

export default function RealtimeMapAll({
  devices,
  activeId,
  onMarkerClick,
}: Props) {
  const deviceList = Object.values(devices);

  if (deviceList.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        No Devices
      </div>
    );
  }

return (
  <MapContainer
    center={[20, 78]}
    zoom={5}
    className="z-0"   // ← added
    style={{ height: "100%", width: "100%", zIndex: 0 }} // ← added
  >
    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

    {/* AUTO DEVICE MOVEMENT */}
    <FlyToActive devices={devices} activeId={activeId} />

    {deviceList.map((d: any) => {
      if (!d?.lat || !d?.lon) return null;

      return (
        <Marker
          key={d.id}
          position={[d.lat, d.lon]}
          icon={d.id === activeId ? activeIcon : normalIcon}
          eventHandlers={{
            click: () => onMarkerClick?.(d.id),
          }}
        >
          <Popup>{d.id}</Popup>
        </Marker>
      );
    })}
  </MapContainer>
);
}
