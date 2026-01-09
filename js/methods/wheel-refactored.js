/**
 * Wheel Method - Refactored with SOLID principles
 * Demonstrates clean architecture with separated concerns
 */
import { DOMBuilder } from '../core/DOMBuilder.js';
import { ValidationResult } from '../domain/ValidationResult.js';
import { INPUT_LIMITS, WHEEL_CONSTANTS, EASING } from '../constants.js';
import { createListEditor } from '../ui/listEditor.js';

/**
 * Wheel visual renderer - Single Responsibility
 */
class WheelRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }

  /**
   * Draw the wheel with colored slices
   * @param {Array<string>} items - Items to display
   */
  draw(items) {
    const { SIZE, COLORS } = WHEEL_CONSTANTS;
    const radius = SIZE / 2;
    const center = { x: radius, y: radius };
    const sliceAngle = (Math.PI * 2) / items.length;

    this.ctx.clearRect(0, 0, SIZE, SIZE);

    let angle = -Math.PI / 2;

    items.forEach((item, index) => {
      this._drawSlice(center, radius, angle, sliceAngle, COLORS[index % COLORS.length]);
      this._drawLabel(center, radius, angle, sliceAngle, item);
      angle += sliceAngle;
    });
  }

  /**
   * Draw a single wheel slice
   * @private
   */
  _drawSlice(center, radius, startAngle, sliceAngle, color) {
    this.ctx.beginPath();
    this.ctx.moveTo(center.x, center.y);
    this.ctx.fillStyle = color;
    this.ctx.arc(center.x, center.y, radius - 8, startAngle, startAngle + sliceAngle);
    this.ctx.closePath();
    this.ctx.fill();
  }

  /**
   * Draw text label on slice
   * @private
   */
  _drawLabel(center, radius, startAngle, sliceAngle, text) {
    this.ctx.save();
    this.ctx.translate(center.x, center.y);
    this.ctx.rotate(startAngle + sliceAngle / 2);
    this.ctx.textAlign = 'right';
    this.ctx.fillStyle = '#08110f';
    this.ctx.font = 'bold 12px system-ui';
    this.ctx.fillText(text.slice(0, 12), radius - 18, 4);
    this.ctx.restore();
  }
}

/**
 * Wheel animation controller - Single Responsibility
 */
class WheelAnimator {
  /**
   * Spin the wheel and select a winner
   * @param {HTMLElement} wheelElement - Rotating element
   * @param {Array<string>} items - Items on the wheel
   * @param {Function} onComplete - Callback with (winner, index)
   */
  spin(wheelElement, items, onComplete) {
    const { MIN_SPINS, MAX_SPINS } = WHEEL_CONSTANTS;
    const sliceAngle = (Math.PI * 2) / items.length;
    const winnerIndex = Math.floor(Math.random() * items.length);
    const targetAngle = sliceAngle * winnerIndex + sliceAngle / 2;

    const spins = MIN_SPINS + Math.random() * (MAX_SPINS - MIN_SPINS);
    const currentRotation = Number(wheelElement.dataset.rotation || 0);
    const finalRotation = currentRotation + spins * Math.PI * 2 + (Math.PI * 2 - targetAngle);

    wheelElement.dataset.rotation = finalRotation;

    const animation = wheelElement.animate(
      [
        { transform: `rotate(${currentRotation}rad)` },
        { transform: `rotate(${finalRotation}rad)` },
      ],
      {
        duration: WHEEL_CONSTANTS.ANIMATION_DURATION_MS || 2200,
        easing: EASING.SMOOTH_STOP,
        fill: 'forwards',
      }
    );

    animation.onfinish = () => {
      onComplete(items[winnerIndex], winnerIndex);
    };
  }
}

/**
 * Wheel state validator - Single Responsibility
 */
class WheelValidator {
  /**
   * Validate wheel state
   * @param {Object} state - Method state
   * @param {Function} t - Translation function
   * @returns {ValidationResult}
   */
  validate(state, t) {
    if (!state.inputs || !Array.isArray(state.inputs)) {
      return ValidationResult.failure(t('inputs.empty'));
    }

    if (state.inputs.length < INPUT_LIMITS.MIN_ITEMS) {
      return ValidationResult.failure(t('inputs.empty'));
    }

    if (state.inputs.length > INPUT_LIMITS.MAX_ITEMS) {
      return ValidationResult.failure(`Maximum ${INPUT_LIMITS.MAX_ITEMS} items allowed`);
    }

    return ValidationResult.success();
  }
}

/**
 * Main wheel method implementation
 * Orchestrates rendering, validation, and execution
 */
export const wheelMethodRefactored = {
  id: 'wheel',
  titleKey: 'method.wheel.title',
  subtitleKey: 'method.wheel.subtitle',

  /**
   * Get default state for wheel method
   * @returns {Object} Default state
   */
  getDefaultState() {
    return {
      inputs: ['Pizza', 'Sushi', 'Burgers', 'Salad'],
      settings: { noRepeat: false },
    };
  },

  /**
   * Render the wheel visual
   * @param {HTMLElement} container - Visual container
   * @param {Object} state - Current state
   */
  renderVisual(container, state) {
    const wrapper = DOMBuilder.create('div', { className: 'wheel-rotator' });
    const canvas = DOMBuilder.create('canvas', {
      className: 'wheel-canvas',
      width: WHEEL_CONSTANTS.SIZE,
      height: WHEEL_CONSTANTS.SIZE,
    });

    const pointer = DOMBuilder.create(
      'div',
      {
        style: {
          position: 'absolute',
          top: '8px',
          left: '50%',
          transform: 'translateX(-50%)',
          color: '#f6f7fb',
          fontSize: '16px',
        },
      },
      ['▲']
    );

    wrapper.appendChild(canvas);
    DOMBuilder.replaceContent(container, [pointer, wrapper]);

    const renderer = new WheelRenderer(canvas);
    const items = state.inputs.length ? state.inputs : ['-'];
    renderer.draw(items);
  },

  /**
   * Render input controls
   * @param {HTMLElement} container - Input container
   * @param {Object} state - Current state
   * @param {Function} t - Translation function
   * @param {Function} onUpdate - Update callback
   */
  renderInputs(container, state, t, onUpdate) {
    createListEditor({
      container,
      value: state.inputs,
      t,
      onChange: (items) => onUpdate({ inputs: items }),
    });
  },

  /**
   * Render settings controls
   * @param {HTMLElement} container - Settings container
   * @param {Object} state - Current state
   * @param {Function} t - Translation function
   * @param {Function} onUpdate - Update callback
   */
  renderSettings(container, state, t, onUpdate) {
    const checkbox = DOMBuilder.input('checkbox', {
      checked: state.settings.noRepeat,
      onChange: (e) => {
        onUpdate({
          settings: { ...state.settings, noRepeat: e.target.checked },
        });
      },
    });

    const label = DOMBuilder.create(
      'label',
      { className: 'toggle' },
      [checkbox, DOMBuilder.create('span', {}, [t('settings.noRepeat')])]
    );

    DOMBuilder.replaceContent(container, [label]);
  },

  /**
   * Validate method state
   * @param {Object} state - Current state
   * @param {Function} t - Translation function
   * @returns {ValidationResult}
   */
  validate(state, t) {
    const validator = new WheelValidator();
    return validator.validate(state, t);
  },

  /**
   * Execute the wheel spin
   * @param {Object} params - Execution parameters
   * @param {Object} params.state - Current state
   * @param {HTMLElement} params.visualEl - Visual element
   * @param {Function} params.onDone - Completion callback
   */
  run({ state, visualEl, onDone }) {
    const animator = new WheelAnimator();
    const items = state.inputs;

    animator.spin(visualEl.querySelector('.wheel-rotator'), items, (value, index) => {
      let nextState = state;

      if (state.settings.noRepeat) {
        const remaining = items.filter((_, idx) => idx !== index);
        nextState = { ...state, inputs: remaining };
      }

      onDone(value, nextState);
    });
  },
};
