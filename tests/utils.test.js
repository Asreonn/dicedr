/**
 * Unit tests for utility functions
 * Run with: Open in browser with a test runner or use Node + jsdom
 */

// Mock test framework (replace with Jest/Vitest in real implementation)
const test = (name, fn) => {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`, error.message);
  }
};

const assert = {
  equal: (actual, expected) => {
    if (actual !== expected) {
      throw new Error(`Expected ${expected}, got ${actual}`);
    }
  },
  deepEqual: (actual, expected) => {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    }
  },
  throws: (fn, message) => {
    try {
      fn();
      throw new Error('Expected function to throw');
    } catch (error) {
      if (message && !error.message.includes(message)) {
        throw new Error(`Expected error message to include "${message}"`);
      }
    }
  },
};

// Import utilities (adjust path as needed)
import { clamp, parseLines, unique, shuffle, randInt, pickN } from '../js/utils.js';

// Test suite
test('clamp - constrains value within range', () => {
  assert.equal(clamp(5, 0, 10), 5);
  assert.equal(clamp(-5, 0, 10), 0);
  assert.equal(clamp(15, 0, 10), 10);
  assert.equal(clamp(0, 0, 10), 0);
  assert.equal(clamp(10, 0, 10), 10);
});

test('parseLines - splits and trims lines', () => {
  assert.deepEqual(parseLines('a\nb\nc'), ['a', 'b', 'c']);
  assert.deepEqual(parseLines('  a  \n  b  \n  c  '), ['a', 'b', 'c']);
  assert.deepEqual(parseLines('a\n\nb\n\n'), ['a', 'b']);
  assert.deepEqual(parseLines(''), []);
});

test('unique - removes duplicates', () => {
  assert.deepEqual(unique([1, 2, 2, 3, 3, 3]), [1, 2, 3]);
  assert.deepEqual(unique(['a', 'b', 'a']), ['a', 'b']);
  assert.deepEqual(unique([]), []);
});

test('shuffle - randomizes array without mutation', () => {
  const original = [1, 2, 3, 4, 5];
  const shuffled = shuffle(original);

  assert.equal(shuffled.length, original.length);
  assert.deepEqual(original, [1, 2, 3, 4, 5]); // Original unchanged
  assert.equal(shuffled.every((item) => original.includes(item)), true);
});

test('randInt - generates integer in range', () => {
  for (let i = 0; i < 100; i++) {
    const val = randInt(1, 10);
    assert.equal(val >= 1 && val <= 10, true);
    assert.equal(Number.isInteger(val), true);
  }
});

test('pickN - picks N items with repeat', () => {
  const items = ['a', 'b', 'c'];
  const picked = pickN(items, 5, false);

  assert.equal(picked.length, 5);
  assert.equal(picked.every((item) => items.includes(item)), true);
});

test('pickN - picks N items without repeat', () => {
  const items = ['a', 'b', 'c', 'd', 'e'];
  const picked = pickN(items, 3, true);

  assert.equal(picked.length, 3);
  assert.equal(new Set(picked).size, 3); // No duplicates
  assert.equal(picked.every((item) => items.includes(item)), true);
});

console.log('All utils tests completed!');
