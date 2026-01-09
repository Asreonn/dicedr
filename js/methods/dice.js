import { clamp, randInt } from "../utils.js";

const PRESETS = {
  d6: { min: 1, max: 6 },
  d20: { min: 1, max: 20 },
};

export const diceMethod = {
  id: "dice",
  titleKey: "method.dice.title",
  subtitleKey: "method.dice.subtitle",
  getDefaultState() {
    return {
      inputs: {
        preset: "d6",
        min: 1,
        max: 6,
      },
      settings: {},
    };
  },
  renderVisual(container) {
    container.innerHTML = `<div class="modal-result" data-role="dice-preview">•</div>`;
  },
  renderInputs(container, state, t, onUpdate) {
    const select = document.createElement("select");
    select.innerHTML = `
      <option value="d6">d6</option>
      <option value="d20">d20</option>
      <option value="custom">${t("dice.custom")}</option>
    `;
    select.value = state.inputs.preset;

    const row = document.createElement("div");
    row.className = "inline-field";

    const minInput = document.createElement("input");
    minInput.type = "number";
    minInput.value = state.inputs.min;
    const maxInput = document.createElement("input");
    maxInput.type = "number";
    maxInput.value = state.inputs.max;

    row.appendChild(minInput);
    row.appendChild(maxInput);

    container.appendChild(select);
    container.appendChild(row);

    select.addEventListener("change", () => {
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
      onUpdate({ inputs: { ...state.inputs, preset: "custom", min, max } });
    };

    minInput.addEventListener("input", handleNumber);
    maxInput.addEventListener("input", handleNumber);
  },
  renderSettings(container) {
    container.innerHTML = "";
  },
  validate(state) {
    const min = Number(state.inputs.min);
    const max = Number(state.inputs.max);
    if (Number.isNaN(min) || Number.isNaN(max) || min >= max) {
      return { ok: false, message: "" };
    }
    return { ok: true };
  },
  run({ state, onDone }) {
    const min = clamp(Number(state.inputs.min), -999, 999);
    const max = clamp(Number(state.inputs.max), min + 1, 999);
    onDone(String(randInt(min, max)));
  },
};
