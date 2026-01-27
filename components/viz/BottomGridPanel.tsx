import { useSelector } from "react-redux";
import { RootState } from "../../redex/store";
import styles from "../../styles/DataViz.module.css";

export default function BottomGridPanel() {
  const { devices, currentIndex } = useSelector((s: RootState) => s.dashboard);
  const d: any = devices[currentIndex] || {};

  return (
    <div className={styles.bottomGrid}>
      <div className={styles.bigCard}>PM2.5 {d.sPM2}</div>
      <div className={styles.smallCard}>PM1 {d.sPM1}</div>
      <div className={styles.smallCard}>PM10 {d.sPM10}</div>
      <div className={styles.smallCard}>Temp {d.temp}</div>
      <div className={styles.smallCard}>Humidity {d.rh}</div>
    </div>
  );
}
