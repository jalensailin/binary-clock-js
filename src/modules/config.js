import { snakeToKebab } from "./utils.js";

export default class CONFIG {
  static CONFIG_VERSION = "v1";

  static SETTING_STORAGE_NAME = `binaryClock.settings.${this.CONFIG_VERSION}`;

  static form = document.querySelector("form");

  static formButton = document.querySelector("#toggle-config");

  static TIME_UNITS = /**  @type {const} */ (["hours", "minutes", "seconds"]);

  static MAXIMUM_PIPS = {
    hours: CONFIG.TWELVE_HOUR_TIME ? 12 : 24,
    minutes: 60,
    seconds: 60,
  };

  static DEFAULT_SETTINGS = /** @type {const} */ ({
    SHOW_PLACE_VALUES: true,
    TWELVE_HOUR_TIME: false,
    HIDE_UNUSED_PIPS: true,
    HIDE_DECIMAL_TIME: false,
    HIDE_TITLE: false,
  });

  /**
   * The current settings object.
   * @type {typeof CONFIG.DEFAULT_SETTINGS}
   */
  static settings;

  /** Initialize the clock. */
  static initialize() {
    const { form } = this;

    // Calculate form width, so it slides out correct distance.
    const formWidth = form.offsetWidth;
    form.style.setProperty("--translation-distance", `${formWidth}px`);

    // Set default settings.
    this.loadSettings();

    // Activate listeners.
    this.activateListeners();
  }

  /**
   * Loads the settings from localStorage and updates the settings object.
   * After loading the settings, it calls renderSettings() to update the UI accordingly.
   */
  static loadSettings() {
    const raw = localStorage.getItem(this.SETTING_STORAGE_NAME);
    if (!raw) this.settings = this.DEFAULT_SETTINGS;

    try {
      this.settings = { ...this.DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch (error) {
      this.settings = { ...this.DEFAULT_SETTINGS };
    }

    this.renderSettings();
  }

  /**
   * Saves the current settings to localStorage.
   * This function is called when any setting is changed.
   */
  static saveSettings() {
    localStorage.setItem(
      this.SETTING_STORAGE_NAME,
      JSON.stringify(this.settings)
    );
  }

  /**
   * Sets the default settings of by checking the corresponding
   * form fields. Static properties are then set accordingly.
   */
  static renderSettings() {
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
      CONFIG.saveSettings();

      // Re-render clock with new settings.
      Clock.binary.renderClock();
      Clock.decimal.renderClock();
    });
  }
}
