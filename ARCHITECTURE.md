# Dicedr Architecture Documentation

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          USER INTERFACE                          │
│                        (index.html + CSS)                        │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                           │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Router     │  │     i18n     │  │  UIController│          │
│  │  (hash-based)│  │ (translations)│  │ (view mgmt)  │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                  │                  │                   │
│         └──────────────────┼──────────────────┘                  │
│                            │                                      │
│                            ▼                                      │
│  ┌─────────────────────────────────────────────────────┐        │
│  │              CORE ORCHESTRATOR (app.js)              │        │
│  └──────┬──────────────────┬───────────────────┬───────┘        │
│         │                  │                   │                 │
└─────────┼──────────────────┼───────────────────┼─────────────────┘
          │                  │                   │
          ▼                  ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  StateManager   │ │ MethodRegistry  │ │   DOMBuilder    │
│                 │ │                 │ │                 │
│ • State mgmt    │ │ • Method store  │ │ • DOM creation  │
│ • Persistence   │ │ • Validation    │ │ • Event binding │
│ • Subscriptions │ │ • Lookup        │ │ • Declarative   │
└────────┬────────┘ └────────┬────────┘ └─────────────────┘
         │                   │
         │                   ├──────────────────┐
         │                   │                  │
         ▼                   ▼                  ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   localStorage  │ │  Wheel Method   │ │  Dice Method    │
│   (Storage)     │ │  • validate()   │ │  • validate()   │
└─────────────────┘ │  • render()     │ │  • render()     │
                    │  • run()        │ │  • run()        │
                    └─────────────────┘ └─────────────────┘
                              │
                              ▼
                    ┌─────────────────────┐
                    │  Domain Objects     │
                    ├─────────────────────┤
                    │ • ValidationResult  │
                    │ • HistoryEntry      │
                    └─────────────────────┘
```

---

## Component Responsibilities

### Application Layer

#### **Router** (js/router.js)
- Parses URL hash (`#home`, `#method/wheel`)
- Triggers navigation callbacks
- Handles share state in URL

#### **i18n** (js/i18n.js)
- Detects browser language
- Loads translation dictionaries
- Applies translations to DOM

#### **UIController** (distributed in js/ui/)
- Renders views (home, method, modal)
- Handles user interactions
- Updates DOM based on state

---

### Core Layer

#### **StateManager** (js/core/StateManager.js)

**Purpose**: Single source of truth for application state

```
State Structure:
{
  methodId: "wheel",
  language: "en",
  methodStates: {
    wheel: { inputs: [...], settings: {...} },
    dice: { inputs: {...}, settings: {...} }
  }
}
```

**Responsibilities:**
- Load/save state from localStorage
- Provide immutable state access
- Notify subscribers of changes
- Manage history entries

**API:**
```javascript
const manager = new StateManager(storage, defaultState);

manager.getState()              // Get current state
manager.setState({ foo: 'bar' }) // Update state
manager.getMethodState('wheel')  // Get method-specific state
manager.subscribe(listener)      // Watch for changes
manager.addToHistory(entry)      // Add to history
```

---

#### **MethodRegistry** (js/core/MethodRegistry.js)

**Purpose**: Centralized method management (Plugin pattern)

```
Registry:
┌─────────────────────────────────┐
│  Map<id, method>                │
├─────────────────────────────────┤
│  "wheel"  → wheelMethod         │
│  "dice"   → diceMethod          │
│  "coin"   → coinMethod          │
│  "slot"   → slotMethod          │
│  "random" → randomMethod        │
└─────────────────────────────────┘
```

**Responsibilities:**
- Validate method interface compliance
- Prevent duplicate registrations
- Provide method lookup
- Enable dynamic method addition

**API:**
```javascript
const registry = new MethodRegistry();

registry.register(method)        // Add one method
registry.registerAll([m1, m2])   // Add multiple
registry.get('wheel')            // Lookup by ID
registry.has('wheel')            // Check existence
registry.getAll()                // Get all methods
```

---

#### **DOMBuilder** (js/core/DOMBuilder.js)

**Purpose**: Declarative DOM element creation

**Responsibilities:**
- Create elements with properties
- Attach event listeners
- Reduce boilerplate
- Provide consistent API

**API:**
```javascript
// Generic element
DOMBuilder.create('div', {
  className: 'card',
  dataset: { id: '123' },
  onClick: handler
}, [child1, child2]);

// Shortcuts
DOMBuilder.button('Click', { className: 'primary', onClick: fn });
DOMBuilder.input('text', { value: '', onInput: fn });
DOMBuilder.section('Title', [content]);
```

---

### Domain Layer

#### **ValidationResult** (js/domain/ValidationResult.js)

**Purpose**: Type-safe validation outcomes

```
ValidationResult
├── ok: boolean
├── message: string
├── success() → ValidationResult
└── failure(msg) → ValidationResult
```

**Benefits:**
- Replaces plain `{ ok, message }` objects
- Immutable value object
- Self-documenting API
- Prevents typos (ok vs isValid vs valid)

**Usage:**
```javascript
// Success
return ValidationResult.success();

// Failure
return ValidationResult.failure('Invalid input');

// Check result
if (result.ok) {
  // Valid
} else {
  console.log(result.message);
}
```

---

#### **HistoryEntry** (js/domain/HistoryEntry.js)

**Purpose**: Immutable history record

```
HistoryEntry
├── value: string          (result)
├── methodId: string       (method identifier)
├── methodLabel: string    (localized name)
├── shareState: string     (encoded state)
├── timestamp: number      (unix ms)
├── fromObject(obj)        (deserialize)
├── toObject()             (serialize)
└── getTimeAgo()           (relative time)
```

**Benefits:**
- Type safety for history items
- Immutable (can't be modified after creation)
- Serialization/deserialization built-in
- Domain logic (getTimeAgo) in one place

**Usage:**
```javascript
const entry = new HistoryEntry(
  'Pizza',           // result value
  'wheel',           // method ID
  'Wheel',           // method label
  'base64state',     // share state
  Date.now()         // timestamp
);

console.log(entry.getTimeAgo()); // "5m ago"
```

---

### Utilities Layer

#### **constants.js**

**Purpose**: Centralized configuration

```javascript
STORAGE_KEYS = {
  STATE: 'dicedr_state',
  HISTORY: 'dicedr_history',
  LANGUAGE: 'dicedr_lang'
}

UI_CONSTANTS = {
  TOAST_DURATION_MS: 1600,
  HISTORY_MAX_ITEMS: 20
}

INPUT_LIMITS = {
  MIN_ITEMS: 2,
  MAX_ITEMS: 100
}

WHEEL_CONSTANTS = {
  SIZE: 240,
  COLORS: ['#48d2b7', ...]
}

EASING = {
  SMOOTH_STOP: 'cubic-bezier(...)'
}
```

**Benefits:**
- Single source of truth
- Easy to modify
- No magic numbers in code
- Better IntelliSense

---

#### **debounce.js**

**Purpose**: Performance optimization utilities

```javascript
debounce(fn, wait)    // Delay until pause
throttle(fn, limit)   // Limit call rate
```

**Usage:**
```javascript
import { debounce } from './utils/debounce.js';

// Input handler
input.addEventListener('input', debounce((e) => {
  search(e.target.value);
}, 300));
```

---

## Data Flow Diagram

### State Update Flow

```
User Action (e.g., add item to list)
    │
    ▼
UI Component detects change
    │
    ▼
Component calls onUpdate({ inputs: [...] })
    │
    ▼
StateManager.setMethodState(methodId, newState)
    │
    ├─> Save to localStorage
    ├─> Notify subscribers
    └─> Trigger re-render
         │
         ▼
    Method.renderVisual() called
         │
         ▼
    UI updates
```

### Method Execution Flow

```
User clicks RUN button
    │
    ▼
app.js::handleRun()
    │
    ├─> Get method from registry
    ├─> Get method state from StateManager
    └─> Validate state
         │
         ▼
    Method.validate(state) → ValidationResult
         │
         ├─> If invalid: Disable button
         └─> If valid:
              │
              ▼
         Method.run({ state, visualEl, onDone })
              │
              ├─> Play animation
              └─> Call onDone(result, nextState)
                   │
                   ▼
              StateManager.setMethodState(nextState)
              StateManager.addToHistory(entry)
                   │
                   ▼
              Show result modal
```

### Share State Flow

```
User clicks SHARE button
    │
    ▼
Get current method state
    │
    ▼
encodeShareState({ methodId, methodState })
    │
    ├─> JSON.stringify()
    └─> Base64 encode
         │
         ▼
    Generate URL: #method/wheel?state=base64...
         │
         ▼
    Copy to clipboard
         │
         ▼
    Show toast notification


Friend opens shared link
    │
    ▼
Router parses hash
    │
    ├─> Extract methodId
    └─> Extract state parameter
         │
         ▼
    decodeShareState(parameter)
         │
         ├─> Base64 decode
         └─> JSON.parse()
              │
              ▼
         StateManager.setMethodState(decodedState)
              │
              ▼
         Render method with shared state
```

---

## Method Interface Contract

Every method MUST implement this interface:

```typescript
interface Method {
  // Metadata
  id: string;
  titleKey: string;        // i18n key
  subtitleKey: string;     // i18n key

  // State management
  getDefaultState(t: Function): MethodState;

  // UI rendering
  renderVisual(container: HTMLElement, state: MethodState, t: Function): void;
  renderInputs(container: HTMLElement, state: MethodState, t: Function, onUpdate: Function): void;
  renderSettings(container: HTMLElement, state: MethodState, t: Function, onUpdate: Function): void;

  // Validation
  validate(state: MethodState, t: Function): ValidationResult;

  // Execution
  run(params: {
    state: MethodState,
    t: Function,
    visualEl: HTMLElement,
    onDone: (result: string, nextState?: MethodState) => void
  }): void;
}
```

### Method State Structure

```typescript
interface MethodState {
  inputs: any;      // Method-specific inputs
  settings: {       // Method-specific settings
    [key: string]: any
  };
}
```

Examples:
```javascript
// Wheel
{
  inputs: ["Pizza", "Sushi", "Burgers"],
  settings: { noRepeat: false }
}

// Dice
{
  inputs: { preset: "d6", min: 1, max: 6 },
  settings: {}
}

// Coin
{
  inputs: { a: "Heads", b: "Tails" },
  settings: {}
}
```

---

## Persistence Strategy

### localStorage Schema

```javascript
// dicedr_state
{
  "methodId": "wheel",
  "language": "en",
  "methodStates": {
    "wheel": { "inputs": [...], "settings": {...} },
    "dice": { "inputs": {...}, "settings": {} }
  }
}

// dicedr_history
[
  {
    "value": "Pizza",
    "methodId": "wheel",
    "methodLabel": "Wheel",
    "shareState": "eyJtZXRob2RJZCI6IndoZWVsIi...",
    "timestamp": 1234567890000
  },
  // ... up to 20 entries
]

// dicedr_lang
"en" or "tr"
```

### Fallback Strategy

If localStorage is unavailable (privacy mode, old browsers):

```javascript
function createStorage() {
  try {
    // Test localStorage
    localStorage.setItem('test', '1');
    localStorage.removeItem('test');
    return localStorage;
  } catch {
    // Fallback: In-memory Map
    const memory = new Map();
    return {
      getItem: (key) => memory.get(key) || null,
      setItem: (key, val) => memory.set(key, val),
      removeItem: (key) => memory.delete(key)
    };
  }
}
```

---

## Extension Points

### Adding a New Method

1. Create method file: `js/methods/mynewmethod.js`
2. Implement method interface
3. Register in app.js:
   ```javascript
   import { myNewMethod } from './methods/mynewmethod.js';
   registry.register(myNewMethod);
   ```
4. Add translations to `i18n/en.json` and `i18n/tr.json`

### Adding a New Value Object

1. Create file in `js/domain/`
2. Make immutable with `Object.freeze(this)`
3. Add `fromObject()` and `toObject()` for serialization
4. Add unit tests

### Adding a New Utility

1. Create file in `js/utils/`
2. Export pure functions
3. Add JSDoc comments
4. Add unit tests

---

## Performance Characteristics

### Time Complexity

| Operation | Complexity | Notes |
|-----------|-----------|-------|
| State get | O(1) | Direct property access |
| State set | O(1) | Spread + save |
| Method lookup | O(1) | Map.get() |
| History add | O(1) | Array.unshift() |
| Validation | O(n) | Where n = input count |
| Rendering | O(n) | Where n = DOM elements |

### Space Complexity

| Component | Storage | Notes |
|-----------|---------|-------|
| State | ~1-5 KB | Per method state |
| History | ~5-20 KB | 20 entries max |
| Translations | ~2-4 KB | EN + TR dicts |
| **Total** | **~10-30 KB** | localStorage |

### Optimization Opportunities

1. **Lazy-load methods** - Dynamic imports
   ```javascript
   const method = await import('./methods/wheel.js');
   ```

2. **Memoize translations** - Cache lookups
   ```javascript
   const cache = new Map();
   t(key) {
     if (!cache.has(key)) {
       cache.set(key, lookupTranslation(key));
     }
     return cache.get(key);
   }
   ```

3. **Virtual scrolling** - For long history
   ```javascript
   // Only render visible items
   renderHistory(visibleRange);
   ```

---

## Security Considerations

### XSS Prevention

✅ **Always use `textContent`** for user input:
```javascript
element.textContent = userInput; // Safe
element.innerHTML = userInput;   // ❌ XSS risk
```

### Input Validation

✅ **Enforce limits**:
```javascript
const clampedValue = clamp(
  userInput,
  INPUT_LIMITS.MIN_ITEMS,
  INPUT_LIMITS.MAX_ITEMS
);
```

### Safe Parsing

✅ **Never throw on bad input**:
```javascript
export function safeJSONParse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback; // Always safe
  }
}
```

---

## Testing Strategy

### Test Pyramid

```
        ┌────────────┐
        │    E2E     │  10% - Full user flows
        └────────────┘
       ┌──────────────┐
       │ Integration  │  20% - Component interactions
       └──────────────┘
      ┌────────────────┐
      │  Unit Tests    │  70% - Pure functions, value objects
      └────────────────┘
```

### What to Test

**High Priority (70%):**
- ✅ Utils (pure functions)
- ✅ Value objects
- ✅ Validation logic
- ✅ State management

**Medium Priority (20%):**
- ⚠️ Method interface compliance
- ⚠️ State persistence
- ⚠️ Event handling

**Low Priority (10%):**
- ⚠️ Animation correctness
- ⚠️ Visual appearance
- ⚠️ Full user flows

---

## Deployment

### Static Site Deployment

Works on any static host:
- GitHub Pages
- Netlify Drop
- Vercel
- Cloudflare Pages
- Traditional web hosting

### Zero-Config Deployment

```bash
# Just upload these files:
index.html
js/
styles/
assets/
i18n/

# No build step needed!
```

### Optional Build Step

For optimization only:

```bash
npm install -D terser
terser js/**/*.js -o dist/bundle.min.js
```

---

## Summary

The refactored Dicedr architecture achieves:

✅ **Separation of Concerns** - Each module has one responsibility
✅ **Testability** - Pure functions and dependency injection
✅ **Extensibility** - Registry pattern for plugins
✅ **Maintainability** - Clear structure and documentation
✅ **Performance** - Debouncing and efficient updates
✅ **Type Safety** - Value objects and validation
✅ **Simplicity** - Still a static site, no build required

The system is production-ready and prepared for future growth.
