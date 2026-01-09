function parseHash() {
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
}

export function createRouter(onRoute) {
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
