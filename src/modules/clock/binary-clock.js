/* eslint-disable max-classes-per-file */
import Pip from "./pip.js";
import { toBinary } from "../utils.js";
import CONFIG from "../config.js";

/**
 * @typedef {"hours" | "minutes" | "seconds"} UNIT
 */

const UNITS = /**  @type {const} */ (["hours", "minutes", "seconds"]);

export class Clock {
  static date = new Date();

  /** @type {BinaryClock} */
  static binary;

  /** @type {DecimalClock} */
  static decimal;

  /** @type {HTMLElement} */
  element = document.getElementById(`${this.constructor.base}-clock`);

  /** @type {Record<UNITS[number], Pip[]>} */
  units = { hours: null, minutes: null, seconds: null };

  /**
   * Returns the current *decimal* time in hours, minutes, and seconds.
   * If the 12-hour time setting is enabled, the hours are returned in 12-hour format.
   * @returns {Object} Object containing the current time in hours, minutes, and seconds.
   * @property {number} hours The current hour in hours.
   * @property {number} minutes The current minute in minutes.
   * @property {number} seconds The current second in seconds.
   */
  static get time() {
    const hours = Clock.date.getHours();
    return {
      hours: CONFIG.settings.TWELVE_HOUR_TIME ? hours % 12 : hours,
      minutes: Clock.date.getMinutes(),
      seconds: Clock.date.getSeconds(),
    };
  }

  /**
   * Updates the clock by setting the active class on the pips.
   * This is called once every second.
   */
  static updateClocks() {
    this.binary.updateClock();
    this.decimal.updateClock();
  }

  renderClock() {
    this.handleTwelveHourTime();
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
  static async startTicker() {
    // Update the clock once to set the initial time.
    this.updateClocks();

    // Wait until the next whole second to start update cycle.
    // Might not be best solution.
    const timeNow = new Date().getTime();
    const timeUntilNextWholeSecond = 1000 - (timeNow % 1000);

    await new Promise((resolve) => {
      setTimeout(() => {
        this.updateClocks();
        resolve();
      }, timeUntilNextWholeSecond);
    });

    setInterval(() => {
      Clock.date = new Date();
      this.updateClocks();
    }, 1000);
  }

  static initialize(...classes) {
    Object.assign(globalThis, { Clock });

    classes.forEach((ClockClass) => {
      this[ClockClass.base] = new ClockClass();
      this[ClockClass.base].renderClock();
    });

    Clock.startTicker();
  }
}

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
   * Sets the active class on the pips based on the binary
   * representation of the current time.
   */
  updateClock() {
    const binaryTime = BinaryClock.time;

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

export class DecimalClock extends Clock {
  static base = /** @type {const} */ ("decimal");

  /** Sets the decimal time on the clock. */
  updateClock() {
    const decimalTime = Clock.time;
    UNITS.forEach((unit) => {
      const decimalClock = this.element.querySelector(`clock-${unit}`);

      const timeValue = decimalTime[unit];

      decimalClock.querySelector("span > span").textContent = timeValue;
      this.handleTwelveHourTime();
    });
  }

  /** @inheritdoc */
  handleTwelveHourTime() {
    if (!CONFIG.settings.TWELVE_HOUR_TIME || Clock.time.hours !== 0) return;
    this.element.querySelector("clock-hours span > span").textContent = 12;
  }
}
