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

  static MEDIA_QUERIES = /** @type {const} */ ({
    1070: window.matchMedia("(max-width: 1070px)"),
    "1070x590": window.matchMedia(
      "(max-width: 1070px) and (max-height: 590px)"
    ),
  });

  /**
   * The current settings object.
   * @type {typeof CONFIG.DEFAULT_SETTINGS}
   */
  static #settings;

  /**
   * The click listener for the outside of the config form.
   * Made accessible so it can be removed from outside its definition.
   * @type {Function|null}
   */
  static _outsideClickListener = null;

  /**
   * Returns an object containing the maximum number of pips that can be displayed
   * for each time unit (hours, minutes, seconds).
   */
  static get MAXIMUM_PIPS() {
    return /** @type {const} */ ({
      hours: this.settings.TWELVE_HOUR_TIME ? 12 : 24,
      minutes: 60,
      seconds: 60,
    });
  }

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
    const { buttons, form } = this;
    // Show/hide config form.
    buttons.toggle.addEventListener("click", (event) => {
      // Calculate form width, so it slides out correct distance.
      this.setTranslationDistance();
      form.classList.toggle("show");

      // Add click listener to outside of form. Could use some refactoring.
      if (
        this.MEDIA_QUERIES["1070x590"].matches &&
        form.classList.contains("show")
      ) {
        if (this._outsideClickListener) return;
        setTimeout(() => {
          this._outsideClickListener = (e) => {
            // If the click is outside the form, close it.
            if (form.contains(e.target)) return;
            form.classList.remove("show");
            document.removeEventListener("click", this._outsideClickListener);
            this._outsideClickListener = null;
          };
          document.addEventListener("click", this._outsideClickListener);
        }, 0);
      }
    });

    // Close config form.
    buttons.close.addEventListener("click", () => {
      form.classList.remove("show");

      // Remove click outside-of-form listener.
      document.removeEventListener("click", this._outsideClickListener);
      this._outsideClickListener = null;
    });

    // Reset settings to default.
    buttons.reset.addEventListener("click", () => {
      this.set(this.DEFAULT_SETTINGS);
    });

    buttons.zen.addEventListener("click", () => {
      this.set(this.ZEN_SETTINGS);
    });

    // Update config object.
    form.addEventListener("change", (event) => {
      const { name, checked, tagName } = event.target;
      // early return if target is not input:
      if (tagName !== "INPUT") return;

      const settingName = this.settingsKeys.find(
        (key) => snakeToKebab(key) === name
      );

      // Update config object.
      this.set({ [settingName]: checked });
    });

    Object.values(this.MEDIA_QUERIES).forEach((mql) =>
      mql.addEventListener("change", this.setTranslationDistance.bind(this))
    );
  }

  /** Calculate and set form width, so it slides out correct distance. */
  static setTranslationDistance() {
    let translationDist = this.form.offsetWidth;

    if (this.MEDIA_QUERIES["1070"].matches) {
      translationDist = this.form.offsetHeight;
    }

    if (this.MEDIA_QUERIES["1070x590"].matches) {
      translationDist = 0;
    }

    this.form.style.setProperty(
      "--translation-distance",
      `${translationDist}px`
    );
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
