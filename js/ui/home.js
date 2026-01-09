export function renderHome({ container, methods, history, t, onOpenMethod, onRerun }) {
  container.innerHTML = "";

  const recentSection = document.createElement("section");
  recentSection.className = "section";

  const recentTitle = document.createElement("div");
  recentTitle.className = "section-title";
  recentTitle.textContent = t("home.recent");
  recentSection.appendChild(recentTitle);

  if (!history.length) {
    const empty = document.createElement("div");
    empty.className = "method-sub";
    empty.textContent = t("history.empty");
    recentSection.appendChild(empty);
  } else {
    history.slice(0, 3).forEach((item) => {
      const row = document.createElement("div");
      row.className = "history-item";

      const info = document.createElement("div");
      info.innerHTML = `<div class="method-title">${item.value}</div><div class="method-sub">${item.methodLabel}</div>`;

      const button = document.createElement("button");
      button.className = "ghost";
      button.textContent = t("home.open");
      button.addEventListener("click", () => onRerun(item));

      row.appendChild(info);
      row.appendChild(button);
      recentSection.appendChild(row);
    });
  }

  const methodsSection = document.createElement("section");
  methodsSection.className = "section";

  const methodsTitle = document.createElement("div");
  methodsTitle.className = "section-title";
  methodsTitle.textContent = t("home.methods");
  methodsSection.appendChild(methodsTitle);

  const grid = document.createElement("div");
  grid.className = "method-grid";

  methods.forEach((method) => {
    const card = document.createElement("div");
    card.className = "method-card";

    const meta = document.createElement("div");
    meta.innerHTML = `<div class="method-title">${t(method.titleKey)}</div><div class="method-sub">${t(method.subtitleKey)}</div>`;

    const button = document.createElement("button");
    button.className = "secondary";
    button.textContent = t("home.open");
    button.addEventListener("click", () => onOpenMethod(method.id));

    card.appendChild(meta);
    card.appendChild(button);
    grid.appendChild(card);
  });

  methodsSection.appendChild(grid);

  container.appendChild(recentSection);
  container.appendChild(methodsSection);
}
