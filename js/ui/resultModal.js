export function createResultModal({ t, onAction }) {
  const modal = document.getElementById("resultModal");
  const valueEl = document.getElementById("resultValue");

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      onAction("close");
    }
  });

  modal.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => onAction(button.dataset.action));
  });

  return {
    show(value) {
      valueEl.textContent = value;
      modal.classList.add("show");
      modal.setAttribute("aria-hidden", "false");
    },
    hide() {
      modal.classList.remove("show");
      modal.setAttribute("aria-hidden", "true");
    },
  };
}
