/**
 * Converts a given decimal number to its binary representation.
 * Pad the binary representation with leading zeros to make it 8 characters long.
 * @param {number} decimal
 * @returns {string} Binary representation of the given decimal number.
 */
export function toBinary(decimal) {
  return decimal.toString(2).padStart(8, "0");
}

/**
 * Converts a given string in SCREAMING_SNAKE_CASE to kebab-case.
 * Replaces all underscores with hyphens and converts the string to lowercase.
 * @param {string} str The string to convert.
 * @returns {string} The converted string in kebab-case.
 */
export function snakeToKebab(str) {
  return str.replace(/_/g, "-").toLowerCase();
}
