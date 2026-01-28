import { useEffect, useState } from "react";
import { apiService } from "../services/api";
import { DeviceData } from "../types/device";

export function useDeviceWebSocket(deviceIds: string[], mqttTopic: string) {
  const [devices, setDevices] = useState<Record<string, DeviceData>>({});

  useEffect(() => {
    if (!deviceIds.length || !mqttTopic) return;

    deviceIds.forEach((id) => {
      apiService.connectDeviceWebSocket(id, mqttTopic, (data: DeviceData) => {
        setDevices(prev => ({
          ...prev,
          [id]: data
        }));
      });
    });

    return () => apiService.disconnectAllWebSockets();
  }, [deviceIds, mqttTopic]);

  return devices;
}
