import { renderHistory } from "./history.js";

export function renderMethodView({
  container,
  method,
  state,
  history,
  t,
  onUpdate,
  onRerun,
}) {
  container.innerHTML = "";

  const header = document.createElement("section");
  header.className = "section";
  header.innerHTML = `<div class="method-title">${t(method.titleKey)}</div><div class="method-sub">${t(method.subtitleKey)}</div>`;
  container.appendChild(header);

  const visual = document.createElement("section");
  visual.className = "section";
  const visualTitle = document.createElement("div");
  visualTitle.className = "section-title";
  visualTitle.textContent = t("result.title");
  const visualBody = document.createElement("div");
  visualBody.className = "method-visual";
  visual.appendChild(visualTitle);
  visual.appendChild(visualBody);
  container.appendChild(visual);

  const inputs = document.createElement("section");
  inputs.className = "section";
  const inputsTitle = document.createElement("div");
  inputsTitle.className = "section-title";
  inputsTitle.textContent = t("common.inputs");
  inputs.appendChild(inputsTitle);
  container.appendChild(inputs);

  const settings = document.createElement("section");
  settings.className = "section";
  const settingsTitle = document.createElement("div");
  settingsTitle.className = "section-title";
  settingsTitle.textContent = t("common.settings");
  settings.appendChild(settingsTitle);
  container.appendChild(settings);

  method.renderVisual(visualBody, state, t);
  method.renderInputs(inputs, state, t, onUpdate);
  method.renderSettings(settings, state, t, onUpdate);

  renderHistory({ container, history, t, onRerun });

  return { visualBody };
}
