import { createI18n } from "./i18n.js";
import { createRouter } from "./router.js";
import {
  loadHistory,
  loadState,
  saveHistory,
  saveState,
  encodeShareState,
  decodeShareState,
} from "./store.js";
import { renderHome } from "./ui/home.js";
import { renderMethodView } from "./ui/methodView.js";
import { createResultModal } from "./ui/resultModal.js";
import { wheelMethod } from "./methods/wheel.js";
import { randomMethod } from "./methods/random.js";
import { coinMethod } from "./methods/coin.js";
import { diceMethod } from "./methods/dice.js";
import { slotMethod } from "./methods/slot.js";

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
let history = loadHistory(storage);

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

  const modal = createResultModal({
    t: i18n.t.bind(i18n),
    onAction: (action) => handleModalAction(action),
  });

  let currentView = "home";
  let currentMethodId = appState.methodId;
  let currentVisualEl = null;

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
      history,
      t: i18n.t.bind(i18n),
      onOpenMethod: (id) => router.goMethod(id),
      onRerun: (item) => {
        router.goMethod(item.methodId, item.shareState || null);
      },
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
      history,
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
      onRerun: (item) => {
        router.goMethod(item.methodId, item.shareState || null);
      },
    });
    currentVisualEl = view.visualBody;

    runButton.disabled = false;
    updateRunButton(method, i18n.t.bind(i18n));
    i18n.apply();
  }

  function handleModalAction(action) {
    if (action === "close" || action === "edit") {
      modal.hide();
      return;
    }

    if (action === "again") {
      modal.hide();
      handleRun();
      return;
    }

    if (action === "share") {
      const method = methodMap.get(appState.methodId);
      const methodState = appState.methodStates[method.id];
      const shareState = encodeShareState({
        methodId: method.id,
        methodState,
      });
      const base = window.location.href.split("#")[0];
      const url = `${base}#method/${method.id}?state=${shareState}`;

      if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => {
          showToast(i18n.t("share.copied"));
        });
      } else {
        showToast(url);
      }
    }
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
        appState.methodStates[method.id] = nextState;
        appState.methodId = method.id;
        saveState(storage, appState);

        const shareState = encodeShareState({
          methodId: method.id,
          methodState: nextState,
        });

        history.unshift({
          value,
          methodId: method.id,
          methodLabel: i18n.t(method.titleKey),
          shareState,
          timestamp: Date.now(),
        });
        history = history.slice(0, 20);
        saveHistory(storage, history);

        modal.show(value);
        renderMethod(method.id);
      },
    });
  }

  runButton.addEventListener("click", handleRun);

  document.querySelectorAll(".lang-toggle button").forEach((button) => {
    button.addEventListener("click", () => {
      i18n.setLanguage(button.dataset.lang);
      appState.language = i18n.language;
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
