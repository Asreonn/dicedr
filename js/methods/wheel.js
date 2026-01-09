import { createListEditor } from "../ui/listEditor.js";

const COLORS = ["#48d2b7", "#f6b05b", "#6fa4ff", "#ff7f7f", "#b58cff"];

function drawWheel(canvas, items) {
  const size = canvas.width;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, size, size);

  const radius = size / 2;
  const center = { x: radius, y: radius };
  const slice = (Math.PI * 2) / items.length;
  let angle = -Math.PI / 2;

  items.forEach((item, index) => {
    ctx.beginPath();
    ctx.moveTo(center.x, center.y);
    ctx.fillStyle = COLORS[index % COLORS.length];
    ctx.arc(center.x, center.y, radius - 8, angle, angle + slice);
    ctx.closePath();
    ctx.fill();

    ctx.save();
    ctx.translate(center.x, center.y);
    ctx.rotate(angle + slice / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#08110f";
    ctx.font = "bold 12px system-ui";
    ctx.fillText(item.slice(0, 12), radius - 18, 4);
    ctx.restore();

    angle += slice;
  });
}

function spinWheel({ visualEl, items, onDone }) {
  const canvas = visualEl.querySelector("canvas");
  const wheel = visualEl.querySelector(".wheel-rotator");
  const slice = (Math.PI * 2) / items.length;
  const index = Math.floor(Math.random() * items.length);
  const targetAngle = slice * index + slice / 2;
  const spins = 4 + Math.random() * 2;
  const current = Number(wheel.dataset.rotation || 0);
  const rotation = current + spins * Math.PI * 2 + (Math.PI * 2 - targetAngle);

  wheel.dataset.rotation = rotation;
  wheel.animate(
    [
      { transform: `rotate(${current}rad)` },
      { transform: `rotate(${rotation}rad)` },
    ],
    {
      duration: 2200,
      easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
      fill: "forwards",
    }
  ).onfinish = () => {
    drawWheel(canvas, items);
    onDone(items[index], index);
  };
}

export const wheelMethod = {
  id: "wheel",
  titleKey: "method.wheel.title",
  subtitleKey: "method.wheel.subtitle",
  getDefaultState() {
    return {
      inputs: ["Pizza", "Sushi", "Burgers", "Salad"],
      settings: { noRepeat: false },
    };
  },
  renderVisual(container, state) {
    const wrapper = document.createElement("div");
    wrapper.className = "wheel-rotator";
    const canvas = document.createElement("canvas");
    canvas.width = 240;
    canvas.height = 240;
    canvas.className = "wheel-canvas";
    wrapper.appendChild(canvas);

    const pointer = document.createElement("div");
    pointer.innerHTML = "▲";
    pointer.style.position = "absolute";
    pointer.style.top = "8px";
    pointer.style.left = "50%";
    pointer.style.transform = "translateX(-50%)";
    pointer.style.color = "#f6f7fb";
    pointer.style.fontSize = "16px";

    container.innerHTML = "";
    container.appendChild(pointer);
    container.appendChild(wrapper);

    drawWheel(canvas, state.inputs.length ? state.inputs : ["-"]);
  },
  renderInputs(container, state, t, onUpdate) {
    createListEditor({
      container,
      value: state.inputs,
      t,
      onChange: (items) => onUpdate({ inputs: items }),
    });
  },
  renderSettings(container, state, t, onUpdate) {
    const toggle = document.createElement("label");
    toggle.className = "toggle";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = state.settings.noRepeat;
    const span = document.createElement("span");
    span.textContent = t("settings.noRepeat");
    toggle.appendChild(checkbox);
    toggle.appendChild(span);
    container.appendChild(toggle);

    checkbox.addEventListener("change", () => {
      onUpdate({ settings: { ...state.settings, noRepeat: checkbox.checked } });
    });
  },
  validate(state, t) {
    if (!state.inputs || state.inputs.length < 2) {
      return { ok: false, message: t("inputs.empty") };
    }
    return { ok: true };
  },
  run({ state, visualEl, onDone }) {
    const items = state.inputs;
    spinWheel({
      visualEl,
      items,
      onDone: (value, index) => {
        let nextState = state;
        if (state.settings.noRepeat) {
          const remaining = items.filter((_, idx) => idx !== index);
          nextState = { ...state, inputs: remaining };
        }
        onDone(value, nextState);
      },
    });
  },
};
