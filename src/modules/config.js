import { snakeToKebab } from "./utils.js";

export default class CONFIG {
  static form = document.querySelector("form");

  static formButton = document.querySelector("#toggle-config");

  static TIME_UNITS = /**  @type {const} */ (["hours", "minutes", "seconds"]);

  static MAXIMUM_PIPS = {
    hours: CONFIG.TWELVE_HOUR_TIME ? 12 : 24,
    minutes: 60,
    seconds: 60,
  };

  static settings = {
    SHOW_PLACE_VALUES: true,
    TWELVE_HOUR_TIME: false,
    HIDE_UNUSED_PIPS: true,
  };

  /** Initialize the clock. */
  static initialize() {
    this.setDefaultSettings();
    this.activateListeners();
  }

  /**
   * Sets the default settings of by checking the corresponding
   * form fields. Static properties are then set accordingly.
   */
  static setDefaultSettings() {
    const { settings } = CONFIG;

    Object.keys(settings).forEach((key) => {
      if (key === "MAXIMUM_PIPS") return;
      const kebabKey = snakeToKebab(key);
      this.form.querySelector(`#${kebabKey}`).checked = settings[key];
    });
  }

  /** Method to register event listeners. */
  static activateListeners() {
    // Show/hide config form.
    this.formButton.addEventListener("click", (event) => {
      this.form.classList.toggle("show");
    });

    // Update config object and re-render clock.
    this.form.addEventListener("change", (event) => {
      // early return if target is not input:
      if (event.target.tagName !== "INPUT") return;

      const { name, checked } = event.target;
      const setting = Object.keys(CONFIG.settings).find((key) => {
        const kebabKey = snakeToKebab(key);
        return kebabKey === name;
      });

      // Update config object.
      CONFIG.settings[setting] = checked;

      // Re-render clock with new settings.
      Clock.binary.renderClock();
      Clock.decimal.renderClock();
    });
  }
}
