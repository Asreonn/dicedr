/**
 * Value object representing a history entry
 * Immutable record of a method execution result
 */
export class HistoryEntry {
  /**
   * @param {string} value - The result value
   * @param {string} methodId - Method identifier
   * @param {string} methodLabel - Localized method name
   * @param {string} shareState - Encoded shareable state
   * @param {number} timestamp - Unix timestamp in milliseconds
   */
  constructor(value, methodId, methodLabel, shareState, timestamp = Date.now()) {
    if (!value || !methodId || !methodLabel) {
      throw new Error('HistoryEntry requires value, methodId, and methodLabel');
    }

    this.value = String(value);
    this.methodId = String(methodId);
    this.methodLabel = String(methodLabel);
    this.shareState = String(shareState);
    this.timestamp = Number(timestamp);

    Object.freeze(this);
  }

  /**
   * Create from plain object (for deserialization)
   * @param {Object} obj - Plain object with history data
   * @returns {HistoryEntry}
   */
  static fromObject(obj) {
    return new HistoryEntry(
      obj.value,
      obj.methodId,
      obj.methodLabel,
      obj.shareState,
      obj.timestamp
    );
  }

  /**
   * Convert to plain object (for serialization)
   * @returns {Object}
   */
  toObject() {
    return {
      value: this.value,
      methodId: this.methodId,
      methodLabel: this.methodLabel,
      shareState: this.shareState,
      timestamp: this.timestamp,
    };
  }

  /**
   * Get human-readable time ago string
   * @returns {string}
   */
  getTimeAgo() {
    const seconds = Math.floor((Date.now() - this.timestamp) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  }
}
