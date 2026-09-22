(function () {
  const status = document.getElementById("status");
  const signals = document.getElementById("signals");
  function render(job) {
    if (!job) {
      status.textContent = "Ouvrez une offre LinkedIn pour lancer l’analyse.";
      return;
    }
    status.textContent = job.label;
    status.dataset.level = job.level || "unknown";
    signals.replaceChildren(
      ...(job.signals || []).map((signal) => {
        const li = document.createElement("li");
        const title = document.createElement("strong");
        const detail = document.createElement("span");
        title.textContent = signal.title;
        detail.textContent = signal.detail;
        li.append(title, detail);
        return li;
      }),
    );
  }
  async function run() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    let isOffer = false;
    try {
      const url = new URL(tab?.url || "");
      isOffer = (url.hostname === "linkedin.com" || url.hostname.endsWith(".linkedin.com")) && /^\/jobs\/view\/[^/]+/.test(url.pathname);
    } catch {
      isOffer = false;
    }
    if (!tab?.id || !isOffer) {
      render(null);
      return;
    }
    try {
      const result = await chrome.tabs.sendMessage(tab.id, { type: "WOKRA_ANALYZE" });
      if (result?.error) {
        status.textContent = result.error;
        signals.replaceChildren();
      } else {
        render(result);
      }
    } catch {
      status.textContent = "Rechargez l’offre LinkedIn puis réessayez.";
    }
  }
  document.getElementById("reanalyze").onclick = run;
  run();
})();
