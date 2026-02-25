/* ------------------------------------------------- */
/*                   CONFIG OPTIONS                  */
/* ------------------------------------------------- */
const SHOW_PLACE_VALUES = true;
const TWENTY_FOUR_HOURS = true;
const HIDE_UNUSED_PIPS = true;

/* ------------------------------------------------- */

const MAXIMUM_PIPS = /**  @type {const} */ ({
  hours: TWENTY_FOUR_HOURS ? 24 : 12,
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

function getTime(date, { binary = false } = {}) {
  const time = {
    hours: date.getHours(),
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

function updateDecimalTime(date) {
  const decimalTime = getTime(date);
  UNITS.forEach((unit) => {
    const pip = clock.querySelector(`clock-${unit} time.decimal-time`);
    pip.textContent = decimalTime[unit];
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
}

/**
 * Prepares the clock by setting the binary place value for each pip.
 * This function is called once at the beginning of the program.
 */
function prepareClock() {
  UNITS.forEach((unit) => {
    const unitPips = clock.querySelectorAll(`clock-${unit} pip`);
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

  updateClock();
}

prepareClock();
setInterval(updateClock, 1000);
