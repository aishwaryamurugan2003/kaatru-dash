import { useEffect, useRef, useState } from "react";
import { apiService, Endpoint } from "../services/api";

export function useRealtimeDevices(groupId: string, selectedDevices: string[]) {
  const [devices, setDevices] = useState<Record<string, any>>({});
  const mqttTopicRef = useRef<string>("");

  // Fetch MQTT topic once
  useEffect(() => {
    if (!groupId) return;

    apiService.get(Endpoint.GROUP_DEVICES, { id: groupId }).then((res: any) => {
      mqttTopicRef.current = res.data.group?.[0]?.mqtt_topic;
      console.log("MQTT TOPIC:", mqttTopicRef.current);
    });
  }, [groupId]);

  // Connect WS for selected devices
  useEffect(() => {
    if (!mqttTopicRef.current || selectedDevices.length === 0) return;

    selectedDevices.forEach((deviceId) => {
      apiService.connectDeviceWebSocket(deviceId, mqttTopicRef.current, (data) => {
        setDevices((prev) => ({ ...prev, [deviceId]: data }));
      });
    });

    return () => {
      apiService.disconnectAllWebSockets();
    };
  }, [selectedDevices]);

  return devices;
}
