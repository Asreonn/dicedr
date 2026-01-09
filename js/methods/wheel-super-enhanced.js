/**
 * SUPER ENHANCED WHEEL - Realistic Spinning Wheel with Physics
 * Gerçekçi fiziksel dönen çark
 */
import { shuffle } from '../utils.js';

const WHEEL_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788'
];

function createWheel(items) {
  const container = document.createElement('div');
  container.style.cssText = `
    width: 300px;
    height: 300px;
    position: relative;
    margin: 0 auto;
  `;

  // Canvas for wheel
  const canvas = document.createElement('canvas');
  canvas.width = 300;
  canvas.height = 300;
  canvas.className = 'wheel-canvas-enhanced';
  canvas.style.cssText = `
    width: 100%;
    height: 100%;
    border-radius: 50%;
    box-shadow:
      0 0 0 8px rgba(106,109,255,0.2),
      0 0 0 16px rgba(106,109,255,0.1),
      0 10px 40px rgba(0,0,0,0.3);
    filter: drop-shadow(0 5px 20px rgba(106,109,255,0.4));
  `;

  // Draw wheel
  const ctx = canvas.getContext('2d');
  const centerX = 150;
  const centerY = 150;
  const radius = 140;
  const sliceAngle = (Math.PI * 2) / items.length;

  items.forEach((item, index) => {
    const startAngle = index * sliceAngle - Math.PI / 2;
    const endAngle = startAngle + sliceAngle;

    // Slice
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.closePath();

    // Gradient fill
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    const color = WHEEL_COLORS[index % WHEEL_COLORS.length];
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, adjustBrightness(color, -20));
    ctx.fillStyle = gradient;
    ctx.fill();

    // Border
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Text
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(startAngle + sliceAngle / 2);
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px system-ui';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 4;
    ctx.fillText(item.slice(0, 15), radius - 20, 0);
    ctx.restore();
  });

  // Center circle
  const centerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 30);
  centerGradient.addColorStop(0, '#ffffff');
  centerGradient.addColorStop(1, '#e0e0e0');
  ctx.fillStyle = centerGradient;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 30, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ccc';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Pointer (fixed at top)
  const pointer = document.createElement('div');
  pointer.style.cssText = `
    position: absolute;
    top: -5px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 15px solid transparent;
    border-right: 15px solid transparent;
    border-top: 30px solid #FF6B6B;
    filter: drop-shadow(0 3px 6px rgba(0,0,0,0.4));
    z-index: 10;
  `;

  container.appendChild(canvas);
  container.appendChild(pointer);

  return container;
}

function adjustBrightness(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + percent));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + percent));
  const b = Math.max(0, Math.min(255, (num & 0x0000FF) + percent));
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
}

export const wheelMethodSuperEnhanced = {
  id: 'wheel',
  titleKey: 'method.wheel.title',
  subtitleKey: 'method.wheel.subtitle',

  getDefaultState() {
    return {
      inputs: ['Pizza', 'Sushi', 'Burgers', 'Salad', 'Pasta', 'Tacos'],
      settings: { noRepeat: false },
    };
  },

  renderVisual(container, state) {
    container.innerHTML = '';
    container.style.minHeight = '350px';
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';
    container.style.padding = '20px 0';

    const items = state.inputs.length >= 2 ? state.inputs : ['?', '?'];
    const wheel = createWheel(items);
    container.appendChild(wheel);
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
    const toggle = document.createElement('label');
    toggle.className = 'toggle';
    toggle.style.cssText = 'display: flex; align-items: center; gap: 10px; cursor: pointer;';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = state.settings.noRepeat;
    checkbox.style.cssText = 'width: 18px; height: 18px; cursor: pointer;';

    const span = document.createElement('span');
    span.textContent = t('settings.noRepeat');

    toggle.appendChild(checkbox);
    toggle.appendChild(span);
    container.appendChild(toggle);

    checkbox.addEventListener('change', () => {
      onUpdate({ settings: { ...state.settings, noRepeat: checkbox.checked } });
    });
  },

  validate(state, t) {
    if (!state.inputs || state.inputs.length < 2) {
      return { ok: false, message: t('inputs.empty') };
    }
    return { ok: true };
  },

  run({ state, visualEl, onDone }) {
    const canvas = visualEl.querySelector('.wheel-canvas-enhanced');
    if (!canvas) {
      onDone(state.inputs[0]);
      return;
    }

    const items = state.inputs;
    const sliceAngle = (Math.PI * 2) / items.length;

    // Pick random winner
    const winnerIndex = Math.floor(Math.random() * items.length);
    const winner = items[winnerIndex];

    // Calculate rotation
    const targetAngle = -(winnerIndex * sliceAngle + sliceAngle / 2);
    const spins = 5 + Math.random() * 3; // 5-8 spins
    const totalRotation = (spins * Math.PI * 2 + targetAngle) * (180 / Math.PI); // Convert to degrees

    // Physics-based easing
    canvas.style.transition = 'none';
    canvas.style.transform = 'rotate(0deg)';

    setTimeout(() => {
      canvas.style.transition = 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)';
      canvas.style.transform = `rotate(${totalRotation}deg)`;

      // Add wobble effect near end
      setTimeout(() => {
        canvas.style.transition = 'transform 0.3s ease-out';
        canvas.style.transform = `rotate(${totalRotation + 5}deg)`;

        setTimeout(() => {
          canvas.style.transform = `rotate(${totalRotation}deg)`;

          // Celebration
          setTimeout(() => {
            // Highlight winner slice
            const ctx = canvas.getContext('2d');
            const centerX = 150;
            const centerY = 150;
            const radius = 140;
            const startAngle = winnerIndex * sliceAngle - Math.PI / 2;
            const endAngle = startAngle + sliceAngle;

            // Draw glow on winner
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.closePath();
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.fill();
            ctx.restore();

            if (window.celebrate) {
              window.celebrate({
                confetti: true,
                burst: true,
                element: canvas,
                intensity: 'high'
              });
            }

            // Update state if no-repeat is enabled
            let nextState = state;
            if (state.settings.noRepeat) {
              const remaining = items.filter((_, idx) => idx !== winnerIndex);
              nextState = { ...state, inputs: remaining };
            }

            onDone(winner, nextState);
          }, 400);
        }, 300);
      }, 4000);
    }, 50);
  },
};
