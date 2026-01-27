import LiveMapPanel from "../components/viz/LiveMapPanel";
import AggregatePanel from "../components/viz/AggregatePanel";
import DeviceCarousel from "../components/viz/DeviceCarousel";
import BottomGridPanel from "../components/viz/BottomGridPanel";
import styles from "../styles/DataViz.module.css";
import { useDispatch } from "react-redux";
import { setDevices } from "../redex/slices/dashboardSlice";
import { useEffect } from "react";

export default function DataVisualizationPage() {
      const dispatch = useDispatch();

  return (
    <div className={styles.container}>
      <div className={styles.left}><LiveMapPanel /></div>
      <div className={styles.right}>
        <AggregatePanel />
        <DeviceCarousel />
        <BottomGridPanel />
      </div>
    </div>
  );
}
