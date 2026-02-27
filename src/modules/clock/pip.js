import CONFIG from "../config.js";

/** @import {UNIT} from "./binary-clock.js" */

export default class Pip {
  /**
   * Initializes a new Pip instance.
   * @param {UNIT} unit The unit of the pip (e.g. hours, minutes, seconds).
   * @param {number} index The index of the pip in the unit.
   * @param {HTMLElement} pip The HTML element representing the pip.
   */
  constructor(unit, index, pip) {
    const placeValue = 2 ** (7 - index);

    /** @type {HTMLElement} */
    this.element = pip;

    const { HIDE_UNUSED_PIPS } = CONFIG.settings;

    /** @type {UNIT} */
    this.unit = unit;
    this.hidden = HIDE_UNUSED_PIPS && placeValue > CONFIG.MAXIMUM_PIPS[unit];
    this.place = placeValue;
  }

  /** @type {boolean} */
  #active;

  /** @type {boolean} */
  #hidden;

  /* --------------------- Active -------------------- */

  /**
   * Sets the active class on the pip.
   * @param {boolean} value
   */
  set active(value) {
    if (value) {
      this.#active = true;
      this.element.classList.add("active");
    } else {
      this.#active = false;
      this.element.classList.remove("active");
    }
  }

  /**
   * Returns whether the pip is currently active.
   * @returns {boolean} true if the pip is active, false otherwise.
   */
  get active() {
    return this.#active;
  }

  /* --------------------- Hidden -------------------- */

  /**
   * Sets whether the pip is hidden or not.
   * If the pip is hidden, it will be given the "hidden" class.
   * @param {boolean} value true if the pip should be hidden, false otherwise.
   */
  set hidden(value) {
    if (value) {
      this.#hidden = true;
      this.element.classList.add("hidden");
    } else {
      this.#hidden = false;
      this.element.classList.remove("hidden");
    }
  }

  /**
   * Returns whether the pip is currently hidden or not.
   * @returns {boolean} true if the pip is hidden, false otherwise.
   */
  get hidden() {
    return this.#hidden;
  }

  /* --------------------- Place --------------------- */

  /**
   * Sets the binary place value of the pip.
   * If the `SHOW_PLACE_VALUES` option is enabled, the pip's text content will be set to the given value.
   * Otherwise, the pip's text content will be left blank.
   * @param {string} value The binary place value of the pip.
   */
  set place(value) {
    const { element } = this;
    element.setAttribute("data-binary-place-value", value);
    element.textContent = CONFIG.settings.SHOW_PLACE_VALUES ? value : "";
  }

  /**
   * Returns the binary place value of the pip.
   * @returns {string} The binary place value of the pip.
   */
  get place() {
    return this.element.getAttribute("data-binary-place-value");
  }
}
