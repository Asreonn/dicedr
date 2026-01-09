export const coinMethod = {
  id: "coin",
  titleKey: "method.coin.title",
  subtitleKey: "method.coin.subtitle",
  getDefaultState(t) {
    return {
      inputs: {
        a: t("coin.labelA"),
        b: t("coin.labelB"),
      },
      settings: {},
    };
  },
  renderVisual(container) {
    container.innerHTML = `<div class="modal-result" data-role="coin-preview">•</div>`;
  },
  renderInputs(container, state, t, onUpdate) {
    const row = document.createElement("div");
    row.className = "inline-field";

    const inputA = document.createElement("input");
    inputA.value = state.inputs.a;
    const inputB = document.createElement("input");
    inputB.value = state.inputs.b;

    row.appendChild(inputA);
    row.appendChild(inputB);
    container.appendChild(row);

    inputA.addEventListener("input", () => onUpdate({ inputs: { ...state.inputs, a: inputA.value } }));
    inputB.addEventListener("input", () => onUpdate({ inputs: { ...state.inputs, b: inputB.value } }));
  },
  renderSettings(container) {
    container.innerHTML = "";
  },
  validate(state) {
    if (!state.inputs.a || !state.inputs.b) {
      return { ok: false, message: "" };
    }
    return { ok: true };
  },
  run({ state, onDone }) {
    const pick = Math.random() < 0.5 ? state.inputs.a : state.inputs.b;
    onDone(pick);
  },
};
