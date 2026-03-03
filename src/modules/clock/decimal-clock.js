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

      const currentSpan = decimalClock.querySelector(".current");
      const currentNumber = Number.parseInt(currentSpan.textContent, 10);

      // This sections is what gives the text a smooth animation.
      if (currentNumber !== timeValue) {
        // Set new span to current time, then make it current.
        const newSpan = decimalClock.querySelector(".new");
        newSpan.textContent = timeValue;
        newSpan.classList.add("current");
        newSpan.classList.remove("new");

        // Clear current span, and make it new.
        currentSpan.textContent = "";
        currentSpan.classList.remove("current");
        currentSpan.classList.add("new");

        // Css handles the animation.
      }

      this.handleTwelveHourTime();
    });
  }

  /** @inheritdoc */
  handleTwelveHourTime() {
    if (!CONFIG.settings.TWELVE_HOUR_TIME || Clock.time.hours !== 0) return;
    this.element.querySelector("clock-hours .current").textContent = 12;
  }
}
