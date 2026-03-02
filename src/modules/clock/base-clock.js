import CONFIG from "../config.js";

export default class Clock {
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
   * @abstract
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
   * Updates the internal timestamp and calls the updateClocks method.
   * This is called once every second.
   * @abstract
   */
  static updateClocks() {
    Clock.date = new Date();

    ["binary", "decimal"].forEach((clock) => {
      // Strip milliseconds from string:
      const dateString = Clock.date.toISOString().slice(0, 19);
      this[clock].element.setAttribute("datetime", dateString);

      // Update each clock.
      this[clock].updateClock();
    });
  }

  /**
   * Base rendering of clock (does not fill in time).
   * @abstract
   */
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
   * The update cycle is done using setInterval, which calls updateClocks every second.
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

    this.scheduleTick();
  }

  /**
   * Schedules the next update of the clock using setTimeout, taking
   * drift into account. Updates the clock every second,
   * and then schedules the next update.
   */
  static scheduleTick() {
    // Date.now() to synchronize with wall time.
    const msUntilNextSecond = 1000 - (Date.now() % 1000);

    setTimeout(() => {
      this.updateClocks();
      this.scheduleTick();
    }, msUntilNextSecond);
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
