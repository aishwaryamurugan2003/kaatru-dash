import { useEffect, useState } from "react";
import { apiService } from "../services/api";

interface DeviceListResponse {
  devices: string[];
  mqtt_topic: string;
}

export function useDeviceList(groupId: string) {
  const [deviceIds, setDeviceIds] = useState<string[]>([]);
  const [mqttTopic, setMqttTopic] = useState<string>("");

  useEffect(() => {
    if (!groupId) return;

    const load = async () => {
      try {
        // ✅ IMPORTANT: Full URL
        const res = await apiService.get(`https://bw04.kaatru.org/group/${groupId}`);

        console.log("GROUP API RAW:", res.data);

        const ids = res.data?.devices?.map((d: any) => d.device_id) || [];
        const topic = res.data?.mqtt_topic || "prod/gur/+/sen";

        setDeviceIds(ids);
        setMqttTopic(topic);
      } catch (err) {
        console.error("❌ Device list fetch error", err);
      }
    };

    load();
  }, [groupId]);

  return { deviceIds, mqttTopic };
}
