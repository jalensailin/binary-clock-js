// eslint-disable-next-line max-classes-per-file
import CONFIG from "../config.js";

/** @import {UNIT} from "./binary-clock.js" */

export default class Pip {
  /** @type {boolean} */
  _active;

  /** @type {boolean} */
  _hidden;

  /** @type {boolean} */
  _displayed;

  /** @type {string} */
  _textContent;

  /**
   * Initializes a new Pip instance.
   * @param {UNIT} unit The unit of the pip (e.g. hours, minutes, seconds).
   * @param {number} index The index of the pip in the unit.
   * @param {HTMLElement} pip The HTML element representing the pip.
   */
  constructor(unit, index, pip) {
    /** @type {HTMLElement} */
    this.element = pip;

    /** @type {UNIT} */
    this.unit = unit;

    this.index = index;

    this.renderPip();
  }

  /* --------------------- Active -------------------- */

  /**
   * Sets the active class on the pip.
   * @param {boolean} value
   */
  set active(value) {
    if (value) {
      this._active = true;
      this.element.classList.add("active");
    } else {
      this._active = false;
      this.element.classList.remove("active");
    }
  }

  /**
   * Returns whether the pip is currently active.
   * @returns {boolean} true if the pip is active, false otherwise.
   */
  get active() {
    return this._active;
  }

  /* --------------------- Hidden -------------------- */

  /**
   * Sets whether the pip is hidden or not.
   * If the pip is hidden, it will be given the "hidden" class.
   * @param {boolean} value true if the pip should be hidden, false otherwise.
   */
  set hidden(value) {
    if (value) {
      this._hidden = true;
      this.element.classList.add("hidden");
    } else {
      this._hidden = false;
      this.element.classList.remove("hidden");
    }
  }

  /**
   * Returns whether the pip is currently hidden or not.
   * @returns {boolean} true if the pip is hidden, false otherwise.
   */
  get hidden() {
    return this._hidden;
  }

  /* ------------------- Displayed ------------------- */

  /**
   * Sets whether the pip should be displayed or not.
   * If the value is true, the pip will be displayed with the CSS display property set to an empty string.
   * If the value is false, the pip will be hidden with the CSS display property set to "none".
   * @param {boolean} value true if the pip should be displayed, false otherwise.
   */
  set displayed(value) {
    this._displayed = value;
    this.element.style.display = value ? "" : "none";
  }

  /**
   * Returns whether the pip is currently displayed or not.
   * @returns {boolean} true if the pip is displayed, false otherwise.
   */
  get displayed() {
    return this._displayed;
  }

  /* ------------------ Text Content ----------------- */

  /**
   * Sets the text content of the pip to the given value.
   * The text content is the text displayed inside the pip.
   * @param {string} value The value to set the text content to.
   */
  set textContent(value) {
    this._textContent = value;
    this.element.textContent = value;
  }

  /**
   * Returns the text content of the pip.
   * @returns {string} The text content of the pip.
   */
  get textContent() {
    return this._textContent;
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

  /* ------------------------------------------------- */

  /** Renders the pip by assigning various properties. */
  renderPip() {
    const { HIDE_UNUSED_PIPS } = CONFIG.settings;

    this.place = 2 ** (7 - this.index);
    this.hidden =
      HIDE_UNUSED_PIPS && this.place > CONFIG.MAXIMUM_PIPS[this.unit];
  }
}

export class MeridiemPip extends Pip {
  constructor(pip) {
    super(null, null, pip);
    this.active = true;
  }

  /** Renders the meridiem pip, */
  renderPip() {
    // Don't call super.
    if (CONFIG.settings.TWELVE_HOUR_TIME) {
      // Hide first hour pip to make room for meridiem pip.
      this.displayed = true;
    } else this.displayed = false;

    // Set text content.
    this.textContent = Clock.date.getHours() >= 12 ? "PM" : "AM";
  }
}
