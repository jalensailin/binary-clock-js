export default class CONFIG {
  static SHOW_PLACE_VALUES = true;

  static TWELVE_HOUR_TIME = false;

  static HIDE_UNUSED_PIPS = true;

  static MAXIMUM_PIPS = {
    hours: CONFIG.TWELVE_HOUR_TIME ? 12 : 24,
    minutes: 60,
    seconds: 60,
  };
}
