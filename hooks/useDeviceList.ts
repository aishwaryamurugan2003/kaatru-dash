// src/hooks/useDeviceList.ts
import { useEffect, useState } from "react";
import axios from "axios";

export function useDeviceList(groupId: string) {
  const [deviceIds, setDeviceIds] = useState<string[]>([]);
  const [mqttTopic, setMqttTopic] = useState<string>("");

  useEffect(() => {
    if (!groupId) return;

    const load = async () => {
      try {
        const url = `https://bw04.kaatru.org/group?id=${groupId}`;
        const res = await axios.get(url);

        console.log("GROUP API:", res.data);

        // ✅ Correct parsing
        const ids: string[] = res.data.devices || [];
        const topic = res.data.group?.[0]?.mqtt_topic || "prod/gur/+/sen";

        setDeviceIds(ids);
        setMqttTopic(topic);
      } catch (e) {
        console.error("Group fetch failed", e);
      }
    };

    load();
  }, [groupId]);

  return { deviceIds, mqttTopic };
}
