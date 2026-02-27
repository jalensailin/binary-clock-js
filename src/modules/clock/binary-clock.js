import Pip from "./pip.js";
import { toBinary } from "../utils.js";
import CONFIG from "../config.js";

/**
 * @typedef {"hours" | "minutes" | "seconds"} UNIT
 */

const UNITS = /**  @type {const} */ (["hours", "minutes", "seconds"]);

export default class BinaryClock {
  constructor() {
    /** @type {HTMLElement} */
    this.element = document.getElementById("binary-clock");

    /** @type {Date} */
    this.date = null;

    /** @type {Record<UNITS[number], Pip[]>} */
    this.units = { hours: null, minutes: null, seconds: null };
  }

  /** Initializes the binary clock. */
  static initialize() {
    const clock = new BinaryClock();

    // Expose clock to global scope.
    Object.assign(globalThis, { clock });

    // Set initial clock state.
    clock.renderClock();

    // Start the main loop.
    clock.start();
  }

  /**
   * Renders the clock by:
   * 1. Setting the active class on the pips
   * 2. Setting the binary place value for each pip.
   * 3. Hide inactive pips (if setting is enabled).
   */
  async renderClock() {
    this.handleTwelveHourTime();

    // Initialize binary pips.
    UNITS.forEach((unit) => {
      const unitPips = this.element.querySelectorAll(
        `clock-${unit} pip:not(.meridiem)`
      );
      this.units[unit] = Array.from(unitPips).map(
        (pipNode, index) => new Pip(unit, index, pipNode)
      );
    });
  }

  /**
   * Starts the clock by:
   *
   * 1. Updating the time once
   * 2. Waiting for the next whole second
   * 3. Starting the update cycle
   *
   * The update cycle is done using setInterval, which calls updateClock every second.
   */
  async start() {
    // Update the clock once to set the initial time.
    this.updateClock();

    // Wait until the next whole second to start update cycle.
    // Might not be best solution.
    const timeNow = new Date().getTime();
    const timeUntilNextWholeSecond = 1000 - (timeNow % 1000);

    await new Promise((resolve) => {
      setTimeout(() => {
        this.updateClock();
        resolve();
      }, timeUntilNextWholeSecond);
    });
    setInterval(() => this.updateClock(), 1000);
  }

  /**
   * Updates the clock by setting the active class on the pips.
   * This is called once every second.
   */
  updateClock() {
    this.date = new Date();

    this.updateBinaryTime();
    this.updateDecimalTime();
  }

  /**
   * Sets the active class on the pips based on the binary
   * representation of the current time.
   */
  updateBinaryTime() {
    const binaryTime = this.getTime({ binary: true });

    UNITS.forEach((unit) => {
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
    const hour = this.date.getHours();
    meridiem.textContent = hour >= 12 ? "PM" : "AM";
  }

  /** Sets the decimal time on the clock. */
  updateDecimalTime() {
    const decimalTime = this.getTime();
    UNITS.forEach((unit) => {
      const decimalClock = document.querySelector(
        `#decimal-clock clock-${unit}`
      );

      let timeValue = decimalTime[unit];

      // Account for 12-hour time in the hours unit.
      if (
        CONFIG.settings.TWELVE_HOUR_TIME &&
        unit === "hours" &&
        timeValue === 0
      )
        timeValue = 12;

      decimalClock.querySelector("span > span").textContent = timeValue;
    });
  }

  /**
   * Returns the time in the given date object.
   * If the binary option is set to true, the time is returned in binary format.
   * @param {Object} [options] Optional options object.
   * @param {boolean} [options.binary=false] If set to true, return the time in binary format.
   * @returns {Object} Object containing the time in hours, minutes, and seconds.
   */
  getTime({ binary = false } = {}) {
    const hours = this.date.getHours();
    const time = {
      hours: CONFIG.settings.TWELVE_HOUR_TIME ? hours % 12 : hours,
      minutes: this.date.getMinutes(),
      seconds: this.date.getSeconds(),
    };

    if (binary) {
      Object.assign(time, {
        hours: toBinary(time.hours),
        minutes: toBinary(time.minutes),
        seconds: toBinary(time.seconds),
      });
    }

    return time;
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
