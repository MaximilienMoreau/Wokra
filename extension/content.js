(function () {
  "use strict";
  const detector = globalThis.WokraDetector;
  const state = { key: location.href.split("?")[0], job: null };

  function text(selector) {
    return document.querySelector(selector)?.textContent?.trim() || "";
  }
  function extract() {
    const body = document.body?.innerText || "";
    const title =
      text("h1") || text(".jobs-unified-top-card__job-title") || document.title.split(" | ")[0];
    const company = text(".jobs-unified-top-card__company-name") || text(".topcard__org-name-link");
    const place = text(".jobs-unified-top-card__bullet") || text(".topcard__flavor--bullet");
    const dateText = text(".jobs-unified-top-card__posted-date") || text(".posted-time-ago");
    return {
      title,
      company,
      location: place,
      description: body.slice(0, 30000),
      publishedAt: detector.parseDate(dateText),
      url: globalThis.location.href,
    };
  }
  function show(job) {
    document.getElementById("wokra-ghost-job-badge")?.remove();
    const badge = document.createElement("aside");
    badge.id = "wokra-ghost-job-badge";
    badge.setAttribute("role", "status");
    badge.innerHTML = `<strong>Wokra · ${job.label}</strong><span>${job.signals.length ? `${job.signals.length} indice(s) à vérifier` : "Aucun indice détecté"}</span><button type="button" aria-label="Masquer l’analyse">×</button>`;
    badge.querySelector("button").onclick = () => badge.remove();
    document.documentElement.appendChild(badge);
  }
  async function analyze() {
    const raw = extract();
    const stored = await chrome.storage.local.get(state.key);
    const old = stored[state.key]?.history;
    const now = new Date().toISOString();
    const history = {
      firstSeenAt: old?.firstSeenAt || now,
      lastSeenAt: now,
      observations: (old?.observations || 0) + 1,
    };
    state.job = detector.analyzeJob({ ...raw, history });
    await chrome.storage.local.set({ [state.key]: { history, job: state.job } });
    show(state.job);
    return state.job;
  }
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type === "WOKRA_ANALYZE")
      analyze()
        .then(sendResponse)
        .catch(() => sendResponse({ error: "Analyse indisponible" }));
    return true;
  });
  if (/\/jobs\/(view|collections)\//.test(location.pathname)) setTimeout(analyze, 1200);
  let lastUrl = location.href;
  setInterval(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      setTimeout(analyze, 900);
    }
  }, 1000);
})();
