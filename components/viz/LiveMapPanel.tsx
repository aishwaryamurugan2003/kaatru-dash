import { MapContainer, TileLayer, Marker, CircleMarker } from "react-leaflet";
import { useSelector } from "react-redux";
import { RootState } from "../../redex/store";
import * as L from "leaflet";

export default function LiveMapPanel() {
  const devices = useSelector((s: RootState) => s.dashboard.devices);
  console.log("MAP DEVICES:", devices);

  return (
    <MapContainer
      center={[13.1, 80.2] as L.LatLngExpression}
      zoom={12}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png" />

      {devices.map((d: any) => (
        <Marker key={d.id} position={[d.lat, d.lon] as L.LatLngExpression} />
      ))}

      {devices.map((d: any) => (
        <CircleMarker
          key={d.id + "h"}
          center={[d.lat, d.lon] as L.LatLngExpression}
          radius={12}
          color={d.sPM2 > 35 ? "red" : d.sPM2 > 25 ? "orange" : "green"}
        />
      ))}
    </MapContainer>
  );
}
