/**
 * Application-wide constants
 * Centralizes magic strings and numbers for maintainability
 */

// Storage keys
export const STORAGE_KEYS = {
  STATE: 'dicedr_state',
  HISTORY: 'dicedr_history',
  LANGUAGE: 'dicedr_lang',
};

// UI constants
export const UI_CONSTANTS = {
  TOAST_DURATION_MS: 1600,
  HISTORY_MAX_ITEMS: 20,
  ANIMATION_DURATION_SHORT_MS: 800,
  ANIMATION_DURATION_LONG_MS: 2200,
};

// Input limits
export const INPUT_LIMITS = {
  MIN_ITEMS: 2,
  MAX_ITEMS: 100,
  MIN_PICK_COUNT: 1,
  MAX_PICK_COUNT: 10,
  MIN_DICE_VALUE: -999,
  MAX_DICE_VALUE: 999,
};

// Animation easing curves
export const EASING = {
  SMOOTH_STOP: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
  SLOW_START: 'cubic-bezier(0.1, 0.7, 0.2, 1)',
  BOUNCE: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
};

// Default language
export const DEFAULT_LANGUAGE = 'en';

// Wheel visual constants
export const WHEEL_CONSTANTS = {
  SIZE: 240,
  COLORS: ['#48d2b7', '#f6b05b', '#6fa4ff', '#ff7f7f', '#b58cff'],
  MIN_SPINS: 4,
  MAX_SPINS: 6,
};

// Slot visual constants
export const SLOT_CONSTANTS = {
  REEL_COUNT: 3,
  ITEMS_PER_REEL: 6,
  BASE_DURATION_MS: 1600,
  STAGGER_MS: 200,
};

// Example data for list editor
export const EXAMPLE_DATA = {
  food: ['Pizza', 'Sushi', 'Burgers', 'Salad', 'Tacos'],
  movie: ['Comedy', 'Drama', 'Action', 'Sci-fi', 'Animation'],
  activity: ['Walk', 'Game night', 'Cafe', 'Beach', 'Museum'],
  chores: ['Dishes', 'Vacuum', 'Laundry', 'Trash', 'Plants'],
};

// Dice presets
export const DICE_PRESETS = {
  d6: { min: 1, max: 6 },
  d20: { min: 1, max: 20 },
  d100: { min: 1, max: 100 },
};
