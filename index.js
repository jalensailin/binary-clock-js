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

const clock = document.getElementById("clock");

/**
 * Converts a given decimal number to its binary representation.
 * Pad the binary representation with leading zeros to make it 8 characters long.
 * @param {number} decimal
 * @returns {string} Binary representation of the given decimal number.
 */
function toBinary(decimal) {
  return (decimal >>> 0).toString(2).padStart(8, "0");
}

/**
 * Returns the time in the given date object.
 * If the binary option is set to true, the time is returned in binary format.
 * @param {Date} date The date object from which to get the time.
 * @param {Object} [options] Optional options object.
 * @param {boolean} [options.binary=false] If set to true, return the time in binary format.
 * @returns {Object} Object containing the time in hours, minutes, and seconds.
 */
function getTime(date, { binary = false } = {}) {
  const hours = date.getHours();
  const time = {
    hours: TWELVE_HOUR_TIME ? hours % 12 : hours,
    minutes: date.getMinutes(),
    seconds: date.getSeconds(),
  };

  if (binary)
    Object.assign(time, {
      hours: toBinary(time.hours),
      minutes: toBinary(time.minutes),
      seconds: toBinary(time.seconds),
    });

  return time;
}

/**
 * Displays the meridiem pip with the current hour's meridiem.
 * @param {number} hour The current hour in 12-hour format.
 */
function displayMeridiemPip(hour) {
  // Hide first hour pip to make room for meridiem pip.
  clock.querySelector("clock-hours pip").style.display = "none";

  const meridiem = clock.querySelector("clock-hours pip.meridiem");
  meridiem.style.display = "";
  meridiem.classList.add("active");
  meridiem.textContent = hour >= 12 ? "PM" : "AM";
}

/**
 * Sets the active class on the pips based on the binary
 * representation of the current time.
 * @param {Date} date The current date and time.
 */
function updateBinaryTime(date) {
  const binaryTime = getTime(date, { binary: true });

  UNITS.forEach((unit) => {
    const binaryValue = Array.from(binaryTime[unit]).map((value) => Number.parseInt(value, 2));
    const pips = Array.from(clock[unit]);

    binaryValue.forEach((value, index) => {
      const pip = pips[index];
      value ? pip.classList.add("active") : pip.classList.remove("active");
    });
  });
}

/**
 * Sets the decimal time on the clock.
 * @param {Date} date The current date and time.
 */
function updateDecimalTime(date) {
  const decimalTime = getTime(date);
  UNITS.forEach((unit) => {
    const pip = clock.querySelector(`clock-${unit} time.decimal-time`);
    let timeValue = decimalTime[unit];
    // Account for 12-hour time in the hours unit.
    if (TWELVE_HOUR_TIME && unit === "hours" && timeValue === 0) timeValue = 12;
    pip.querySelector("span").textContent = timeValue;
  });
}

/**
 * Updates the clock by setting the active class on the pips.
 * This function is called once every second.
 */
function updateClock() {
  const date = new Date();

  updateBinaryTime(date);
  updateDecimalTime(date);

  if (TWELVE_HOUR_TIME) displayMeridiemPip(date.getHours());
}

/**
 * Prepares the clock by setting the binary place value for each pip.
 * This function is called once at the beginning of the program.
 */
async function prepareClock() {
  UNITS.forEach((unit) => {
    const unitPips = clock.querySelectorAll(`clock-${unit} pip:not(.meridiem)`);
    // Set properties on clock.
    clock[unit] = unitPips;

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
  updateClock();

  // Wait until the next whole second to start update cycle.
  // Might not be best solution.
  const timeNow = new Date().getTime();
  const timeUntilNextWholeSecond = 1000 - (timeNow % 1000);

  await new Promise((resolve) => {
    setTimeout(() => {
      updateClock();
      resolve();
    }, timeUntilNextWholeSecond);
  });
  setInterval(updateClock, 1000);
}

prepareClock();
