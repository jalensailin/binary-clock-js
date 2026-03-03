import Clock from "./base-clock.js";
import CONFIG from "../config.js";

export default class DecimalClock extends Clock {
  static base = /** @type {const} */ ("decimal");

  renderClock() {
    super.renderClock();

    if (CONFIG.settings.HIDE_DECIMAL_TIME) {
      this.element.style.display = "none";
    } else {
      this.element.style.display = "";
    }
  }

  /** Sets the decimal time on the clock. */
  updateClock() {
    const decimalTime = Clock.time;
    CONFIG.TIME_UNITS.forEach((unit) => {
      const decimalClock = this.element.querySelector(`clock-${unit}`);

      const timeValue = decimalTime[unit];

      decimalClock.querySelector("span + span").textContent = timeValue;
      this.handleTwelveHourTime();
    });
  }

  /** @inheritdoc */
  handleTwelveHourTime() {
    if (!CONFIG.settings.TWELVE_HOUR_TIME || Clock.time.hours !== 0) return;
    this.element.querySelector("clock-hours span + span").textContent = 12;
  }
}
