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
    const { form } = this;

    // Calculate form width, so it slides out correct distance.
    const formWidth = form.offsetWidth;
    form.style.setProperty("--translation-distance", `${formWidth}px`);

    // Set default settings.
    this.setDefaultSettings();

    // Activate listeners.
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

      const checkbox = this.form.querySelector(`#${kebabKey}`);
      checkbox.checked = settings[key];

      if (settings[key]) checkbox.parentElement.classList.add("active");
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

      event.target.parentElement.classList.toggle("active");

      // Update config object.
      CONFIG.settings[setting] = checked;

      // Re-render clock with new settings.
      Clock.binary.renderClock();
      Clock.decimal.renderClock();
    });
  }
}
