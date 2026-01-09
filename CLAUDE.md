# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Dicedr** is a mobile-first, visual-heavy decision and party-game website. Users pick a method (Wheel, Dice, Coin Flip, Slot, Random Picker), fill inputs, hit run, and get an animated result.

**Critical constraint:** This is a **static site** with **no build step**. It runs by opening `index.html` directly in a browser. No Vite, no bundlers, no npm commands.

## Development Commands

Since this is a static site with no build process:

- **Run locally:** Open `index.html` in a browser (or use any static server like `python3 -m http.server`)
- **Deploy:** Upload all files to any static host (GitHub Pages, Netlify Drop, etc.)
- **No tests currently configured**
- **No linting currently configured**

## Architecture

### Core Design Principles

1. **Static-first:** Vanilla JavaScript ES6 modules, no bundlers
2. **Method catalog pattern:** All decision tools follow the same interface (wheel, dice, coin, slot, random picker)
3. **Visual-first:** Canvas-based animations using Web Animations API for buttery smooth transitions
4. **Bilingual:** TR/EN support with auto-detection via browser language

### File Structure

```
/
├── index.html              # Single-page entry point with embedded i18n JSON
├── js/
│   ├── app.js             # Boot, main app state, method orchestration
│   ├── router.js          # Hash-based client-side routing (#home, #method/wheel)
│   ├── store.js           # localStorage persistence + URL share state encoding
│   ├── i18n.js            # Language detection and i18n utilities
│   ├── bundle.js          # Combined build output
│   ├── methods/           # Each method is a self-contained module
│   │   ├── wheel.js       # Canvas-based spinning wheel
│   │   ├── dice.js
│   │   ├── coin.js
│   │   ├── slot.js
│   │   └── random.js
│   └── ui/                # Reusable UI components
│       ├── home.js        # Home screen with method grid
│       ├── methodView.js  # Unified method template (visual + inputs + settings)
│       ├── resultModal.js # Full-screen result reveal
│       ├── listEditor.js  # Shared list input component
│       └── history.js     # Recent runs display
├── styles/
│   ├── base.css           # CSS reset and typography
│   ├── theme.css          # Color variables and dark theme
│   ├── layout.css         # Phone-frame container, mobile-first grid
│   └── components.css     # Buttons, cards, modals, animations
├── i18n/
│   ├── en.json            # English translations
│   └── tr.json            # Turkish translations
└── assets/                # Icons, sounds, images
```

### Method Interface

Every decision method (wheel, dice, coin, etc.) must implement:

```javascript
{
  id: string,                    // Unique method ID
  titleKey: string,              // i18n key for title
  subtitleKey: string,           // i18n key for subtitle
  getDefaultState(t): object,    // Returns initial state { inputs, settings }
  renderVisual(container, state, t): void,  // Renders canvas/visual preview
  renderInputs(container, state, t, onUpdate): void,  // Input UI
  renderSettings(container, state, t, onUpdate): void, // Settings UI
  validate(state, t): {ok: boolean, message?: string}, // Input validation
  run({state, t, visualEl, onDone}): void  // Execute animation + call onDone(result, nextState)
}
```

### State Management

- **appState** (js/app.js:50-53): Global state with `methodId` and per-method `methodStates`
- **Persistence:** localStorage (`dicedr_state`, `dicedr_history`) via `store.js`
- **Sharing:** URL encoding with `?state=base64` query param for shareable links
- **History:** Last 20 results stored in localStorage, displayed in method views

### Routing

Simple hash-based routing (js/router.js):
- `#home` → Home view with method grid
- `#method/wheel` → Opens wheel method
- `#method/dice?state=encodedState` → Opens dice with pre-populated inputs (shareable link)

### i18n System

1. Translations embedded in `index.html` as JSON scripts (`#i18n-en`, `#i18n-tr`)
2. Also stored as separate files in `i18n/en.json` and `i18n/tr.json`
3. Auto-detect via `navigator.language` (js/i18n.js)
4. Manual toggle via header buttons
5. All UI text uses `data-i18n` attributes or `t()` function calls

### Visual/Animation System

- **Canvas:** Used for wheel and slot (high-performance 2D rendering)
- **Web Animations API:** Native browser animations for smooth transitions (js/methods/wheel.js:47-56)
- **GSAP via CDN:** Available if needed for complex easing (not currently used)
- **Result reveal:** Full-screen modal with celebration animations

## Adding a New Method

1. Create `js/methods/yourmethod.js` implementing the method interface
2. Import and add to methods array in `js/app.js:20`
3. Add translation keys to `i18n/en.json` and `i18n/tr.json`:
   ```json
   "method.yourmethod.title": "Your Method",
   "method.yourmethod.subtitle": "Description"
   ```
4. Method will automatically appear in home grid and be routable via `#method/yourmethod`

## Key Constraints

- **No bundlers:** Use ES6 imports with full file extensions (`.js`)
- **No npm packages:** Use CDN links if external libraries needed
- **localStorage fallback:** Graceful degradation if localStorage unavailable (js/app.js:26-46)
- **Mobile-first:** Desktop shows phone-frame centered container (420-480px)
- **Reduced motion:** Support `prefers-reduced-motion` for accessibility

## Common Patterns

### Updating method state:
```javascript
onUpdate({ inputs: newInputs })  // Partial state merge
onUpdate({ settings: { ...state.settings, noRepeat: true } })
```

### Running animations:
All animations call `onDone(resultValue, nextState)` when complete. The app handles history, modal display, and state persistence.

### Validation:
Return `{ok: true}` to enable run button, or `{ok: false, message: t('key')}` to disable.

## Product Goals

- **Instant usability:** First result within 10 seconds
- **Visual delight:** Animations are core feature, not decoration
- **Zero backend:** Everything runs client-side
- **Shareable:** URL state encoding allows sharing exact setup with friends
