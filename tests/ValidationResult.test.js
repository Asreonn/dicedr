/**
 * Unit tests for ValidationResult value object
 */
import { ValidationResult } from '../js/domain/ValidationResult.js';

const test = (name, fn) => {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`, error.message);
    throw error;
  }
};

const assert = {
  equal: (actual, expected, message) => {
    if (actual !== expected) {
      throw new Error(message || `Expected ${expected}, got ${actual}`);
    }
  },
  strictEqual: (actual, expected) => {
    if (actual !== expected) {
      throw new Error(`Expected ${expected}, got ${actual}`);
    }
  },
};

test('ValidationResult.success creates valid result', () => {
  const result = ValidationResult.success();
  assert.equal(result.ok, true);
  assert.equal(result.message, '');
});

test('ValidationResult.failure creates invalid result', () => {
  const result = ValidationResult.failure('Test error');
  assert.equal(result.ok, false);
  assert.equal(result.message, 'Test error');
});

test('ValidationResult is immutable', () => {
  const result = ValidationResult.success();
  try {
    result._isValid = false; // Should fail in strict mode
  } catch (e) {
    // Expected
  }
  assert.equal(result.ok, true, 'Result should remain valid');
});

test('ValidationResult.toString provides readable output', () => {
  const success = ValidationResult.success();
  assert.equal(success.toString(), 'Valid');

  const failure = ValidationResult.failure('Required field');
  assert.equal(failure.toString(), 'Invalid: Required field');
});

test('ValidationResult converts boolean correctly', () => {
  const valid = new ValidationResult(1, ''); // Truthy
  assert.equal(valid.ok, true);

  const invalid = new ValidationResult(0, ''); // Falsy
  assert.equal(invalid.ok, false);
});

console.log('All ValidationResult tests passed!');
