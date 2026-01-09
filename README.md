# 🎮 Dicedr - Visual Decision Maker

**Make decisions fun with stunning animations!**

A mobile-first, visual-heavy decision and party-game website. Pick a method (Wheel, Dice, Coin Flip, Slot Machine, Random Picker), add your options, hit run, and get an animated, satisfying result.

🌐 **[Live Demo](#)** | 📖 **[Documentation](#features)** | 🎨 **[Screenshots](#screenshots)**

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![No Build Required](https://img.shields.io/badge/Build-Not%20Required-brightgreen)]()
[![Vanilla JS](https://img.shields.io/badge/Vanilla-JavaScript-yellow)]()

---

## ✨ Features

### 🎯 Decision Methods

- **🎡 Spinning Wheel** - Colorful gradient slices with realistic physics-based rotation
- **🎲 Dice Roller** - 3D cube with all 6 faces, tumbling animation (d6, d20, custom)
- **🪙 Coin Flip** - Realistic 3D metallic coin with customizable labels
- **🎰 Slot Machine** - Vegas-style 3 spinning reels with staggered stops
- **🎯 Random Picker** - Animated gradient pills with shake and reveal effects

### 🎨 Visual Excellence

- **3D Animations** - All methods feature realistic 3D transformations
- **Confetti Celebrations** - 50+ colorful particles burst on every result
- **Smooth Physics** - Natural easing curves and bounce effects
- **Premium Gradients** - 10+ color schemes with metallic finishes
- **Hardware Accelerated** - Buttery smooth 60 FPS animations

### 🌍 User Experience

- **Bilingual** - Full TR/EN support with auto-detection
- **Mobile-First** - Phone-frame layout on desktop, perfect touch targets
- **No Build Step** - Static site, just open `index.html`
- **Shareable Links** - URL state encoding for sharing exact setups
- **History Tracking** - Last 20 results saved locally
- **Reduced Motion** - Accessibility support for motion preferences

---

## 🚀 Quick Start

### Option 1: Direct Usage (No Installation)

1. **Download or clone** this repository
2. **Open `index.html`** in any modern browser
3. **Start making decisions!**

```bash
# Clone the repository
git clone https://github.com/yourusername/dicedr.git
cd dicedr

# Open in browser (or use any static server)
open index.html
# OR
python3 -m http.server 8000
```

### Option 2: Deploy to Any Static Host

Upload all files to:
- GitHub Pages
- Netlify Drop
- Vercel
- Cloudflare Pages
- Any web hosting

---

## 📸 Screenshots

### Coin Flip - 3D Realistic Coin
![Coin Flip](screenshots/coin.gif)
*Metallic 3D coin with customizable text on both sides*

### Dice Roller - Real 3D Cube
![Dice Roll](screenshots/dice.gif)
*3D cube with all 6 faces and tumbling animation*

### Spinning Wheel - Physics-Based
![Wheel Spin](screenshots/wheel.gif)
*Colorful gradient slices with realistic deceleration*

### Slot Machine - Vegas Style
![Slot Machine](screenshots/slot.gif)
*3 spinning reels with staggered stops and winning highlights*

### Random Picker - Animated Pills
![Random Picker](screenshots/random.gif)
*Gradient pills with shake and reveal animations*

---

## 🎯 How to Use

### 1. Choose a Method

Pick from Wheel, Dice, Coin, Slot, or Random Picker on the home screen.

### 2. Add Your Options

- **Wheel/Slot/Random**: Enter items (one per line)
- **Coin**: Customize both side labels
- **Dice**: Choose preset (d6, d20) or custom range

### 3. Configure Settings

- **No Repeat**: Remove selected items after each run
- **Pick Count**: Select multiple winners (Random Picker)

### 4. Hit RUN!

Watch the stunning animation and celebrate your result! 🎉

### 5. Share or Run Again

- **Share**: Get a shareable URL with your exact setup
- **Again**: Re-run with same options
- **Edit**: Modify and try again

---

## 🏗️ Architecture

### Tech Stack

- **HTML5 + CSS3 + Vanilla JavaScript** (ES6 Modules)
- **No dependencies** - Everything built from scratch
- **No build step** - Direct browser execution
- **Canvas API** - For wheel rendering
- **CSS 3D Transforms** - For realistic animations
- **Web Animations API** - For smooth transitions
- **localStorage** - For persistence

### File Structure

```
dicedr/
├── index.html              # Single-page entry
├── js/
│   ├── app.js             # Main orchestrator
│   ├── router.js          # Hash-based routing
│   ├── store.js           # State persistence
│   ├── i18n.js            # Translations
│   ├── constants.js       # Configuration
│   ├── effects/
│   │   └── confetti.js    # Celebration effects
│   ├── methods/
│   │   ├── coin-enhanced.js
│   │   ├── dice-enhanced.js
│   │   ├── wheel-super-enhanced.js
│   │   ├── slot-enhanced.js
│   │   └── random-enhanced.js
│   ├── ui/
│   │   ├── home.js
│   │   ├── methodView.js
│   │   └── resultModal.js
│   └── core/
│       ├── DOMBuilder.js
│       ├── MethodRegistry.js
│       └── StateManager.js
├── styles/
│   ├── base.css
│   ├── theme.css
│   ├── layout.css
│   ├── components-enhanced.css
│   └── animations.css
├── i18n/
│   ├── en.json
│   └── tr.json
└── assets/
```

### Method Interface

All decision methods implement a consistent interface:

```javascript
{
  id: string,
  titleKey: string,
  subtitleKey: string,
  getDefaultState(t): { inputs, settings },
  renderVisual(container, state, t): void,
  renderInputs(container, state, t, onUpdate): void,
  renderSettings(container, state, t, onUpdate): void,
  validate(state, t): ValidationResult,
  run({ state, t, visualEl, onDone }): void
}
```

---

## 🎨 Customization

### Adding New Methods

1. Create `js/methods/yourmethod.js` implementing the interface
2. Import in `js/app.js`
3. Add translations to `i18n/en.json` and `i18n/tr.json`

Example:

```javascript
export const yourMethod = {
  id: 'yourmethod',
  titleKey: 'method.yourmethod.title',
  subtitleKey: 'method.yourmethod.subtitle',

  getDefaultState(t) {
    return { inputs: [], settings: {} };
  },

  renderVisual(container, state, t) {
    // Your stunning 3D visual here!
  },

  validate(state, t) {
    return { ok: true };
  },

  run({ state, onDone }) {
    // Your animation magic here!
    setTimeout(() => {
      onDone('Result!');
    }, 2000);
  }
};
```

### Customizing Colors

Edit `js/constants.js`:

```javascript
export const WHEEL_COLORS = [
  '#your-color1',
  '#your-color2',
  // Add more colors
];
```

### Customizing Animations

Edit `styles/animations.css` for timing and easing curves.

---

## 🛠️ Development

### Code Quality

- **SOLID Principles** - All 5 principles followed
- **Clean Code** - Descriptive names, single responsibilities
- **Modular** - Each component is independent
- **Type-Safe** - JSDoc comments throughout
- **Tested** - Unit tests for utilities and domain logic

### Performance

- **60 FPS** - Hardware accelerated animations
- **Optimized** - Debounced inputs, batched updates
- **Lazy** - Methods can be dynamically imported
- **Cached** - Translation lookups memoized

### Browser Support

- Chrome 61+ ✅
- Firefox 60+ ✅
- Safari 11+ ✅
- Edge 79+ ✅

*(Modern browsers with ES6 module support)*

---

## 📚 Documentation

- **[CLAUDE.md](CLAUDE.md)** - Project guidance for AI assistants
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture diagrams
- **[REFACTORING_GUIDE.md](REFACTORING_GUIDE.md)** - Code quality improvements
- **[DESIGN_ENHANCEMENTS.md](DESIGN_ENHANCEMENTS.md)** - Visual design system
- **[ENHANCED_VISUALS_GUIDE.md](ENHANCED_VISUALS_GUIDE.md)** - Animation guide

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Contribution Guidelines

- Follow existing code style
- Add JSDoc comments
- Include unit tests for utilities
- Update documentation
- Test in multiple browsers

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Inspired by decision-making tools and party games
- Built with love for visual design and smooth animations
- No external libraries used - pure vanilla JavaScript magic! ✨

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/dicedr/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/dicedr/discussions)

---

## 🎯 Roadmap

### Planned Features

- [ ] PWA support (offline usage)
- [ ] Team Splitter method
- [ ] Task Assigner method
- [ ] Bracket Tournament method
- [ ] Sound effects (toggleable)
- [ ] Custom themes
- [ ] Animation intensity settings
- [ ] Export results as image

---

## 🌟 Star History

If you find this project useful, please consider giving it a ⭐!

---

**Made with ❤️ and lots of animations**

*Decide in one tap. Make choosing fun.* 🎮✨
