/**
 * ENHANCED RANDOM PICKER - Animated Pills Selection
 * Animasyonlu pill seçimi
 */
import { clamp, pickN } from '../utils.js';

const PILL_COLORS = [
  ['#667eea', '#764ba2'], // Purple gradient
  ['#f093fb', '#f5576c'], // Pink gradient
  ['#4facfe', '#00f2fe'], // Blue gradient
  ['#43e97b', '#38f9d7'], // Green gradient
  ['#fa709a', '#fee140'], // Orange gradient
  ['#30cfd0', '#330867'], // Teal gradient
  ['#a8edea', '#fed6e3'], // Pastel gradient
  ['#ff9a9e', '#fecfef'], // Rose gradient
];

function createPillsDisplay(items) {
  const container = document.createElement('div');
  container.className = 'pills-display-enhanced';
  container.style.cssText = `
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    justify-content: center;
    align-items: center;
    padding: 20px;
    min-height: 200px;
  `;

  items.forEach((item, index) => {
    const pill = document.createElement('div');
    pill.className = 'pill-enhanced';
    pill.dataset.index = index;

    const [color1, color2] = PILL_COLORS[index % PILL_COLORS.length];

    pill.style.cssText = `
      background: linear-gradient(135deg, ${color1} 0%, ${color2} 100%);
      color: #fff;
      padding: 12px 20px;
      border-radius: 999px;
      font-size: 14px;
      font-weight: 700;
      text-shadow: 0 2px 4px rgba(0,0,0,0.2);
      box-shadow:
        0 4px 12px rgba(0,0,0,0.2),
        inset 0 1px 2px rgba(255,255,255,0.3);
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      opacity: 0;
      transform: scale(0.8) translateY(20px);
      animation: pillFadeIn 0.4s ease forwards;
      animation-delay: ${index * 0.05}s;
      position: relative;
      overflow: hidden;
    `;

    pill.textContent = item;

    // Hover effect
    pill.addEventListener('mouseenter', () => {
      pill.style.transform = 'scale(1.05) translateY(-4px)';
      pill.style.boxShadow = `
        0 8px 20px rgba(0,0,0,0.3),
        inset 0 1px 2px rgba(255,255,255,0.4),
        0 0 20px ${color1}40
      `;
    });

    pill.addEventListener('mouseleave', () => {
      pill.style.transform = 'scale(1) translateY(0)';
      pill.style.boxShadow = `
        0 4px 12px rgba(0,0,0,0.2),
        inset 0 1px 2px rgba(255,255,255,0.3)
      `;
    });

    container.appendChild(pill);
  });

  return container;
}

// Add keyframe animation
if (!document.getElementById('pill-animations')) {
  const style = document.createElement('style');
  style.id = 'pill-animations';
  style.textContent = `
    @keyframes pillFadeIn {
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }

    @keyframes pillPulse {
      0%, 100% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.15);
      }
    }

    @keyframes pillShake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-5px); }
      75% { transform: translateX(5px); }
    }

    @keyframes pillWinner {
      0%, 100% {
        transform: scale(1);
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      }
      50% {
        transform: scale(1.2);
        box-shadow: 0 8px 30px rgba(255,215,0,0.6);
      }
    }
  `;
  document.head.appendChild(style);
}

export const randomMethodEnhanced = {
  id: 'random',
  titleKey: 'method.random.title',
  subtitleKey: 'method.random.subtitle',

  getDefaultState() {
    return {
      inputs: ['🎮 Gaming', '📚 Reading', '🎬 Movies', '🎵 Music', '🏃 Sports', '🍕 Food'],
      settings: { count: 1, noRepeat: false },
    };
  },

  renderVisual(container, state) {
    container.innerHTML = '';
    container.style.minHeight = '280px';
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';

    const items = state.inputs.length >= 2 ? state.inputs : ['?', '?'];
    const display = createPillsDisplay(items);
    container.appendChild(display);
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

  renderSettings(container, state, t, onUpdate) {
    const row = document.createElement('div');
    row.style.cssText = 'display: flex; gap: 16px; flex-wrap: wrap; align-items: center;';

    // Pick count input
    const countLabel = document.createElement('label');
    countLabel.style.cssText = 'display: flex; align-items: center; gap: 8px; font-size: 14px;';
    countLabel.innerHTML = `
      <span>${t('picker.count')}:</span>
      <input type="number" min="1" max="10" value="${state.settings.count}"
        style="width: 60px; padding: 6px; border-radius: 8px; border: 2px solid rgba(106,109,255,0.2);">
    `;

    const countInput = countLabel.querySelector('input');
    countInput.addEventListener('input', () => {
      const count = clamp(Number(countInput.value || 1), 1, 10);
      onUpdate({ settings: { ...state.settings, count } });
    });

    // No repeat toggle
    const toggle = document.createElement('label');
    toggle.className = 'toggle';
    toggle.style.cssText = 'display: flex; align-items: center; gap: 10px; cursor: pointer;';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = state.settings.noRepeat;
    checkbox.style.cssText = 'width: 18px; height: 18px; cursor: pointer;';

    const span = document.createElement('span');
    span.textContent = t('settings.noRepeat');
    span.style.fontSize = '14px';

    toggle.appendChild(checkbox);
    toggle.appendChild(span);

    checkbox.addEventListener('change', () => {
      onUpdate({ settings: { ...state.settings, noRepeat: checkbox.checked } });
    });

    row.appendChild(countLabel);
    row.appendChild(toggle);
    container.appendChild(row);
  },

  validate(state, t) {
    if (!state.inputs || state.inputs.length < 2) {
      return { ok: false, message: t('inputs.empty') };
    }
    return { ok: true };
  },

  run({ state, visualEl, onDone }) {
    const pills = visualEl.querySelectorAll('.pill-enhanced');
    if (pills.length === 0) {
      onDone('?');
      return;
    }

    const count = clamp(state.settings.count || 1, 1, state.inputs.length);
    const picks = pickN(state.inputs, count, state.settings.noRepeat);

    // Animate all pills shaking
    pills.forEach(pill => {
      pill.style.animation = 'pillShake 0.5s ease infinite';
    });

    // After 1 second, start revealing winners
    setTimeout(() => {
      pills.forEach(pill => {
        pill.style.animation = '';
        pill.style.opacity = '0.3';
        pill.style.transform = 'scale(0.9)';
      });

      // Reveal winners one by one
      picks.forEach((pick, pickIndex) => {
        setTimeout(() => {
          const index = state.inputs.indexOf(pick);
          const winnerPill = Array.from(pills).find(p => p.dataset.index == index);

          if (winnerPill) {
            winnerPill.style.opacity = '1';
            winnerPill.style.animation = 'pillWinner 0.6s ease infinite';
            winnerPill.style.transform = 'scale(1)';

            // Particle burst
            if (window.explodeAt) {
              const rect = winnerPill.getBoundingClientRect();
              window.explodeAt(
                rect.left + rect.width / 2,
                rect.top + rect.height / 2,
                { count: 15 }
              );
            }
          }

          // If last pick, finish
          if (pickIndex === picks.length - 1) {
            setTimeout(() => {
              if (window.celebrate) {
                window.celebrate({
                  confetti: true,
                  burst: false,
                  intensity: 'medium'
                });
              }

              onDone(picks.join(', '));
            }, 400);
          }
        }, pickIndex * 400);
      });
    }, 1200);
  },
};
