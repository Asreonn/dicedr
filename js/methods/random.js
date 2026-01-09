import { createListEditor } from "../ui/listEditor.js";
import { clamp, pickN } from "../utils.js";

export const randomMethod = {
  id: "random",
  titleKey: "method.random.title",
  subtitleKey: "method.random.subtitle",
  getDefaultState(t) {
    return {
      inputs: ["Pizza", "Sushi", "Burgers"],
      settings: { count: 1, noRepeat: false },
    };
  },
  renderVisual(container) {
    container.innerHTML = `<div class="pill-row" data-role="random-preview"></div>`;
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
    const row = document.createElement("div");
    row.className = "inline-field";

    const countInput = document.createElement("input");
    countInput.type = "number";
    countInput.min = "1";
    countInput.max = "10";
    countInput.value = state.settings.count;

    const countLabel = document.createElement("label");
    countLabel.textContent = t("picker.count");
    countLabel.appendChild(countInput);

    const toggle = document.createElement("label");
    toggle.className = "toggle";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = state.settings.noRepeat;
    const span = document.createElement("span");
    span.textContent = t("settings.noRepeat");
    toggle.appendChild(checkbox);
    toggle.appendChild(span);

    row.appendChild(countLabel);
    row.appendChild(toggle);
    container.appendChild(row);

    countInput.addEventListener("input", () => {
      const count = clamp(Number(countInput.value || 1), 1, 10);
      onUpdate({ settings: { ...state.settings, count } });
    });
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
  run({ state, onDone }) {
    const count = clamp(state.settings.count || 1, 1, state.inputs.length);
    const picks = pickN(state.inputs, count, state.settings.noRepeat);
    onDone(picks.join(", "));
  },
};
