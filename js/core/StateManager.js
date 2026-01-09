/**
 * Centralized state management with persistence
 * Follows Single Responsibility Principle - only handles state
 */
import { STORAGE_KEYS, UI_CONSTANTS } from '../constants.js';
import { HistoryEntry } from '../domain/HistoryEntry.js';

export class StateManager {
  /**
   * @param {Storage} storage - Storage implementation (localStorage or fallback)
   * @param {Object} defaultState - Initial state structure
   */
  constructor(storage, defaultState = {}) {
    this._storage = storage;
    this._state = this._loadState(defaultState);
    this._history = this._loadHistory();
    this._listeners = new Set();
  }

  /**
   * Get current state (immutable copy)
   * @returns {Object}
   */
  getState() {
    return { ...this._state };
  }

  /**
   * Update state with partial changes
   * @param {Object} updates - State updates
   */
  setState(updates) {
    this._state = { ...this._state, ...updates };
    this._saveState();
    this._notifyListeners();
  }

  /**
   * Get method state
   * @param {string} methodId - Method identifier
   * @returns {Object|null}
   */
  getMethodState(methodId) {
    return this._state.methodStates?.[methodId] || null;
  }

  /**
   * Update method state
   * @param {string} methodId - Method identifier
   * @param {Object} methodState - New method state
   */
  setMethodState(methodId, methodState) {
    this._state.methodStates = {
      ...this._state.methodStates,
      [methodId]: methodState,
    };
    this._saveState();
    this._notifyListeners();
  }

  /**
   * Get history entries
   * @returns {Array<HistoryEntry>}
   */
  getHistory() {
    return [...this._history];
  }

  /**
   * Add entry to history
   * @param {HistoryEntry} entry - History entry to add
   */
  addToHistory(entry) {
    if (!(entry instanceof HistoryEntry)) {
      throw new Error('Entry must be an instance of HistoryEntry');
    }

    this._history.unshift(entry);
    this._history = this._history.slice(0, UI_CONSTANTS.HISTORY_MAX_ITEMS);
    this._saveHistory();
    this._notifyListeners();
  }

  /**
   * Clear all history
   */
  clearHistory() {
    this._history = [];
    this._saveHistory();
    this._notifyListeners();
  }

  /**
   * Subscribe to state changes
   * @param {Function} listener - Callback function
   * @returns {Function} Unsubscribe function
   */
  subscribe(listener) {
    this._listeners.add(listener);
    return () => this._listeners.delete(listener);
  }

  /**
   * Load state from storage
   * @param {Object} fallback - Default state
   * @returns {Object}
   * @private
   */
  _loadState(fallback) {
    try {
      const raw = this._storage.getItem(STORAGE_KEYS.STATE);
      if (!raw) return fallback;

      const parsed = JSON.parse(raw);
      return { ...fallback, ...parsed };
    } catch (error) {
      console.warn('Failed to load state:', error);
      return fallback;
    }
  }

  /**
   * Save state to storage
   * @private
   */
  _saveState() {
    try {
      this._storage.setItem(STORAGE_KEYS.STATE, JSON.stringify(this._state));
    } catch (error) {
      console.error('Failed to save state:', error);
    }
  }

  /**
   * Load history from storage
   * @returns {Array<HistoryEntry>}
   * @private
   */
  _loadHistory() {
    try {
      const raw = this._storage.getItem(STORAGE_KEYS.HISTORY);
      if (!raw) return [];

      const parsed = JSON.parse(raw);
      return parsed.map((item) => HistoryEntry.fromObject(item));
    } catch (error) {
      console.warn('Failed to load history:', error);
      return [];
    }
  }

  /**
   * Save history to storage
   * @private
   */
  _saveHistory() {
    try {
      const serialized = this._history.map((entry) => entry.toObject());
      this._storage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(serialized));
    } catch (error) {
      console.error('Failed to save history:', error);
    }
  }

  /**
   * Notify all listeners of state change
   * @private
   */
  _notifyListeners() {
    this._listeners.forEach((listener) => {
      try {
        listener(this._state, this._history);
      } catch (error) {
        console.error('State listener error:', error);
      }
    });
  }
}
