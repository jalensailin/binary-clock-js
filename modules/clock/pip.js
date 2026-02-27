export default class Pip {
  constructor(unit, hidePip, placeValue, pip) {
    // Define element first.
    this.element = pip;

    // Set properties
    this.unit = unit;
    this.hidden = hidePip;
    this.place = placeValue;
  }

  #active;

  #hidden;

  /* --------------------- Active -------------------- */
  set active(value) {
    if (value) {
      this.#active = true;
      this.element.classList.add("active");
    } else {
      this.#active = false;
      this.element.classList.remove("active");
    }
  }

  get active() {
    return this.#active;
  }

  /* --------------------- Hidden -------------------- */
  set hidden(value) {
    if (value) {
      this.#hidden = true;
      this.element.classList.add("hidden");
    } else {
      this.#hidden = false;
      this.element.classList.remove("hidden");
    }
  }

  get hidden() {
    return this.#hidden;
  }

  /* --------------------- Place --------------------- */
  set place(value) {
    this.element.setAttribute("data-binary-place-value", value);
  }

  get place() {
    return this.element.getAttribute("data-binary-place-value");
  }
}
