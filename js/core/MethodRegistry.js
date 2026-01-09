/**
 * Registry pattern for method management
 * Enables dynamic method registration without modifying core code
 * Follows Open/Closed Principle
 */
export class MethodRegistry {
  constructor() {
    this._methods = new Map();
  }

  /**
   * Register a method
   * @param {Object} method - Method implementation
   * @throws {Error} If method is invalid or already registered
   */
  register(method) {
    this._validateMethod(method);

    if (this._methods.has(method.id)) {
      throw new Error(`Method with id "${method.id}" is already registered`);
    }

    this._methods.set(method.id, method);
  }

  /**
   * Register multiple methods at once
   * @param {Array<Object>} methods - Array of method implementations
   */
  registerAll(methods) {
    methods.forEach((method) => this.register(method));
  }

  /**
   * Get method by ID
   * @param {string} id - Method identifier
   * @returns {Object|null} Method implementation or null
   */
  get(id) {
    return this._methods.get(id) || null;
  }

  /**
   * Get all registered methods
   * @returns {Array<Object>} Array of all methods
   */
  getAll() {
    return Array.from(this._methods.values());
  }

  /**
   * Check if method exists
   * @param {string} id - Method identifier
   * @returns {boolean}
   */
  has(id) {
    return this._methods.has(id);
  }

  /**
   * Get method IDs
   * @returns {Array<string>}
   */
  getIds() {
    return Array.from(this._methods.keys());
  }

  /**
   * Get method count
   * @returns {number}
   */
  get size() {
    return this._methods.size;
  }

  /**
   * Validate method interface compliance
   * @param {Object} method - Method to validate
   * @throws {Error} If method doesn't implement required interface
   * @private
   */
  _validateMethod(method) {
    const required = [
      'id',
      'titleKey',
      'subtitleKey',
      'getDefaultState',
      'renderVisual',
      'renderInputs',
      'renderSettings',
      'validate',
      'run',
    ];

    const missing = required.filter((prop) => !(prop in method));

    if (missing.length > 0) {
      throw new Error(
        `Method is missing required properties: ${missing.join(', ')}`
      );
    }

    if (typeof method.id !== 'string' || !method.id.trim()) {
      throw new Error('Method id must be a non-empty string');
    }

    if (typeof method.getDefaultState !== 'function') {
      throw new Error('Method getDefaultState must be a function');
    }

    if (typeof method.validate !== 'function') {
      throw new Error('Method validate must be a function');
    }

    if (typeof method.run !== 'function') {
      throw new Error('Method run must be a function');
    }
  }

  /**
   * Create a method registry with default methods
   * @returns {MethodRegistry}
   */
  static createDefault() {
    return new MethodRegistry();
  }
}
