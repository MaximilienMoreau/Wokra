(function () {
  "use strict";
  const detector = globalThis.WokraDetector;
  const state = { key: location.href.split("?")[0], job: null };
  const storagePrefix = "wokra:job:";

  function isOfferPage() {
    return /^\/jobs\/view\/[^/]+/.test(globalThis.location.pathname);
  }

  function updateKey() {
    const nextKey = globalThis.location.href.split("?")[0];
    if (nextKey !== state.key) {
      state.key = nextKey;
      state.job = null;
    }
  }

  function text(selectors) {
    for (const selector of selectors.split(",")) {
      const value = document.querySelector(selector.trim())?.textContent?.trim();
      if (value) return value;
    }
    return "";
  }
  function extract() {
    const title = text(".jobs-unified-top-card__job-title, .topcard__title, h1") || document.title.split(" | ")[0];
    const company = text(".jobs-unified-top-card__company-name, .topcard__org-name-link, .topcard__flavor");
    const place = text(".jobs-unified-top-card__bullet, .topcard__flavor--bullet, .jobs-unified-top-card__primary-description");
    const dateText = text(".jobs-unified-top-card__posted-date, .posted-time-ago, .jobs-unified-top-card__subtitle");
    const description = text(".jobs-description__content, .jobs-box__html-content, .jobs-description-content__text, .jobs-description, [class*='jobs-description']");
    return {
      title,
      company,
      location: place,
      description: description.slice(0, 30000),
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
    if (!isOfferPage()) {
      document.getElementById("wokra-ghost-job-badge")?.remove();
      return null;
    }
    updateKey();
    const raw = extract();
    const key = storagePrefix + encodeURIComponent(state.key);
    const stored = await chrome.storage.local.get(key);
    const old = stored[key]?.history;
    const now = new Date().toISOString();
    const day = now.slice(0, 10);
    const history = {
      firstSeenAt: old?.firstSeenAt || now,
      lastSeenAt: now,
      observations: (old?.observations || 0) + (old?.lastObservationDay === day ? 0 : 1),
      lastObservationDay: day,
    };
    state.job = detector.analyzeJob({ ...raw, history });
    await chrome.storage.local.set({ [key]: { history, job: state.job } });
    const all = await chrome.storage.local.get(null);
    const cutoff = Date.now() - 180 * 86400000;
    const stale = Object.entries(all)
      .filter(([entryKey, value]) => entryKey.startsWith(storagePrefix) && Date.parse(value?.history?.lastSeenAt || "") < cutoff)
      .map(([entryKey]) => entryKey);
    const entries = Object.keys(all).filter((entryKey) => entryKey.startsWith(storagePrefix));
    if (stale.length) await chrome.storage.local.remove(stale);
    if (entries.length - stale.length > 500) {
      const keep = entries
        .filter((entryKey) => !stale.includes(entryKey))
        .sort((a, b) => Date.parse(all[b]?.history?.lastSeenAt || "") - Date.parse(all[a]?.history?.lastSeenAt || ""))
        .slice(500);
      if (keep.length) await chrome.storage.local.remove(keep);
    }
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
  if (isOfferPage()) setTimeout(analyze, 1200);
  let lastUrl = location.href;
  setInterval(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      updateKey();
      setTimeout(analyze, 900);
    }
  }, 1000);
})();
