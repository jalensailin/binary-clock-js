import { toBinary, snakeToKebab } from "./utils.js";

const UNITS = /**  @type {const} */ (["hours", "minutes", "seconds"]);

export default class BinaryClock {
  constructor() {
    /** @type {HTMLElement} */
    this.element = document.getElementById("clock");

    /** @type {Date} */
    this.date = null;

    /** @type {Record<UNITS[number], NodeList>} */
    this.units = { hours: null, minutes: null, seconds: null };

    this.setDefaultSettings();

    // Set initial clock state.
    this.prepareClock();

    this.activateListeners();

    // Start the main loop.
    this.start();
  }

  static CONFIG = {
    SHOW_PLACE_VALUES: true,
    TWELVE_HOUR_TIME: false,
    HIDE_UNUSED_PIPS: true,
  };

  static MAXIMUM_PIPS = {
    hours: this.CONFIG.TWELVE_HOUR_TIME ? 12 : 24,
    minutes: 60,
    seconds: 60,
  };

  /**
   * Prepares the clock by setting the binary place value for each pip.
   */
  async prepareClock() {
    this.handleTwelveHourTime();

    const { HIDE_UNUSED_PIPS, SHOW_PLACE_VALUES } = BinaryClock.CONFIG;
    UNITS.forEach((unit) => {
      const unitPips = this.element.querySelectorAll(
        `clock-${unit} pip:not(.meridiem)`
      );
      // Set properties on clock.
      this.units[unit] = unitPips;

      Array.from(unitPips)
        .reverse()
        .forEach((pip, index) => {
          const val = 2 ** index;

          // Hide unused pips
          if (HIDE_UNUSED_PIPS && val > BinaryClock.MAXIMUM_PIPS[unit]) {
            pip.classList.add("hidden");
          } else {
            pip.classList.remove("hidden");
          }

          // Set attribute and text content.
          pip.setAttribute("data-binary-place-value", val);
          pip.textContent = SHOW_PLACE_VALUES ? val : "";
        });
    });
  }

  /**
   * Sets the default settings of the clock by checking the corresponding form fields.
   * SHOW_PLACE_VALUES, TWELVE_HOUR_TIME, and HIDE_UNUSED_PIPS are set accordingly.
   */
  setDefaultSettings() {
    const form = this.element.querySelector("form");

    Object.keys(BinaryClock.CONFIG).forEach((key) => {
      const kebabKey = snakeToKebab(key);
      form.querySelector(`#${kebabKey}`).checked = BinaryClock.CONFIG[key];
    });
  }

  /** Method to register event listeners. */
  activateListeners() {
    this.element
      .querySelector("#toggle-config")
      .addEventListener("click", (event) => {
        const form = this.element.querySelector("form");
        form.classList.toggle("show");
      });

    this.element.querySelector("form").addEventListener("change", (event) => {
      // early return if target is not input:
      if (event.target.tagName !== "INPUT") return;

      const { name, checked } = event.target;
      const setting = Object.keys(BinaryClock.CONFIG).find((key) => {
        const kebabKey = snakeToKebab(key);
        return kebabKey === name;
      });

      // Update config object.
      BinaryClock.CONFIG[setting] = checked;

      // Re-render clock with new settings.
      this.prepareClock();
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
      const pips = Array.from(this.units[unit]);

      binaryValue.forEach((value, index) => {
        const pip = pips[index];
        if (value) {
          pip.classList.add("active");
        } else {
          pip.classList.remove("active");
        }
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
      const pip = this.element.querySelector(`clock-${unit} time.decimal-time`);
      let timeValue = decimalTime[unit];
      // Account for 12-hour time in the hours unit.
      if (
        BinaryClock.CONFIG.TWELVE_HOUR_TIME &&
        unit === "hours" &&
        timeValue === 0
      )
        timeValue = 12;
      pip.querySelector("span").textContent = timeValue;
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
      hours: BinaryClock.CONFIG.TWELVE_HOUR_TIME ? hours % 12 : hours,
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

    if (BinaryClock.CONFIG.TWELVE_HOUR_TIME) {
      BinaryClock.MAXIMUM_PIPS.hours = 12;
      // Hide first hour pip to make room for meridiem pip.
      firstPip.style.display = "none";

      meridiem.style.display = "";
      meridiem.classList.add("active");
    } else {
      BinaryClock.MAXIMUM_PIPS.hours = 24;
      firstPip.style.display = "";
      meridiem.style.display = "none";
    }
  }
}
