const SHOW_PLACE_VALUES = true;
const TWENTY_FOUR_HOURS = true;
const HOURS_MAX = TWENTY_FOUR_HOURS ? 24 : 12;
const MINUTES_SECONDS_MAX = 60;

const clock = document.getElementById("clock");

const units = ["hours", "minutes", "seconds"];

/**
 * Converts a given decimal number to its binary representation.
 * Pad the binary representation with leading zeros to make it 8 characters long.
 * @param {number} decimal
 * @returns {string} Binary representation of the given decimal number.
 */
function toBinary(decimal) {
  return (decimal >>> 0).toString(2).padStart(8, "0");
}

function updateClock() {
  const date = new Date();
  const binary = {
    hours: toBinary(date.getHours()),
    minutes: toBinary(date.getMinutes()),
    seconds: toBinary(date.getSeconds()),
  };

  units.forEach((unit) => {
    const binaryValue = Array.from(binary[unit]).map((value) => Number.parseInt(value, 2));
    const pips = Array.from(clock[unit]);

    binaryValue.forEach((value, index) => {
      const pip = pips[index];
      value ? pip.classList.add("active") : pip.classList.remove("active");
    });
  });
}

/**
 * Prepares the clock by setting the binary place value for each pip.
 * This function is called once at the beginning of the program.
 */
function prepareClock() {
  units.forEach((unit) => {
    const unitPips = clock.querySelectorAll(`clock-${unit} pip`);
    // Set properties on clock.
    clock[unit] = unitPips;

    // Set binary place value for each pip
    Array.from(unitPips)
      .reverse()
      .forEach((pip, index) => {
        const val = 2 ** index;
        pip.setAttribute("data-binary-place-value", val);
        pip.textContent = SHOW_PLACE_VALUES ? val : "";
      });
  });

  updateClock();
}

prepareClock();

setInterval(updateClock, 1000);
