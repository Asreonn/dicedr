(() => {
  "use strict";

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function parseLines(text) {
    return text
      .split(/\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  }

  function unique(items) {
    return Array.from(new Set(items));
  }

  function shuffle(items) {
    const copy = items.slice();
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function pickN(items, count, noRepeat = false) {
    if (!noRepeat) {
      return Array.from({ length: count }, () => items[randInt(0, items.length - 1)]);
    }
    return shuffle(items).slice(0, count);
  }

  function safeJSONParse(value, fallback) {
    try {
      return JSON.parse(value);
    } catch (error) {
      return fallback;
    }
  }

  const FALLBACK_LANG = "en";

  function detectLanguage() {
    const lang = navigator.language || FALLBACK_LANG;
    return lang.toLowerCase().startsWith("tr") ? "tr" : "en";
  }

  function readInlineJSON(id) {
    const script = document.getElementById(id);
    if (!script) {
      return null;
    }
    return safeJSONParse(script.textContent, null);
  }

  async function loadLanguage(lang) {
    const inline = readInlineJSON(`i18n-${lang}`);
    if (inline) {
      return inline;
    }
    try {
      const response = await fetch(`i18n/${lang}.json`);
      if (!response.ok) {
        throw new Error("fetch failed");
      }
      return await response.json();
    } catch (error) {
      return {};
    }
  }

  async function createI18n(storage) {
    const saved = storage.getItem("dicedr_lang");
    const initial = saved || detectLanguage();
    const dictionaries = {
      en: await loadLanguage("en"),
      tr: await loadLanguage("tr"),
    };

    const api = {
      language: initial,
      t(key) {
        return dictionaries[api.language][key] || dictionaries.en[key] || key;
      },
      setLanguage(lang) {
        api.language = lang;
        storage.setItem("dicedr_lang", lang);
      },
      apply(root = document) {
        root.querySelectorAll("[data-i18n]").forEach((node) => {
          const key = node.getAttribute("data-i18n");
          node.textContent = api.t(key);
        });
      },
    };

    return api;
  }

  const STATE_KEY = "dicedr_state";

  function encodeBase64(value) {
    return btoa(unescape(encodeURIComponent(value)));
  }

  function decodeBase64(value) {
    try {
      return decodeURIComponent(escape(atob(value)));
    } catch (error) {
      return null;
    }
  }

  function loadState(storage, fallback) {
    const raw = storage.getItem(STATE_KEY);
    if (!raw) {
      return fallback;
    }
    return { ...fallback, ...safeJSONParse(raw, fallback) };
  }

  function saveState(storage, state) {
    storage.setItem(STATE_KEY, JSON.stringify(state));
  }

  function encodeShareState(state) {
    return encodeBase64(JSON.stringify(state));
  }

  function decodeShareState(value) {
    const decoded = decodeBase64(value);
    if (!decoded) {
      return null;
    }
    return safeJSONParse(decoded, null);
  }

  function createRouter(onRoute) {
    const parseHash = () => {
      const raw = window.location.hash.replace(/^#/, "");
      if (!raw) {
        return { view: "home" };
      }
      const [path, query] = raw.split("?");
      const params = new URLSearchParams(query || "");
      if (path.startsWith("method/")) {
        return {
          view: "method",
          methodId: path.replace("method/", ""),
          share: params.get("state"),
        };
      }
      return { view: "home" };
    };

    const handle = () => {
      onRoute(parseHash());
    };
    window.addEventListener("hashchange", handle);
    handle();

    return {
      goHome() {
        window.location.hash = "home";
      },
      goMethod(methodId, shareState) {
        const query = shareState ? `?state=${shareState}` : "";
        window.location.hash = `method/${methodId}${query}`;
      },
    };
  }

  const EXAMPLES = {
    food: ["Pizza", "Sushi", "Burgers", "Salad", "Tacos"],
    movie: ["Comedy", "Drama", "Action", "Sci-fi", "Animation"],
    activity: ["Walk", "Game night", "Cafe", "Beach", "Museum"],
    chores: ["Dishes", "Vacuum", "Laundry", "Trash", "Plants"],
  };

  function createListEditor({ container, value, t, onChange }) {
    const wrapper = document.createElement("div");
    wrapper.className = "list-editor";
    const preview = document.createElement("div");
    preview.className = "chip-preview";
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

    function updatePreview(items) {
      preview.innerHTML = "";
      const max = 14;
      items.slice(0, max).forEach((item) => {
        const chip = document.createElement("div");
        chip.className = "chip";
        chip.textContent = item;
        preview.appendChild(chip);
      });
      if (items.length > max) {
        const more = document.createElement("div");
        more.className = "chip chip-muted";
        more.textContent = `+${items.length - max}`;
        preview.appendChild(more);
      }
    }

    textarea.addEventListener("input", () => {
      const items = parseLines(textarea.value);
      updatePreview(items);
      onChange(items);
    });

    updatePreview(value);
    wrapper.appendChild(preview);
    wrapper.appendChild(textarea);
    wrapper.appendChild(actions);
    container.appendChild(wrapper);

    return {
      setValue(items) {
        textarea.value = items.join("\n");
        updatePreview(items);
      },
    };
  }

  const METHOD_ICONS = {
    wheel: "◑",
    random: "◆",
    coin: "◉",
    dice: "▦",
    slot: "▮",
  };

  function renderHome({ container, methods, t, onOpenMethod }) {
    container.innerHTML = "";

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
      meta.className = "card-meta";
      const icon = document.createElement("div");
      icon.className = "card-icon";
      icon.textContent = METHOD_ICONS[method.id] || "◆";

      const text = document.createElement("div");
      text.innerHTML = `<div class="method-title">${t(method.titleKey)}</div><div class="method-sub">${t(method.subtitleKey)}</div>`;
      meta.appendChild(icon);
      meta.appendChild(text);

      const button = document.createElement("button");
      button.className = "secondary";
      button.textContent = t("home.open");
      button.addEventListener("click", () => onOpenMethod(method.id));

      card.appendChild(meta);
      card.appendChild(button);
      grid.appendChild(card);
    });

    methodsSection.appendChild(grid);

    container.appendChild(methodsSection);
  }

  function renderMethodView({
    container,
    method,
    state,
    t,
    onUpdate,
  }) {
    container.innerHTML = "";

    if (!method.hideHeader) {
      const header = document.createElement("section");
      header.className = "section section-flat";
      header.innerHTML = `<div class="method-title">${t(method.titleKey)}</div><div class="method-sub">${t(method.subtitleKey)}</div>`;
      container.appendChild(header);
    }

    const visual = document.createElement("section");
    visual.className = "section";
    const visualBody = document.createElement("div");
    visualBody.className = "method-visual";
    const resultLine = document.createElement("div");
    resultLine.className = "method-sub result-line";
    resultLine.style.marginTop = "10px";
    visual.appendChild(visualBody);
    visual.appendChild(resultLine);
    container.appendChild(visual);

    const inputs = document.createElement("section");
    inputs.className = "section";
    container.appendChild(inputs);

    const settings = document.createElement("section");
    settings.className = "section";
    container.appendChild(settings);

    method.renderVisual(visualBody, state, t);
    method.renderInputs(inputs, state, t, onUpdate);
    method.renderSettings(settings, state, t, onUpdate);
    resultLine.textContent = state.lastResult ? state.lastResult : "—";
    if (method.visualMinimal) {
      visual.classList.add("section-flat");
      visualBody.classList.add("visual-flat");
    }
    if (!inputs.childElementCount) {
      inputs.classList.add("hidden");
    } else {
      inputs.classList.add("section-flat");
    }
    if (!settings.childElementCount) {
      settings.classList.add("hidden");
    } else {
      settings.classList.add("section-flat");
    }

    return { visualBody, resultLine };
  }

  const randomMethod = {
    id: "random",
    titleKey: "method.random.title",
    subtitleKey: "method.random.subtitle",
    getDefaultState() {
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
      row.className = "settings-row";

      const countWrap = document.createElement("label");
      countWrap.className = "field-pill";
      const countText = document.createElement("span");
      countText.textContent = t("picker.count");
      const stepper = document.createElement("div");
      stepper.className = "stepper";
      const minus = document.createElement("button");
      minus.type = "button";
      minus.textContent = "−";
      const countInput = document.createElement("input");
      countInput.type = "number";
      countInput.min = "1";
      countInput.max = "10";
      countInput.value = state.settings.count;
      const plus = document.createElement("button");
      plus.type = "button";
      plus.textContent = "+";
      stepper.appendChild(minus);
      stepper.appendChild(countInput);
      stepper.appendChild(plus);
      countWrap.appendChild(countText);
      countWrap.appendChild(stepper);

      const toggle = document.createElement("label");
      toggle.className = "toggle-pill";
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = state.settings.noRepeat;
      const span = document.createElement("span");
      span.textContent = t("settings.noRepeat");
      toggle.appendChild(checkbox);
      toggle.appendChild(span);

      row.appendChild(countWrap);
      row.appendChild(toggle);
      container.appendChild(row);

      countInput.addEventListener("input", () => {
        const count = clamp(Number(countInput.value || 1), 1, 10);
        onUpdate({ settings: { ...state.settings, count } });
      });
      minus.addEventListener("click", () => {
        const next = clamp(Number(countInput.value || 1) - 1, 1, 10);
        countInput.value = next;
        onUpdate({ settings: { ...state.settings, count: next } });
      });
      plus.addEventListener("click", () => {
        const next = clamp(Number(countInput.value || 1) + 1, 1, 10);
        countInput.value = next;
        onUpdate({ settings: { ...state.settings, count: next } });
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
    run({ state, visualEl, onDone }) {
      const count = clamp(state.settings.count || 1, 1, state.inputs.length);
      const picks = pickN(state.inputs, count, state.settings.noRepeat);
      const preview = visualEl.querySelector("[data-role='random-preview']");
      if (preview) {
        preview.innerHTML = "";
        preview.animate(
          [{ transform: "scale(0.98)", opacity: 0.6 }, { transform: "scale(1)", opacity: 1 }],
          { duration: 180, easing: "ease-out" }
        );
        picks.forEach((item) => {
          const pill = document.createElement("div");
          pill.className = "pill";
          pill.textContent = item;
          pill.animate(
            [{ transform: "translateY(8px)", opacity: 0 }, { transform: "translateY(0)", opacity: 1 }],
            { duration: 250, easing: "ease-out" }
          );
          preview.appendChild(pill);
        });
      }
      onDone(picks.join(", "));
    },
  };

  const coinMethod = {
    id: "coin",
    titleKey: "method.coin.title",
    subtitleKey: "method.coin.subtitle",
    visualMinimal: true,
    hideHeader: true,
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
      container.innerHTML = `<div class="modal-result coin-face" data-role="coin-preview">•</div>`;
    },
    renderInputs(container, state, t, onUpdate) {
      container.innerHTML = "";
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
    run({ state, visualEl, onDone }) {
      const pick = Math.random() < 0.5 ? state.inputs.a : state.inputs.b;
      const preview = visualEl.querySelector("[data-role='coin-preview']");
      if (preview) {
        preview.textContent = state.inputs.a;
        preview.classList.toggle("coin-heads", pick === state.inputs.a);
        preview.classList.toggle("coin-tails", pick === state.inputs.b);
        preview.animate(
          [
            { transform: "rotateY(0deg) scale(0.8)", filter: "brightness(1)" },
            { transform: "rotateY(540deg) scale(1.05)", filter: "brightness(1.3)" },
            { transform: "rotateY(720deg) scale(1)", filter: "brightness(1)" },
          ],
          { duration: 700, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" }
        );
        let flips = 0;
        const switcher = setInterval(() => {
          preview.textContent = flips % 2 === 0 ? state.inputs.b : state.inputs.a;
          flips += 1;
          if (flips > 4) {
            clearInterval(switcher);
          }
        }, 90);
        setTimeout(() => {
          preview.textContent = pick;
        }, 520);
      }
      onDone(pick);
    },
  };

  function buildDiceTray(tray, count) {
    tray.innerHTML = "";
    const dice = [];
    for (let i = 0; i < count; i += 1) {
      const unit = document.createElement("div");
      unit.className = "dice-unit";
      setDiceFace(unit, 1);
      tray.appendChild(unit);
      dice.push(unit);
    }
    return dice;
  }

  const diceMethod = {
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
        settings: { count: 1 },
      };
    },
    renderVisual(container, state) {
      const tray = document.createElement("div");
      tray.className = "dice-tray";
      container.innerHTML = "";
      container.appendChild(tray);
      buildDiceTray(tray, clamp(state.settings.count || 1, 1, 6));
    },
    renderInputs(container, state, t, onUpdate) {
      container.innerHTML = "";
    },
    renderSettings(container, state, t, onUpdate) {
      container.innerHTML = "";
      const row = document.createElement("div");
      row.className = "settings-row";
      const countWrap = document.createElement("label");
      countWrap.className = "field-pill";
      const countText = document.createElement("span");
      countText.textContent = t("dice.count");
      const stepper = document.createElement("div");
      stepper.className = "stepper";
      const minus = document.createElement("button");
      minus.type = "button";
      minus.textContent = "−";
      const countInput = document.createElement("input");
      countInput.type = "number";
      countInput.min = "1";
      countInput.max = "6";
      countInput.value = state.settings.count;
      const plus = document.createElement("button");
      plus.type = "button";
      plus.textContent = "+";
      stepper.appendChild(minus);
      stepper.appendChild(countInput);
      stepper.appendChild(plus);
      countWrap.appendChild(countText);
      countWrap.appendChild(stepper);
      row.appendChild(countWrap);
      container.appendChild(row);

      countInput.addEventListener("input", () => {
        const count = clamp(Number(countInput.value || 1), 1, 6);
        onUpdate({ settings: { ...state.settings, count } });
      });
      minus.addEventListener("click", () => {
        const next = clamp(Number(countInput.value || 1) - 1, 1, 6);
        countInput.value = next;
        onUpdate({ settings: { ...state.settings, count: next } });
      });
      plus.addEventListener("click", () => {
        const next = clamp(Number(countInput.value || 1) + 1, 1, 6);
        countInput.value = next;
        onUpdate({ settings: { ...state.settings, count: next } });
      });
    },
    validate(state) {
      const min = Number(state.inputs.min);
      const max = Number(state.inputs.max);
      if (Number.isNaN(min) || Number.isNaN(max) || min >= max) {
        return { ok: false, message: "" };
      }
      return { ok: true };
    },
    run({ state, visualEl, onDone, t }) {
      const min = 1;
      const max = 6;
      const count = clamp(state.settings.count || 1, 1, 6);
      const tray = visualEl.querySelector(".dice-tray");
      const dice = tray ? buildDiceTray(tray, count) : [];

      const results = dice.map(() => randInt(min, max));
      let ticks = 0;
      const interval = setInterval(() => {
        dice.forEach((unit) => {
          setDiceFace(unit, randInt(min, max));
          unit.animate(
            [{ transform: "translateY(-6px) rotate(-3deg)" }, { transform: "translateY(0) rotate(0deg)" }],
            { duration: 120, easing: "ease-out" }
          );
        });
        ticks += 1;
        if (ticks > 6) {
          clearInterval(interval);
          dice.forEach((unit, index) => {
            setDiceFace(unit, results[index]);
          });
          const total = results.reduce((sum, value) => sum + value, 0);
          const detail = results.join(" + ");
          if (count === 1) {
            onDone(String(total));
          } else {
            onDone(`${t("dice.total")}: ${total} (${detail})`);
          }
        }
      }, 90);
    },
  };

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
    const pointer = visualEl.querySelector(".wheel-pointer");
    const slice = (Math.PI * 2) / items.length;
    const index = Math.floor(Math.random() * items.length);
    const targetAngle = slice * index + slice / 2;
    const spins = 4 + Math.random() * 2;
    const current = Number(wheel.dataset.rotation || 0);
    const rotation = current + spins * Math.PI * 2 + (Math.PI * 2 - targetAngle);

    wheel.dataset.rotation = rotation;
    wheel
      .animate(
        [
          { transform: `rotate(${current}rad)` },
          { transform: `rotate(${rotation}rad)` },
        ],
        {
          duration: 2200,
          easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
          fill: "forwards",
        }
      )
      .onfinish = () => {
      drawWheel(canvas, items);
      wheel.animate(
        [
          { transform: `rotate(${rotation}rad) scale(1)` },
          { transform: `rotate(${rotation}rad) scale(1.02)` },
          { transform: `rotate(${rotation}rad) scale(1)` },
        ],
        { duration: 220, easing: "ease-out" }
      );
      if (pointer) {
        pointer.animate(
          [{ transform: "translateX(-50%) scale(1)" }, { transform: "translateX(-50%) scale(1.15)" }, { transform: "translateX(-50%) scale(1)" }],
          { duration: 260, easing: "ease-out" }
        );
      }
      onDone(items[index], index);
    };
  }

  const wheelMethod = {
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
      pointer.className = "wheel-pointer";
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
      const row = document.createElement("div");
      row.className = "settings-row";
      const toggle = document.createElement("label");
      toggle.className = "toggle-pill";
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = state.settings.noRepeat;
      const span = document.createElement("span");
      span.textContent = t("settings.noRepeat");
      toggle.appendChild(checkbox);
      toggle.appendChild(span);
      row.appendChild(toggle);
      container.appendChild(row);

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

  function setDiceFace(container, value) {
    const pips = [1, 2, 3, 4, 5, 6].includes(value) ? value : 1;
    const map = {
      1: [4],
      2: [0, 8],
      3: [0, 4, 8],
      4: [0, 2, 6, 8],
      5: [0, 2, 4, 6, 8],
      6: [0, 2, 3, 5, 6, 8],
    };
    container.innerHTML = "";
    const grid = document.createElement("div");
    grid.className = "dice-pips";
    for (let i = 0; i < 9; i += 1) {
      const pip = document.createElement("span");
      pip.className = "pip";
      pip.style.opacity = map[pips].includes(i) ? "1" : "0";
      grid.appendChild(pip);
    }
    container.appendChild(grid);
  }

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

  const slotMethod = {
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

      const value = picks.join(" | ");
    setTimeout(() => {
      const reelShells = Array.from(visualEl.querySelectorAll(".slot-reel"));
      reelShells.forEach((reel, index) => {
        reel.animate(
          [
            { transform: "translateY(0)" },
            { transform: "translateY(-6px)" },
            { transform: "translateY(0)" },
          ],
          { duration: 260 + index * 40, easing: "ease-out" }
        );
      });
      onDone(value);
    }, 2000);
    },
  };

  const methods = [wheelMethod, randomMethod, coinMethod, diceMethod, slotMethod];
  const methodMap = new Map(methods.map((method) => [method.id, method]));

  const appEl = document.getElementById("app");
  const runButton = document.getElementById("runButton");

  function createStorage() {
    try {
      const testKey = "__dicedr_test__";
      window.localStorage.setItem(testKey, "1");
      window.localStorage.removeItem(testKey);
      return window.localStorage;
    } catch (error) {
      const memory = new Map();
      return {
        getItem(key) {
          return memory.has(key) ? memory.get(key) : null;
        },
        setItem(key, value) {
          memory.set(key, String(value));
        },
        removeItem(key) {
          memory.delete(key);
        },
      };
    }
  }

  const storage = createStorage();

  const defaultState = {
    methodId: "wheel",
    methodStates: {},
  };

  let appState = loadState(storage, defaultState);

  const toast = document.createElement("div");
  toast.className = "toast";
  document.body.appendChild(toast);

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 1600);
  }

  function ensureMethodStates(t) {
    methods.forEach((method) => {
      if (!appState.methodStates[method.id]) {
        appState.methodStates[method.id] = method.getDefaultState(t);
      }
    });
  }

  function updateRunButton(method, t) {
    const state = appState.methodStates[method.id];
    const validation = method.validate(state, t);
    runButton.disabled = !validation.ok;
  }

  function renderLangToggle(i18n) {
    document.querySelectorAll(".lang-toggle button").forEach((button) => {
      const active = button.dataset.lang === i18n.language;
      button.classList.toggle("active", active);
    });
    i18n.apply();
  }

  async function boot() {
    const i18n = await createI18n(storage);
    ensureMethodStates(i18n.t.bind(i18n));

    let currentView = "home";
    let currentMethodId = appState.methodId;
    let currentVisualEl = null;
    let currentResultLine = null;

    const router = createRouter((route) => {
      if (route.view === "method") {
        currentView = "method";
        currentMethodId = route.methodId || appState.methodId;
        appState.methodId = currentMethodId;
        if (route.share) {
          const decoded = decodeShareState(route.share);
          if (decoded && decoded.methodId && decoded.methodState) {
            appState.methodId = decoded.methodId;
            currentMethodId = decoded.methodId;
            appState.methodStates[currentMethodId] = decoded.methodState;
          }
        }
        renderMethod(currentMethodId);
      } else {
        currentView = "home";
        renderHomeView();
      }
    });

    function renderHomeView() {
      renderHome({
        container: appEl,
        methods,
        t: i18n.t.bind(i18n),
        onOpenMethod: (id) => router.goMethod(id),
      });
      runButton.disabled = true;
      i18n.apply();
    }

    function renderMethod(methodId) {
      const method = methodMap.get(methodId) || methods[0];
      currentMethodId = method.id;
      const state = appState.methodStates[method.id] || method.getDefaultState(i18n.t.bind(i18n));
      appState.methodStates[method.id] = state;

      const view = renderMethodView({
        container: appEl,
        method,
        state,
        t: i18n.t.bind(i18n),
        onUpdate: (patch) => {
          const next = { ...appState.methodStates[method.id], ...patch };
          appState.methodStates[method.id] = next;
          saveState(storage, appState);
          if (currentVisualEl) {
            method.renderVisual(currentVisualEl, next, i18n.t.bind(i18n));
          }
          updateRunButton(method, i18n.t.bind(i18n));
        },
      });
      currentVisualEl = view.visualBody;
      currentResultLine = view.resultLine;

      runButton.disabled = false;
      updateRunButton(method, i18n.t.bind(i18n));
      i18n.apply();
    }

    function handleRun() {
      if (currentView !== "method") {
        return;
      }
      const method = methodMap.get(currentMethodId);
      const state = appState.methodStates[method.id];
      const validation = method.validate(state, i18n.t.bind(i18n));
      if (!validation.ok) {
        runButton.disabled = true;
        return;
      }

      method.run({
        state,
        t: i18n.t.bind(i18n),
        visualEl: appEl.querySelector(".method-visual"),
        onDone: (value, nextState = state) => {
          const updated = { ...nextState, lastResult: value };
          appState.methodStates[method.id] = updated;
          appState.methodId = method.id;
          saveState(storage, appState);
          if (currentResultLine) {
            currentResultLine.textContent = value;
            currentResultLine.animate(
              [{ transform: "translateY(6px)", opacity: 0 }, { transform: "translateY(0)", opacity: 1 }],
              { duration: 220, easing: "ease-out" }
            );
          }
        },
      });
    }

    runButton.addEventListener("click", handleRun);

    document.querySelectorAll(".lang-toggle button").forEach((button) => {
      button.addEventListener("click", () => {
        i18n.setLanguage(button.dataset.lang);
        appState.language = i18n.language;
        if (appState.methodStates.coin) {
          appState.methodStates.coin.inputs = {
            a: i18n.t("coin.labelA"),
            b: i18n.t("coin.labelB"),
          };
        }
        saveState(storage, appState);
        renderLangToggle(i18n);
        if (currentView === "home") {
          renderHomeView();
        } else {
          renderMethod(currentMethodId);
        }
      });
    });

    renderLangToggle(i18n);
    i18n.apply();
  }

  boot();
})();
