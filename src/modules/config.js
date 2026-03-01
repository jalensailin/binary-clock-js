import { snakeToKebab } from "./utils.js";

export default class CONFIG {
  static CONFIG_VERSION = "v1";

  static SETTING_STORAGE_NAME = `binaryClock.settings.${this.CONFIG_VERSION}`;

  static form = document.querySelector("form");

  static buttons = {
    toggle: document.querySelector("#toggle-config"),
    reset: this.form.querySelector("#reset-settings"),
    close: this.form.querySelector("#close-settings"),
    zen: this.form.querySelector("#zen-settings"),
  };

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

  static ZEN_SETTINGS = /** @type {const} */ ({
    SHOW_PLACE_VALUES: false,
    TWELVE_HOUR_TIME: false,
    HIDE_UNUSED_PIPS: true,
    HIDE_DECIMAL_TIME: true,
    HIDE_TITLE: true,
  });

  /**
   * The current settings object.
   * @type {typeof CONFIG.DEFAULT_SETTINGS}
   */
  static #settings;

  /**
   * Updates the current settings object with the given object.
   * If the given object is not a valid object (i.e. not an object with boolean values for each key in settingsKeys), the method does nothing.
   * If the object is valid, it updates the current settings object, saves the settings to localStorage, and re-renders the config form and clock with the new settings.
   * @param {Object} obj The object to update the current settings with.
   */
  static set(obj) {
    // Attempt some validation.
    if (typeof obj !== "object") return;
    const entries = Object.entries(obj);
    const objValid = entries.some(
      ([k, v]) => this.settingsKeys.includes(k) && typeof v === "boolean"
    );
    if (!objValid) return;

    this.#settings = {
      ...this.#settings,
      ...obj,
    };

    this.saveSettings();
    this.renderSettings();
    if (globalThis.Clock) this.renderClocks();
  }

  static get settings() {
    return this.#settings;
  }

  static get settingsKeys() {
    return Object.keys(this.DEFAULT_SETTINGS);
  }

  /** Initialize the clock. */
  static initialize() {
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
    if (!raw) this.set(this.DEFAULT_SETTINGS);

    try {
      this.set({ ...this.DEFAULT_SETTINGS, ...JSON.parse(raw) });
    } catch (error) {
      this.set({ ...this.DEFAULT_SETTINGS });
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
      const kebabKey = snakeToKebab(key);

      const checkbox = this.form.querySelector(`#${kebabKey}`);
      checkbox.checked = settings[key];

      const { parentElement } = checkbox;
      if (settings[key]) parentElement.classList.add("active");
      else parentElement.classList.remove("active");

      this.checkIfDefaultSettings();
      this.checkIfZenSettings();
    });
  }

  /** Method to register event listeners. */
  static activateListeners() {
    // Show/hide config form.
    this.buttons.toggle.addEventListener("click", (event) => {
      // Calculate form width, so it slides out correct distance.
      this.setFormWidth();
      this.form.classList.toggle("show");
    });

    // Close config form.
    this.buttons.close.addEventListener("click", () => {
      this.form.classList.remove("show");
    });

    // Reset settings to default.
    this.buttons.reset.addEventListener("click", () => {
      this.set(this.DEFAULT_SETTINGS);
    });

    this.buttons.zen.addEventListener("click", () => {
      this.set(this.ZEN_SETTINGS);
    });

    // Update config object and re-render clock.
    this.form.addEventListener("change", (event) => {
      const { name, checked, tagName } = event.target;
      // early return if target is not input:
      if (tagName !== "INPUT") return;

      const settingName = this.settingsKeys.find(
        (key) => snakeToKebab(key) === name
      );

      // Update config object.
      this.set({ [settingName]: checked });
    });
  }

  /** Calculate and set form width, so it slides out correct distance. */
  static setFormWidth() {
    const formWidth = this.form.offsetWidth;
    this.form.style.setProperty("--translation-distance", `${formWidth}px`);
  }

  /**
   * Check if the current settings are the default settings.
   * Set the reset button accordingly.
   */
  static checkIfDefaultSettings() {
    if (JSON.stringify(this.settings) === JSON.stringify(this.DEFAULT_SETTINGS))
      this.buttons.reset.setAttribute("disabled", "");
    else this.buttons.reset.removeAttribute("disabled");
  }

  /**
   * Check if the current settings are the zen settings.
   * Set the zen button accordingly.
   */
  static checkIfZenSettings() {
    if (JSON.stringify(this.settings) === JSON.stringify(this.ZEN_SETTINGS))
      this.buttons.zen.setAttribute("disabled", "");
    else this.buttons.zen.removeAttribute("disabled");
  }

  /** Renders all clocks with new settings. */
  static renderClocks() {
    Clock.binary.renderClock();
    Clock.decimal.renderClock();
  }
}
