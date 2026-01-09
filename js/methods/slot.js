import { createListEditor } from "../ui/listEditor.js";
import { shuffle } from "../utils.js";

function buildReel(items) {
  const track = document.createElement("div");
  track.className = "slot-track";
  items.forEach((item) => {
    const chip = document.createElement("div");
    chip.className = "slot-item";
    chip.textContent = item;
    track.appendChild(chip);
  });
  return track;
}

export const slotMethod = {
  id: "slot",
  titleKey: "method.slot.title",
  subtitleKey: "method.slot.subtitle",
  getDefaultState() {
    return {
      inputs: ["Pizza", "Sushi", "Burgers", "Salad"],
      settings: {},
    };
  },
  renderVisual(container, state) {
    const reels = document.createElement("div");
    reels.className = "slot-reels";
    for (let i = 0; i < 3; i += 1) {
      const reel = document.createElement("div");
      reel.className = "slot-reel";
      const items = shuffle(state.inputs).slice(0, 6);
      reel.appendChild(buildReel(items));
      reels.appendChild(reel);
    }
    container.innerHTML = "";
    container.appendChild(reels);
  },
  renderInputs(container, state, t, onUpdate) {
    createListEditor({
      container,
      value: state.inputs,
      t,
      onChange: (items) => onUpdate({ inputs: items }),
    });
  },
  renderSettings(container) {
    container.innerHTML = "";
  },
  validate(state, t) {
    if (!state.inputs || state.inputs.length < 2) {
      return { ok: false, message: t("inputs.empty") };
    }
    return { ok: true };
  },
  run({ state, visualEl, onDone }) {
    const reels = Array.from(visualEl.querySelectorAll(".slot-track"));
    const picks = [];
    reels.forEach((track, index) => {
      const items = shuffle(state.inputs).slice(0, 6);
      const pick = items[Math.floor(Math.random() * items.length)];
      picks.push(pick);
      track.innerHTML = "";
      items.concat([pick]).forEach((item) => {
        const chip = document.createElement("div");
        chip.className = "slot-item";
        chip.textContent = item;
        track.appendChild(chip);
      });
      const distance = track.scrollHeight - track.clientHeight;
      track.animate(
        [
          { transform: "translateY(0px)" },
          { transform: `translateY(-${distance}px)` },
        ],
        {
          duration: 1600 + index * 200,
          easing: "cubic-bezier(0.1, 0.7, 0.2, 1)",
          fill: "forwards",
        }
      );
    });

    setTimeout(() => {
      onDone(picks.join(" | "));
    }, 2000);
  },
};
