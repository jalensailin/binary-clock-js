import Pip from "./pip.js";
import { toBinary } from "../utils.js";
import CONFIG from "../config.js";
import Clock from "./base-clock.js";

export default class BinaryClock extends Clock {
  static base = /** @type {const} */ ("binary");

  /**
   * Returns the current *binary* time in hours, minutes, and seconds.
   * @override
   */
  static get time() {
    const time = super.time;
    return Object.assign(time, {
      hours: toBinary(time.hours),
      minutes: toBinary(time.minutes),
      seconds: toBinary(time.seconds),
    });
  }

  /**
   * Renders the binary clock by creating the pips,
   * which then handles setting state.
   * @see Pip
   * @inheritdoc
   */
  renderClock() {
    super.renderClock();

    // Render title:
    const titleElem = document.getElementById("clock-title");
    if (CONFIG.settings.HIDE_TITLE) {
      titleElem.style.display = "none";
    } else {
      titleElem.style.display = "";
    }

    // Initialize binary pips.
    CONFIG.TIME_UNITS.forEach((unit) => {
      const unitPips = this.element.querySelectorAll(
        `clock-${unit} pip:not(.meridiem)`
      );
      this.units[unit] = Array.from(unitPips).map(
        (pipNode, index) => new Pip(unit, index, pipNode)
      );
    });
  }

  /**
   * Sets the active class on the pips based on the binary
   * representation of the current time.
   */
  updateClock() {
    const binaryTime = BinaryClock.time;

    CONFIG.TIME_UNITS.forEach((unit) => {
      const binaryValue = Array.from(binaryTime[unit]).map((value) =>
        Number.parseInt(value, 2)
      );
      const pips = this.units[unit];

      binaryValue.forEach((value, index) => {
        const pip = pips[index];
        pip.active = !!value;
      });
    });

    // Handle meridiem pip (even if not shown).
    const meridiem = this.element.querySelector("clock-hours pip.meridiem");
    const hour = Clock.date.getHours();
    meridiem.textContent = hour >= 12 ? "PM" : "AM";
  }

  /**
   * Displays/removes the meridiem pip with the current hour's meridiem.
   * @inheritdoc
   * @param {number} hour The current hour in 12-hour format.
   */
  handleTwelveHourTime() {
    const firstPip = this.element.querySelector("clock-hours pip");
    const meridiem = this.element.querySelector("clock-hours pip.meridiem");

    const { TWELVE_HOUR_TIME } = CONFIG.settings;
    if (TWELVE_HOUR_TIME) {
      // Hide first hour pip to make room for meridiem pip.
      firstPip.style.display = "none";

      meridiem.style.display = "";
      meridiem.classList.add("active");
    } else {
      firstPip.style.display = "";
      meridiem.style.display = "none";
    }
  }
}
