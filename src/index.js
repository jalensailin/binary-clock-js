import "./scss/index.scss";
import BinaryClock from "./modules/clock/binary-clock.js";
import DecimalClock from "./modules/clock/decimal-clock.js";
import Clock from "./modules/clock/base-clock.js";
import CONFIG from "./modules/config.js";

CONFIG.initialize();
Clock.initialize(BinaryClock, DecimalClock);
