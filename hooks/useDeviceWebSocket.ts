// src/hooks/useDeviceWebSocket.ts
import { useEffect, useState } from "react";
import { apiService } from "../services/api";
import { DeviceData } from "../types/device";
import axios from "axios";

export function useDeviceWebSocket(deviceIds: string[], mqttTopic: string) {
  const [devices, setDevices] = useState<Record<string, DeviceData>>({});
  const [staticGps, setStaticGps] = useState<Record<string, { lat: number; lon: number }>>({});

  // -----------------------------------------
  // ✅ Load STATIC GPS like Flutter
  // -----------------------------------------
  useEffect(() => {
    if (!deviceIds.length) return;

    deviceIds.forEach(async (id) => {
      try {
        const res = await axios.get(`https://bw04.kaatru.org/device?id=${id}`);
        const d = res.data.device?.[0];
        if (!d) return;

        setStaticGps(prev => ({
          ...prev,
          [id]: {
            lat: Number(d.lat || d.latitude || 0),
            lon: Number(d.lon || d.longitude || 0),
          },
        }));
      } catch (e) {
        console.warn("GPS load failed:", id);
      }
    });
  }, [deviceIds]);

  // -----------------------------------------
  // 🔥 WebSocket Live Telemetry
  // -----------------------------------------
  useEffect(() => {
    if (!deviceIds.length || !mqttTopic) return;

    deviceIds.forEach((id) => {
      apiService.connectDeviceWebSocket(id, mqttTopic, (data: DeviceData) => {
        setDevices(prev => ({
          ...prev,
          [id]: {
            ...data,

            // ✅ Flutter GPS logic
            lat: data.lat || staticGps[id]?.lat || 0,
            lon: data.lon || staticGps[id]?.lon || 0,
          }
        }));
      });
    });

    return () => apiService.disconnectAllWebSockets();
  }, [deviceIds, mqttTopic, staticGps]);

  return devices;
}
