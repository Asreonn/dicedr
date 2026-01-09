export function renderHistory({ container, history, t, onRerun }) {
  const section = document.createElement("section");
  section.className = "section";

  const title = document.createElement("div");
  title.className = "section-title";
  title.textContent = t("history.title");
  section.appendChild(title);

  if (!history.length) {
    const empty = document.createElement("div");
    empty.className = "method-sub";
    empty.textContent = t("history.empty");
    section.appendChild(empty);
    container.appendChild(section);
    return;
  }

  const list = document.createElement("div");
  list.className = "history-list";

  history.forEach((item) => {
    const row = document.createElement("div");
    row.className = "history-item";
    row.innerHTML = `<div><div class="method-title">${item.value}</div><div class="method-sub">${item.methodLabel}</div></div>`;

    const button = document.createElement("button");
    button.className = "ghost";
    button.textContent = t("home.open");
    button.addEventListener("click", () => onRerun(item));

    row.appendChild(button);
    list.appendChild(row);
  });

  section.appendChild(list);
  container.appendChild(section);
}
