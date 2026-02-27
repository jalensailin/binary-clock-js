/* eslint-disable max-classes-per-file */
import Pip from "./pip.js";
import { toBinary } from "../utils.js";
import CONFIG from "../config.js";
import Clock from "./base-clock.js";

export default class BinaryClock extends Clock {
  static base = /** @type {const} */ ("binary");

  static get time() {
    const time = super.time;
    return Object.assign(time, {
      hours: toBinary(time.hours),
      minutes: toBinary(time.minutes),
      seconds: toBinary(time.seconds),
    });
  }

  /**
   * Renders the clock by:
   * 1. Setting the active class on the pips
   * 2. Setting the binary place value for each pip.
   * 3. Hide inactive pips (if setting is enabled).
   */
  async renderClock() {
    super.renderClock();

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
   * @param {number} hour The current hour in 12-hour format.
   */
  handleTwelveHourTime() {
    const firstPip = this.element.querySelector("clock-hours pip");
    const meridiem = this.element.querySelector("clock-hours pip.meridiem");

    const { MAXIMUM_PIPS } = CONFIG;
    const { TWELVE_HOUR_TIME } = CONFIG.settings;
    if (TWELVE_HOUR_TIME) {
      MAXIMUM_PIPS.hours = 12;
      // Hide first hour pip to make room for meridiem pip.
      firstPip.style.display = "none";

      meridiem.style.display = "";
      meridiem.classList.add("active");
    } else {
      CONFIG.MAXIMUM_PIPS.hours = 24;
      firstPip.style.display = "";
      meridiem.style.display = "none";
    }
  }
}
