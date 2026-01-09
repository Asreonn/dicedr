import { parseLines, shuffle, unique } from "../utils.js";

const EXAMPLES = {
  food: ["Pizza", "Sushi", "Burgers", "Salad", "Tacos"],
  movie: ["Comedy", "Drama", "Action", "Sci-fi", "Animation"],
  activity: ["Walk", "Game night", "Cafe", "Beach", "Museum"],
  chores: ["Dishes", "Vacuum", "Laundry", "Trash", "Plants"],
};

export function createListEditor({ container, value, t, onChange }) {
  const textarea = document.createElement("textarea");
  textarea.placeholder = t("inputs.placeholder");
  textarea.value = value.join("\n");

  const actions = document.createElement("div");
  actions.className = "input-actions";

  const actionButtons = [
    {
      label: t("common.example"),
      onClick: () => {
        const items = EXAMPLES.food;
        textarea.value = items.join("\n");
        onChange(items);
      },
    },
    {
      label: t("common.shuffle"),
      onClick: () => {
        const items = shuffle(parseLines(textarea.value));
        textarea.value = items.join("\n");
        onChange(items);
      },
    },
    {
      label: t("common.removeDup"),
      onClick: () => {
        const items = unique(parseLines(textarea.value));
        textarea.value = items.join("\n");
        onChange(items);
      },
    },
    {
      label: t("common.reset"),
      onClick: () => {
        textarea.value = "";
        onChange([]);
      },
    },
  ];

  actionButtons.forEach((config) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = config.label;
    button.addEventListener("click", config.onClick);
    actions.appendChild(button);
  });

  textarea.addEventListener("input", () => {
    onChange(parseLines(textarea.value));
  });

  container.appendChild(textarea);
  container.appendChild(actions);

  return {
    setValue(items) {
      textarea.value = items.join("\n");
    },
  };
}
