(function () {
  "use strict";
  if (globalThis.WokraContentLoaded) return;
  globalThis.WokraContentLoaded = true;
  const detector = globalThis.WokraDetector;
  let currentUrl = detector.canonicalUrl(location.href);
  let generation = 0;
  let lastSignature = "";
  let blockedSignature = "";
  let pending;
  let timer;
  let dismissed = false;
  const removeBadge = () => document.getElementById("wokra-ghost-job-badge")?.remove();
  function text(selectors) {
    for (const selector of selectors.split(",")) {
      const value = document.querySelector(selector.trim())?.textContent?.trim();
      if (value) return value;
    }
    return "";
  }
  function extract() {
    return {
      title: text(".job-details-jobs-unified-top-card__job-title, .jobs-unified-top-card__job-title, .topcard__title, h1"),
      company: text(".job-details-jobs-unified-top-card__company-name, .jobs-unified-top-card__company-name, .topcard__org-name-link"),
      location: text(".job-details-jobs-unified-top-card__primary-description-container, .jobs-unified-top-card__bullet, .topcard__flavor--bullet"),
      description: text(".jobs-description__content, .jobs-box__html-content, .jobs-description-content__text, .show-more-less-html__markup, .jobs-description").slice(0, 30000),
      publishedAt: detector.parseDate(text(".job-details-jobs-unified-top-card__primary-description-container, .jobs-unified-top-card__posted-date, .posted-time-ago, .jobs-unified-top-card__subtitle")),
      url: currentUrl,
    };
  }
  const signature = (raw) => JSON.stringify([raw.title, raw.company, raw.description]);
  function syncUrl() {
    const next = detector.canonicalUrl(location.href);
    if (next === currentUrl) return;
    // LinkedIn changes the URL before replacing the previous offer's DOM.
    blockedSignature = lastSignature || signature(extract());
    currentUrl = next;
    lastSignature = "";
    generation++;
    dismissed = false;
    removeBadge();
  }
  function show(job) {
    if (dismissed) return;
    removeBadge();
    const badge = document.createElement("aside");
    badge.id = "wokra-ghost-job-badge";
    badge.setAttribute("role", "status");
    const title = document.createElement("strong");
    title.textContent = `Wokra · ${job.label}`;
    const detail = document.createElement("span");
    detail.textContent = job.signals.length ? `${job.signals.length} indice(s) à vérifier` : "Aucun indice identifié dans le texte disponible";
    const close = document.createElement("button");
    close.type = "button";
    close.textContent = "×";
    close.setAttribute("aria-label", "Masquer l’analyse");
    close.onclick = () => { dismissed = true; removeBadge(); };
    badge.append(title, detail, close);
    document.documentElement.appendChild(badge);
  }
  async function analyze(force = false) {
    syncUrl();
    if (!currentUrl) return null;
    const raw = extract();
    const stamp = signature(raw);
    if (!raw.title || !raw.description || stamp === blockedSignature) {
      removeBadge();
      return { error: "Descriptif indisponible ou en cours de chargement. Affichez l’offre complète puis réessayez." };
    }
    if (!force && stamp === lastSignature) return null;
    if (pending?.stamp === stamp && pending.generation === generation) return pending.promise;
    const version = generation;
    const url = currentUrl;
    const promise = (async () => {
      const job = await chrome.runtime.sendMessage({ type: "WOKRA_RECORD", job: raw });
      syncUrl();
      if (version !== generation || url !== currentUrl || stamp !== signature(extract())) return { error: "L’offre a changé pendant l’analyse. Réessayez." };
      if (!job || job.error) throw new Error(job?.error || "Analyse indisponible");
      lastSignature = stamp;
      show(job);
      return job;
    })();
    pending = { stamp, generation: version, promise };
    try { return await promise; } finally { if (pending?.promise === promise) pending = null; }
  }
  chrome.runtime.onMessage.addListener((message, _sender, respond) => {
    if (message?.type !== "WOKRA_ANALYZE") return false;
    analyze(true).then(respond, () => {
      removeBadge();
      respond({ error: "Analyse indisponible. Rechargez l’offre puis réessayez." });
    });
    return true;
  });
  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(() => analyze().catch(removeBadge), 300);
  }
  new MutationObserver((mutations) => {
    if (mutations.some((mutation) => !mutation.target.closest?.("#wokra-ghost-job-badge") &&
      [...mutation.addedNodes, ...mutation.removedNodes].some((node) => node.id !== "wokra-ghost-job-badge"))) schedule();
    else if (mutations.some((mutation) => mutation.type === "characterData" && !mutation.target.parentElement?.closest("#wokra-ghost-job-badge"))) schedule();
  }).observe(document.documentElement, { childList: true, subtree: true, characterData: true });
  setInterval(() => { const previous = generation; syncUrl(); if (previous !== generation) schedule(); }, 500);
  schedule();
})();
