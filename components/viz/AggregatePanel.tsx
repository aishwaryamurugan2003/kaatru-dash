import { useSelector } from "react-redux";
import { RootState } from "../../redex/store";
import styles from "../../styles/DataViz.module.css";

export default function AggregatePanel() {
  const { devices, currentIndex } = useSelector((s: RootState) => s.dashboard);
  const d: any = devices[currentIndex] || {};

  return (
    <div className={styles.aggregateGrid}>
      <div className={styles.bigCard}>
        PM 2.5 <br /><span>{d.sPM2 ?? "-"} μg/m3</span>
      </div>

      <div className={styles.smallCard}>Temp<br />{d.temp ?? "-"} °C</div>
      <div className={styles.smallCard}>Humidity<br />{d.rh ?? "-"} %</div>
      <div className={styles.smallCard}>PM1<br />{d.sPM1 ?? "-"}</div>
      <div className={styles.smallCard}>PM10<br />{d.sPM10 ?? "-"}</div>
    </div>
  );
}
