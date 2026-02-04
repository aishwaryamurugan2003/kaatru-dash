export function parseSensorHistory(apiData: any) {
  const raw = apiData?.data?.[0]?.data ?? [];

  function extract(key: string) {
    return raw
      .filter((r: any) => typeof r[key] === "number" && typeof r.srvtime === "number"
      )
      .map((r: any) => ({
        time: new Date(r.srvtime).toLocaleTimeString(),
        value: r[key],
      }));
  }

  return {
    pm25: extract("sPM2"),
    pm10: extract("sPM10"),
    temp: extract("temp"),
    humidity: extract("rh"),
  };
}
