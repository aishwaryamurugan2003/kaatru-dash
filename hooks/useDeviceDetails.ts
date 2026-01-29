import { useEffect, useState } from "react";
import axios from "axios";

export function useDeviceDetails(deviceIds: string[]) {
  const [staticGps, setStaticGps] = useState<Record<string, {lat:number, lon:number}>>({});

  useEffect(() => {
    deviceIds.forEach(async (id) => {
      try {
        const res = await axios.get(`https://bw04.kaatru.org/device?id=${id}`);
        const d = res.data.device?.[0];
        if (!d) return;

        setStaticGps(prev => ({
          ...prev,
          [id]: {
            lat: Number(d.lat || d.latitude),
            lon: Number(d.lon || d.longitude)
          }
        }));
      } catch {}
    });
  }, [deviceIds]);

  return staticGps;
}
