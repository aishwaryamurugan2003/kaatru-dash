import { useEffect, useRef, useState } from "react";
import { apiService, Endpoint } from "../services/api";

export function useRealtimeDevices(groupId: string, selectedDevices: string[]) {
  const [devices, setDevices] = useState<Record<string, any>>({});
  const mqttTopicRef = useRef<string>("");

  /* ------------------------------------------------------------
     RESET DEVICES WHEN GROUP OR SELECTION CHANGES
  ------------------------------------------------------------ */
  useEffect(() => {
    setDevices({});
    apiService.disconnectAllWebSockets();
  }, [groupId, selectedDevices]);

  /* ------------------------------------------------------------
     FETCH MQTT TOPIC WHEN GROUP CHANGES
  ------------------------------------------------------------ */
  useEffect(() => {
    if (!groupId) return;

    apiService
      .get(Endpoint.GROUP_DEVICES, { id: groupId })
      .then((res: any) => {
        mqttTopicRef.current = res.data.group?.[0]?.mqtt_topic || "";
        console.log("MQTT TOPIC:", mqttTopicRef.current);
      })
      .catch((err) => {
        console.error("Failed to load MQTT topic", err);
      });
  }, [groupId]);

  /* ------------------------------------------------------------
     CONNECT WEBSOCKETS FOR SELECTED DEVICES
  ------------------------------------------------------------ */
  useEffect(() => {
    if (!mqttTopicRef.current || selectedDevices.length === 0) return;

    selectedDevices.forEach((deviceId) => {
      apiService.connectDeviceWebSocket(
        deviceId,
        mqttTopicRef.current,
        (data) => {
          setDevices((prev) => ({
            ...prev,
            [deviceId]: data,
          }));
        }
      );
    });

    return () => {
      apiService.disconnectAllWebSockets();
    };
  }, [selectedDevices, groupId]);

  return devices;
}
