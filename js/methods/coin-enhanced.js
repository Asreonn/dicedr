/**
 * ENHANCED COIN FLIP - 3D Realistic Coin Animation
 * Gerçekçi 3D yazı tura animasyonu
 */

export const coinMethodEnhanced = {
  id: 'coin',
  titleKey: 'method.coin.title',
  subtitleKey: 'method.coin.subtitle',

  getDefaultState(t) {
    return {
      inputs: {
        a: t('coin.labelA'),
        b: t('coin.labelB'),
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

    // 3D Coin Container
    const coinContainer = document.createElement('div');
    coinContainer.className = 'coin-3d-container';
    coinContainer.style.cssText = `
      width: 180px;
      height: 180px;
      perspective: 1000px;
      position: relative;
    `;

    // Coin wrapper
    const coin = document.createElement('div');
    coin.className = 'coin-3d';
    coin.style.cssText = `
      width: 100%;
      height: 100%;
      position: relative;
      transform-style: preserve-3d;
      transition: transform 0.1s ease;
    `;

    // Heads side
    const heads = document.createElement('div');
    heads.className = 'coin-side coin-heads';
    heads.style.cssText = `
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: linear-gradient(135deg, #ffd700 0%, #ffed4e 50%, #ffa500 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      font-weight: 900;
      color: #8B4513;
      text-shadow: 0 2px 4px rgba(0,0,0,0.3);
      backface-visibility: hidden;
      box-shadow:
        inset 0 0 30px rgba(255,255,255,0.5),
        inset 10px 10px 20px rgba(255,237,78,0.8),
        inset -10px -10px 20px rgba(255,167,0,0.6),
        0 10px 30px rgba(255,215,0,0.5);
      border: 4px solid #DAA520;
    `;
    heads.textContent = state.inputs.a || 'HEADS';

    // Tails side
    const tails = document.createElement('div');
    tails.className = 'coin-side coin-tails';
    tails.style.cssText = `
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: linear-gradient(135deg, #C0C0C0 0%, #E8E8E8 50%, #A8A8A8 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      font-weight: 900;
      color: #4A4A4A;
      text-shadow: 0 2px 4px rgba(0,0,0,0.2);
      backface-visibility: hidden;
      transform: rotateY(180deg);
      box-shadow:
        inset 0 0 30px rgba(255,255,255,0.4),
        inset 10px 10px 20px rgba(232,232,232,0.7),
        inset -10px -10px 20px rgba(168,168,168,0.5),
        0 10px 30px rgba(192,192,192,0.4);
      border: 4px solid #999999;
    `;
    tails.textContent = state.inputs.b || 'TAILS';

    // Edge ring (3D depth effect)
    const edge = document.createElement('div');
    edge.style.cssText = `
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: linear-gradient(90deg,
        #DAA520 0%,
        #FFD700 25%,
        #FFA500 50%,
        #FFD700 75%,
        #DAA520 100%
      );
      transform: translateZ(-8px);
      box-shadow: 0 0 10px rgba(255,215,0,0.6);
    `;

    coin.appendChild(heads);
    coin.appendChild(tails);
    coin.appendChild(edge);
    coinContainer.appendChild(coin);
    container.appendChild(coinContainer);

    // Add subtle hover effect
    coin.addEventListener('mouseenter', () => {
      coin.style.transform = 'rotateY(20deg) rotateX(10deg)';
    });
    coin.addEventListener('mouseleave', () => {
      coin.style.transform = 'rotateY(0deg) rotateX(0deg)';
    });
  },

  renderInputs(container, state, t, onUpdate) {
    const row = document.createElement('div');
    row.className = 'inline-field';

    const inputA = document.createElement('input');
    inputA.value = state.inputs.a;
    inputA.placeholder = t('coin.labelA');
    const inputB = document.createElement('input');
    inputB.value = state.inputs.b;
    inputB.placeholder = t('coin.labelB');

    row.appendChild(inputA);
    row.appendChild(inputB);
    container.appendChild(row);

    inputA.addEventListener('input', () => {
      onUpdate({ inputs: { ...state.inputs, a: inputA.value } });
    });
    inputB.addEventListener('input', () => {
      onUpdate({ inputs: { ...state.inputs, b: inputB.value } });
    });
  },

  renderSettings(container) {
    container.innerHTML = '';
  },

  validate(state) {
    if (!state.inputs.a || !state.inputs.b) {
      return { ok: false, message: '' };
    }
    return { ok: true };
  },

  run({ state, visualEl, onDone }) {
    const coin = visualEl.querySelector('.coin-3d');
    if (!coin) return;

    // Random result
    const isHeads = Math.random() < 0.5;
    const result = isHeads ? state.inputs.a : state.inputs.b;

    // Calculate final rotation (multiple spins + final side)
    const spins = 5 + Math.floor(Math.random() * 3); // 5-7 spins
    const finalRotation = spins * 360 + (isHeads ? 0 : 180);

    // Apply animation
    coin.style.transition = 'none';
    coin.style.transform = 'rotateY(0deg)';

    setTimeout(() => {
      coin.style.transition = 'transform 2s cubic-bezier(0.25, 0.1, 0.25, 1)';
      coin.style.transform = `rotateY(${finalRotation}deg) rotateX(${360 * 2}deg)`;

      // Add bounce effect
      setTimeout(() => {
        coin.style.transition = 'transform 0.3s ease-out';
        coin.style.transform = `rotateY(${finalRotation}deg) rotateX(0deg) scale(1.1)`;

        setTimeout(() => {
          coin.style.transform = `rotateY(${finalRotation}deg) rotateX(0deg) scale(1)`;

          // Celebration effect
          setTimeout(() => {
            // Trigger confetti
            if (window.celebrate) {
              window.celebrate({
                confetti: true,
                burst: true,
                element: coin,
                intensity: 'medium'
              });
            }

            onDone(result);
          }, 200);
        }, 200);
      }, 2000);
    }, 50);
  },
};
