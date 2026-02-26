/* ------------------------------------------------- */
/*                   CONFIG OPTIONS                  */
/* ------------------------------------------------- */
const SHOW_PLACE_VALUES = true;
const TWELVE_HOUR_TIME = false;
const HIDE_UNUSED_PIPS = true;

/* ------------------------------------------------- */

const MAXIMUM_PIPS = /**  @type {const} */ ({
  hours: TWELVE_HOUR_TIME ? 12 : 24,
  minutes: 60,
  seconds: 60,
});

const UNITS = /**  @type {const} */ (["hours", "minutes", "seconds"]);

class BinaryClock {
  constructor() {
    /** @type {HTMLElement} */
    this.element = document.getElementById("clock");

    /** @type {Date} */
    this.date = null;

    /** @type {Record<UNITS[number], NodeList>} */
    this.units = { hours: null, minutes: null, seconds: null };

    // Initialize the clock.
    this.prepareClock();
  }

  /**
   * Converts a given decimal number to its binary representation.
   * Pad the binary representation with leading zeros to make it 8 characters long.
   * @param {number} decimal
   * @returns {string} Binary representation of the given decimal number.
   */
  static toBinary(decimal) {
    return decimal.toString(2).padStart(8, "0");
  }

  /**
   * Returns the time in the given date object.
   * If the binary option is set to true, the time is returned in binary format.
   * @param {Date} date The date object from which to get the time.
   * @param {Object} [options] Optional options object.
   * @param {boolean} [options.binary=false] If set to true, return the time in binary format.
   * @returns {Object} Object containing the time in hours, minutes, and seconds.
   */
  getTime({ binary = false } = {}) {
    const hours = this.date.getHours();
    const time = {
      hours: TWELVE_HOUR_TIME ? hours % 12 : hours,
      minutes: this.date.getMinutes(),
      seconds: this.date.getSeconds(),
    };

    if (binary) {
      const { toBinary } = BinaryClock;
      Object.assign(time, {
        hours: toBinary(time.hours),
        minutes: toBinary(time.minutes),
        seconds: toBinary(time.seconds),
      });
    }

    return time;
  }

  /**
   * Displays the meridiem pip with the current hour's meridiem.
   * @param {number} hour The current hour in 12-hour format.
   */
  displayMeridiemPip() {
    // Hide first hour pip to make room for meridiem pip.
    this.element.querySelector("clock-hours pip").style.display = "none";

    const meridiem = this.element.querySelector("clock-hours pip.meridiem");
    meridiem.style.display = "";
    meridiem.classList.add("active");

    const hour = this.date.getHours();
    meridiem.textContent = hour >= 12 ? "PM" : "AM";
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
  }

  /**
   * Sets the decimal time on the clock.
   */
  updateDecimalTime() {
    const decimalTime = this.getTime();
    UNITS.forEach((unit) => {
      const pip = this.element.querySelector(`clock-${unit} time.decimal-time`);
      let timeValue = decimalTime[unit];
      // Account for 12-hour time in the hours unit.
      if (TWELVE_HOUR_TIME && unit === "hours" && timeValue === 0)
        timeValue = 12;
      pip.querySelector("span").textContent = timeValue;
    });
  }

  /**
   * Updates the clock by setting the active class on the pips.
   * This is called once every second.
   */
  updateClock() {
    this.date = new Date();

    this.updateBinaryTime();
    this.updateDecimalTime();

    if (TWELVE_HOUR_TIME) this.displayMeridiemPip();
  }

  /**
   * Prepares the clock by setting the binary place value for each pip.
   * This is called once at the beginning of the program.
   */
  async prepareClock() {
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
          if (HIDE_UNUSED_PIPS && val > MAXIMUM_PIPS[unit]) {
            pip.classList.add("hidden");
          }

          // Set attribute and text content.
          pip.setAttribute("data-binary-place-value", val);
          pip.textContent = SHOW_PLACE_VALUES ? val : "";
        });
    });

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
}

globalThis.binaryclock = new BinaryClock();
