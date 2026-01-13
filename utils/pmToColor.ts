
export function getPMColor(value: number): string {
  if (value <= 30) return "#22c55e"; // green-500
  if (value <= 60) return "#eab308"; // yellow-500
  if (value <= 90) return "#f97316"; // orange-500
  return "#ef4444"; // red-500
}
