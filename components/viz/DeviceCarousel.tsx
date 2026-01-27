import Slider from "react-slick";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redex/store";
import { setIndex } from "../../redex/slices/dashboardSlice";
import styles from "../../styles/DataViz.module.css";

export default function DeviceCarousel() {
  const devices = useSelector((s: RootState) => s.dashboard.devices);
  const dispatch = useDispatch();

  return (
    <Slider autoplay arrows={false} beforeChange={(_, n) => dispatch(setIndex(n))}>
      {devices.map((d: any) => (
        <div key={d.id} className={styles.carouselItem}>
          {d.location} ({d.id})
        </div>
      ))}
    </Slider>
  );
}
