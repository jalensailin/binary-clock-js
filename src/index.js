import "./scss/index.scss";
import BinaryClock, {
  Clock,
  DecimalClock,
} from "./modules/clock/binary-clock.js";
import CONFIG from "./modules/config.js";

CONFIG.initialize();
Clock.initialize(BinaryClock, DecimalClock);
