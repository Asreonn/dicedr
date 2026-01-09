/**
 * ENHANCED SLOT MACHINE - Real Spinning Reels
 * Gerçekten dönen slot makinesi makaraları
 */
import { shuffle } from '../utils.js';

function createReel(items, reelIndex) {
  const reel = document.createElement('div');
  reel.className = 'slot-reel-enhanced';
  reel.style.cssText = `
    position: relative;
    width: 100%;
    height: 180px;
    background: linear-gradient(180deg, #2a2d3a 0%, #1f2129 100%);
    border-radius: 12px;
    overflow: hidden;
    box-shadow:
      inset 0 4px 8px rgba(0,0,0,0.6),
      inset 0 -2px 4px rgba(255,255,255,0.05),
      0 4px 12px rgba(0,0,0,0.3);
    border: 2px solid rgba(255,255,255,0.1);
  `;

  // Window mask (3 visible items)
  const window = document.createElement('div');
  window.className = 'slot-window';
  window.style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: calc(100% - 16px);
    height: 60px;
    background: rgba(255,255,255,0.05);
    border: 2px solid rgba(255,215,0,0.4);
    border-radius: 8px;
    box-shadow:
      0 0 20px rgba(255,215,0,0.3),
      inset 0 0 10px rgba(255,215,0,0.1);
    pointer-events: none;
    z-index: 10;
  `;

  // Gradient overlays for depth
  const topGradient = document.createElement('div');
  topGradient.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 60px;
    background: linear-gradient(180deg, rgba(42,45,58,0.95) 0%, transparent 100%);
    pointer-events: none;
    z-index: 5;
  `;

  const bottomGradient = document.createElement('div');
  bottomGradient.style.cssText = `
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60px;
    background: linear-gradient(0deg, rgba(42,45,58,0.95) 0%, transparent 100%);
    pointer-events: none;
    z-index: 5;
  `;

  // Spinning strip
  const strip = document.createElement('div');
  strip.className = 'slot-strip';
  strip.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 8px;
  `;

  // Create items (repeat for seamless loop)
  const repeatedItems = [...items, ...items, ...items];
  repeatedItems.forEach((item, idx) => {
    const itemEl = document.createElement('div');
    itemEl.className = 'slot-item-enhanced';
    itemEl.style.cssText = `
      min-height: 52px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, rgba(106,109,255,0.15), rgba(152,241,223,0.1));
      border-radius: 8px;
      border: 1px solid rgba(106,109,255,0.3);
      font-size: 14px;
      font-weight: 700;
      color: #fff;
      text-shadow: 0 2px 4px rgba(0,0,0,0.5);
      box-shadow:
        0 2px 8px rgba(106,109,255,0.2),
        inset 0 1px 2px rgba(255,255,255,0.1);
      padding: 8px 12px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    `;
    itemEl.textContent = item;
    strip.appendChild(itemEl);
  });

  reel.appendChild(strip);
  reel.appendChild(window);
  reel.appendChild(topGradient);
  reel.appendChild(bottomGradient);

  return reel;
}

export const slotMethodEnhanced = {
  id: 'slot',
  titleKey: 'method.slot.title',
  subtitleKey: 'method.slot.subtitle',

  getDefaultState() {
    return {
      inputs: ['🍒', '🍋', '🍊', '🍇', '⭐', '💎'],
      settings: {},
    };
  },

  renderVisual(container, state) {
    container.innerHTML = '';
    container.style.minHeight = '280px';
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';
    container.style.padding = '20px 0';

    // Slot machine container
    const slotMachine = document.createElement('div');
    slotMachine.className = 'slot-machine-enhanced';
    slotMachine.style.cssText = `
      width: 100%;
      max-width: 400px;
      background: linear-gradient(135deg, #3a3d4a 0%, #2a2d3a 100%);
      border-radius: 20px;
      padding: 20px 16px;
      box-shadow:
        0 10px 40px rgba(0,0,0,0.5),
        inset 0 1px 0 rgba(255,255,255,0.1);
      border: 3px solid rgba(255,215,0,0.3);
    `;

    // Reels container
    const reelsContainer = document.createElement('div');
    reelsContainer.className = 'slot-reels-enhanced';
    reelsContainer.style.cssText = `
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    `;

    // Create 3 reels
    const items = state.inputs.length >= 2 ? state.inputs : ['?', '?', '?'];
    for (let i = 0; i < 3; i++) {
      const shuffled = shuffle(items);
      const reel = createReel(shuffled, i);
      reelsContainer.appendChild(reel);
    }

    slotMachine.appendChild(reelsContainer);
    container.appendChild(slotMachine);
  },

  renderInputs(container, state, t, onUpdate) {
    const editor = document.createElement('div');
    editor.innerHTML = `
      <textarea
        placeholder="${t('inputs.placeholder')}"
        style="width: 100%; min-height: 160px; resize: vertical; background: var(--surface);
        border: 2px solid rgba(106,109,255,0.2); border-radius: 14px; padding: 14px;
        font-family: inherit; font-size: 14px;"
      >${state.inputs.join('\n')}</textarea>
    `;

    const textarea = editor.querySelector('textarea');
    textarea.addEventListener('input', () => {
      const items = textarea.value
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean);
      onUpdate({ inputs: items });
    });

    container.appendChild(editor);
  },

  renderSettings(container) {
    container.innerHTML = '';
  },

  validate(state, t) {
    if (!state.inputs || state.inputs.length < 2) {
      return { ok: false, message: t('inputs.empty') };
    }
    return { ok: true };
  },

  run({ state, visualEl, onDone }) {
    const strips = visualEl.querySelectorAll('.slot-strip');
    if (strips.length !== 3) {
      onDone('???');
      return;
    }

    const results = [];
    const items = state.inputs;

    strips.forEach((strip, reelIndex) => {
      // Pick random winner
      const winner = items[Math.floor(Math.random() * items.length)];
      results.push(winner);

      // Calculate spin distance
      const itemHeight = 56; // height + gap
      const totalItems = strip.children.length;
      const winnerIndex = Array.from(strip.children).findIndex(
        el => el.textContent === winner
      );

      // Spin multiple times + land on winner (center position)
      const spins = 3 + reelIndex; // Each reel spins different amount
      const centerOffset = 64; // Offset to center the winning item
      const finalPosition = -(winnerIndex * itemHeight + spins * totalItems * itemHeight - centerOffset);

      // Reset position
      strip.style.transition = 'none';
      strip.style.transform = 'translateY(0)';

      // Start spinning after delay
      setTimeout(() => {
        const duration = 2000 + (reelIndex * 300); // Stagger stop times
        strip.style.transition = `transform ${duration}ms cubic-bezier(0.25, 0.1, 0.25, 1)`;
        strip.style.transform = `translateY(${finalPosition}px)`;

        // When last reel stops
        if (reelIndex === 2) {
          setTimeout(() => {
            // Highlight winners
            strips.forEach((s, idx) => {
              const centerItem = s.children[Math.floor(s.children.length / 2)];
              if (centerItem) {
                centerItem.style.background = 'linear-gradient(135deg, rgba(255,215,0,0.4), rgba(255,165,0,0.3))';
                centerItem.style.borderColor = 'rgba(255,215,0,0.8)';
                centerItem.style.transform = 'scale(1.05)';
                centerItem.style.boxShadow = '0 0 20px rgba(255,215,0,0.6)';
              }
            });

            // Celebration
            setTimeout(() => {
              if (window.celebrate) {
                window.celebrate({
                  confetti: true,
                  burst: true,
                  element: visualEl,
                  intensity: 'high'
                });
              }

              onDone(results.join(' | '));
            }, 300);
          }, duration);
        }
      }, 100);
    });
  },
};
