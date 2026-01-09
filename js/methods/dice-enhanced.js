/**
 * ENHANCED DICE - 3D Realistic Dice with All Faces
 * Gerçekçi 3D zar tüm yüzleriyle
 */
import { clamp, randInt } from '../utils.js';

const PRESETS = {
  d6: { min: 1, max: 6 },
  d20: { min: 1, max: 20 },
};

// Dice pip positions for each face (1-6)
const PIP_POSITIONS = {
  1: [[1, 1]], // center
  2: [[0, 0], [2, 2]], // diagonal
  3: [[0, 0], [1, 1], [2, 2]], // diagonal + center
  4: [[0, 0], [0, 2], [2, 0], [2, 2]], // corners
  5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]], // corners + center
  6: [[0, 0], [0, 1], [0, 2], [2, 0], [2, 1], [2, 2]], // two columns
};

function createDiceFace(value) {
  const face = document.createElement('div');
  face.className = 'dice-face-3d';
  face.style.cssText = `
    position: absolute;
    width: 100px;
    height: 100px;
    background: linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%);
    border: 2px solid rgba(0,0,0,0.1);
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(3, 1fr);
    padding: 10px;
    gap: 5px;
    box-shadow:
      inset 3px 3px 8px rgba(255,255,255,0.8),
      inset -3px -3px 8px rgba(0,0,0,0.1);
  `;

  // Add pips
  const positions = PIP_POSITIONS[value] || [];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const cell = document.createElement('div');
      cell.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: center;
      `;

      const hasPip = positions.some(([r, c]) => r === row && c === col);
      if (hasPip) {
        const pip = document.createElement('div');
        pip.style.cssText = `
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, #2b2f44, #1a1d2e);
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        `;
        cell.appendChild(pip);
      }

      face.appendChild(cell);
    }
  }

  return face;
}

export const diceMethodEnhanced = {
  id: 'dice',
  titleKey: 'method.dice.title',
  subtitleKey: 'method.dice.subtitle',

  getDefaultState() {
    return {
      inputs: {
        preset: 'd6',
        min: 1,
        max: 6,
      },
      settings: {},
    };
  },

  renderVisual(container, state) {
    container.innerHTML = '';
    container.style.minHeight = '280px';
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';

    // 3D Dice Container
    const diceContainer = document.createElement('div');
    diceContainer.className = 'dice-3d-container';
    diceContainer.style.cssText = `
      width: 120px;
      height: 120px;
      perspective: 600px;
      position: relative;
    `;

    // Dice cube
    const dice = document.createElement('div');
    dice.className = 'dice-3d-cube';
    dice.style.cssText = `
      width: 100%;
      height: 100%;
      position: relative;
      transform-style: preserve-3d;
      transition: transform 0.1s ease;
      transform: rotateX(-20deg) rotateY(30deg);
    `;

    // Add all 6 faces
    const faces = [
      { value: 1, transform: 'rotateY(0deg) translateZ(50px)' },
      { value: 6, transform: 'rotateY(180deg) translateZ(50px)' },
      { value: 2, transform: 'rotateY(90deg) translateZ(50px)' },
      { value: 5, transform: 'rotateY(-90deg) translateZ(50px)' },
      { value: 3, transform: 'rotateX(90deg) translateZ(50px)' },
      { value: 4, transform: 'rotateX(-90deg) translateZ(50px)' },
    ];

    faces.forEach(({ value, transform }) => {
      const face = createDiceFace(value);
      face.style.transform = transform;
      dice.appendChild(face);
    });

    diceContainer.appendChild(dice);
    container.appendChild(diceContainer);

    // Add hover effect
    dice.addEventListener('mouseenter', () => {
      dice.style.transform = 'rotateX(-10deg) rotateY(40deg)';
    });
    dice.addEventListener('mouseleave', () => {
      dice.style.transform = 'rotateX(-20deg) rotateY(30deg)';
    });
  },

  renderInputs(container, state, t, onUpdate) {
    const select = document.createElement('select');
    select.innerHTML = `
      <option value="d6">d6 (1-6)</option>
      <option value="d20">d20 (1-20)</option>
      <option value="custom">${t('dice.custom')}</option>
    `;
    select.value = state.inputs.preset;

    const row = document.createElement('div');
    row.className = 'inline-field';

    const minInput = document.createElement('input');
    minInput.type = 'number';
    minInput.value = state.inputs.min;
    minInput.placeholder = t('dice.min');

    const maxInput = document.createElement('input');
    maxInput.type = 'number';
    maxInput.value = state.inputs.max;
    maxInput.placeholder = t('dice.max');

    row.appendChild(minInput);
    row.appendChild(maxInput);

    container.appendChild(select);
    container.appendChild(row);

    select.addEventListener('change', () => {
      const preset = select.value;
      const presetValues = PRESETS[preset];
      const next = presetValues
        ? { preset, min: presetValues.min, max: presetValues.max }
        : { preset, min: state.inputs.min, max: state.inputs.max };
      minInput.value = next.min;
      maxInput.value = next.max;
      onUpdate({ inputs: next });
    });

    const handleNumber = () => {
      const min = Number(minInput.value || 1);
      const max = Number(maxInput.value || min + 1);
      onUpdate({ inputs: { ...state.inputs, preset: 'custom', min, max } });
    };

    minInput.addEventListener('input', handleNumber);
    maxInput.addEventListener('input', handleNumber);
  },

  renderSettings(container) {
    container.innerHTML = '';
  },

  validate(state) {
    const min = Number(state.inputs.min);
    const max = Number(state.inputs.max);
    if (Number.isNaN(min) || Number.isNaN(max) || min >= max) {
      return { ok: false, message: '' };
    }
    return { ok: true };
  },

  run({ state, visualEl, onDone }) {
    const dice = visualEl.querySelector('.dice-3d-cube');
    if (!dice) {
      const min = clamp(Number(state.inputs.min), -999, 999);
      const max = clamp(Number(state.inputs.max), min + 1, 999);
      onDone(String(randInt(min, max)));
      return;
    }

    const min = clamp(Number(state.inputs.min), -999, 999);
    const max = clamp(Number(state.inputs.max), min + 1, 999);
    const result = randInt(min, max);

    // Random tumbling animation
    const randomX = 720 + Math.random() * 360;
    const randomY = 720 + Math.random() * 360;
    const randomZ = 360 + Math.random() * 360;

    // Calculate final rotation to show result face
    let finalX = 0, finalY = 0;

    // For d6, rotate to show the correct face
    if (state.inputs.preset === 'd6' && result >= 1 && result <= 6) {
      const rotations = {
        1: { x: 0, y: 0 },
        2: { x: 0, y: -90 },
        3: { x: -90, y: 0 },
        4: { x: 90, y: 0 },
        5: { x: 0, y: 90 },
        6: { x: 0, y: 180 },
      };
      finalX = rotations[result].x;
      finalY = rotations[result].y;
    }

    // Apply tumbling animation
    dice.style.transition = 'none';
    dice.style.transform = 'rotateX(-20deg) rotateY(30deg)';

    setTimeout(() => {
      dice.style.transition = 'transform 2s cubic-bezier(0.25, 0.1, 0.25, 1)';
      dice.style.transform = `rotateX(${randomX + finalX}deg) rotateY(${randomY + finalY}deg) rotateZ(${randomZ}deg)`;

      setTimeout(() => {
        // Bounce effect
        dice.style.transition = 'transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        dice.style.transform = `rotateX(${randomX + finalX}deg) rotateY(${randomY + finalY}deg) rotateZ(${randomZ}deg) scale(1.1)`;

        setTimeout(() => {
          dice.style.transform = `rotateX(${randomX + finalX}deg) rotateY(${randomY + finalY}deg) rotateZ(${randomZ}deg) scale(1)`;

          // Celebration
          setTimeout(() => {
            if (window.celebrate) {
              window.celebrate({
                confetti: true,
                burst: true,
                element: dice,
                intensity: 'medium'
              });
            }

            onDone(String(result));
          }, 200);
        }, 300);
      }, 2000);
    }, 50);
  },
};
