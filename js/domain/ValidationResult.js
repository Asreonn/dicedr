/**
 * Value object representing validation outcome
 * Immutable and type-safe validation result
 */
export class ValidationResult {
  /**
   * @param {boolean} isValid - Whether validation passed
   * @param {string} [message] - Optional error message if invalid
   */
  constructor(isValid, message = '') {
    this._isValid = Boolean(isValid);
    this._message = String(message);
    Object.freeze(this);
  }

  /**
   * @returns {boolean} True if validation passed
   */
  get ok() {
    return this._isValid;
  }

  /**
   * @returns {string} Error message if invalid
   */
  get message() {
    return this._message;
  }

  /**
   * Create a successful validation result
   * @returns {ValidationResult}
   */
  static success() {
    return new ValidationResult(true);
  }

  /**
   * Create a failed validation result
   * @param {string} message - Error message
   * @returns {ValidationResult}
   */
  static failure(message) {
    return new ValidationResult(false, message);
  }

  /**
   * @returns {string} Human-readable representation
   */
  toString() {
    return this._isValid ? 'Valid' : `Invalid: ${this._message}`;
  }
}
