/**
 * Confetti and celebration effects module
 * Creates visual celebrations for successful results
 */

/**
 * Create and launch confetti particles
 * @param {Object} options - Confetti configuration
 */
export function launchConfetti(options = {}) {
  const {
    count = 50,
    duration = 3000,
    colors = ['#6a6dff', '#98f1df', '#f6b05b', '#ff7f7f', '#b58cff'],
    origin = { x: 0.5, y: 0.5 }, // Center of screen
  } = options;

  const container = document.body;

  for (let i = 0; i < count; i++) {
    createConfettiParticle(container, {
      color: colors[Math.floor(Math.random() * colors.length)],
      duration: duration + Math.random() * 1000,
      delay: Math.random() * 200,
      origin,
    });
  }
}

/**
 * Create a single confetti particle
 * @param {HTMLElement} container - Parent element
 * @param {Object} options - Particle options
 */
function createConfettiParticle(container, options) {
  const confetti = document.createElement('div');
  confetti.className = 'confetti';

  // Random position based on origin
  const startX = window.innerWidth * options.origin.x;
  const startY = window.innerHeight * options.origin.y;
  const randomX = (Math.random() - 0.5) * window.innerWidth;

  confetti.style.left = `${startX + randomX}px`;
  confetti.style.top = `${startY}px`;
  confetti.style.background = options.color;
  confetti.style.width = `${8 + Math.random() * 6}px`;
  confetti.style.height = `${8 + Math.random() * 6}px`;
  confetti.style.animationDuration = `${options.duration}ms`;
  confetti.style.animationDelay = `${options.delay}ms`;

  // Random shapes
  if (Math.random() > 0.5) {
    confetti.style.borderRadius = '50%';
  } else {
    confetti.style.borderRadius = '2px';
  }

  container.appendChild(confetti);

  // Remove after animation
  setTimeout(() => {
    confetti.remove();
  }, options.duration + options.delay);
}

/**
 * Create burst effect at element center
 * @param {HTMLElement} element - Target element
 */
export function createBurst(element) {
  const burst = document.createElement('div');
  burst.className = 'celebration-burst';

  const rect = element.getBoundingClientRect();
  burst.style.position = 'fixed';
  burst.style.left = `${rect.left + rect.width / 2}px`;
  burst.style.top = `${rect.top + rect.height / 2}px`;
  burst.style.width = '100px';
  burst.style.height = '100px';
  burst.style.transform = 'translate(-50%, -50%)';
  burst.style.pointerEvents = 'none';
  burst.style.zIndex = '9999';

  document.body.appendChild(burst);

  setTimeout(() => {
    burst.remove();
  }, 1500);
}

/**
 * Add shake effect to element
 * @param {HTMLElement} element - Element to shake
 */
export function shakeElement(element) {
  element.style.animation = 'none';
  setTimeout(() => {
    element.style.animation = 'shake 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
  }, 10);

  setTimeout(() => {
    element.style.animation = '';
  }, 510);
}

/**
 * Add temporary CSS keyframes for shake
 */
const shakeKeyframes = `
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}
`;

// Inject shake animation if not exists
if (!document.getElementById('shake-animation')) {
  const style = document.createElement('style');
  style.id = 'shake-animation';
  style.textContent = shakeKeyframes;
  document.head.appendChild(style);
}

/**
 * Full celebration package
 * Combines confetti, burst, and optional audio
 * @param {Object} options - Celebration options
 */
export function celebrate(options = {}) {
  const {
    confetti: confettiEnabled = true,
    burst: burstEnabled = true,
    element = null,
    intensity = 'medium', // 'low', 'medium', 'high'
  } = options;

  const intensityMap = {
    low: { count: 30, duration: 2000 },
    medium: { count: 50, duration: 3000 },
    high: { count: 100, duration: 4000 },
  };

  const config = intensityMap[intensity] || intensityMap.medium;

  if (confettiEnabled) {
    launchConfetti({
      count: config.count,
      duration: config.duration,
    });
  }

  if (burstEnabled && element) {
    createBurst(element);
  }
}

/**
 * Particle explosion from point
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {Object} options - Explosion options
 */
export function explodeAt(x, y, options = {}) {
  const {
    count = 20,
    colors = ['#6a6dff', '#98f1df'],
    size = 6,
  } = options;

  for (let i = 0; i < count; i++) {
    const particle = document.createElement('div');
    particle.style.position = 'fixed';
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.borderRadius = '50%';
    particle.style.background = colors[Math.floor(Math.random() * colors.length)];
    particle.style.pointerEvents = 'none';
    particle.style.zIndex = '9999';

    const angle = (Math.PI * 2 * i) / count;
    const velocity = 50 + Math.random() * 100;
    const vx = Math.cos(angle) * velocity;
    const vy = Math.sin(angle) * velocity;

    document.body.appendChild(particle);

    let posX = x;
    let posY = y;
    let alpha = 1;
    const startTime = Date.now();
    const duration = 800;

    function animate() {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / duration;

      if (progress >= 1) {
        particle.remove();
        return;
      }

      posX += vx * 0.016;
      posY += vy * 0.016 + progress * 200 * 0.016; // Gravity
      alpha = 1 - progress;

      particle.style.left = `${posX}px`;
      particle.style.top = `${posY}px`;
      particle.style.opacity = alpha;

      requestAnimationFrame(animate);
    }

    animate();
  }
}
