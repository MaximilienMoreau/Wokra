/* All history mutations share one queue, including requests from different tabs. */
importScripts("detector.js");
const prefix = "wokra:job:";
const retention = 180 * 86400000;
let queue = Promise.resolve();
function serial(task) {
  const result = queue.then(task);
  queue = result.catch(() => {});
  return result;
}
function observationDays(record) {
  const history = record?.history;
  // Older versions kept only the endpoints: do not invent intermediate visits.
  return history?.days || [history?.firstSeenAt?.slice(0, 10), history?.lastSeenAt?.slice(0, 10)];
}
async function clean() {
  const all = await chrome.storage.local.get(null);
  const merged = new Map();
  const obsolete = [];
  const cutoff = Date.now() - retention;
  for (const [key, record] of Object.entries(all)) {
    if (!key.startsWith(prefix)) continue;
    obsolete.push(key);
    let url;
    try { url = WokraDetector.canonicalUrl(decodeURIComponent(key.slice(prefix.length))); } catch { continue; }
    if (!url) continue;
    const days = observationDays(record).filter((day) => /^\d{4}-\d{2}-\d{2}$/.test(day || "") && Date.parse(day) >= cutoff && Date.parse(day) <= Date.now());
    if (!days.length) continue;
    const existing = merged.get(url);
    const latest = !existing || Date.parse(record.history.lastSeenAt) > Date.parse(existing.history.lastSeenAt) ? record : existing;
    merged.set(url, {
      job: { ...latest.job, url },
      history: { lastSeenAt: latest.history.lastSeenAt, days: [...new Set([...(existing?.history.days || []), ...days])].sort() },
    });
  }
  const records = [...merged.entries()].sort((a, b) => Date.parse(b[1].history.lastSeenAt) - Date.parse(a[1].history.lastSeenAt)).slice(0, 500);
  const updates = {};
  for (const [url, record] of records) {
    const days = record.history.days;
    Object.assign(record.history, { firstSeenAt: `${days[0]}T00:00:00.000Z`, observations: days.length });
    updates[prefix + encodeURIComponent(url)] = record;
  }
  // Write canonical records before removing aliases, so a worker shutdown cannot lose migrated history.
  if (records.length) await chrome.storage.local.set(updates);
  const removals = obsolete.filter((key) => !(key in updates));
  if (removals.length) await chrome.storage.local.remove(removals);
  return updates;
}
async function recordJob(raw) {
  const url = WokraDetector.canonicalUrl(raw?.url);
  if (!url || !raw?.title?.trim() || !raw?.description?.trim()) throw new Error("Incomplete offer");
  const all = await clean();
  const key = prefix + encodeURIComponent(url);
  const now = new Date().toISOString();
  const days = [...new Set([...(all[key]?.history.days || []), now.slice(0, 10)])].sort();
  const history = { days, firstSeenAt: `${days[0]}T00:00:00.000Z`, lastSeenAt: now, observations: days.length };
  const job = WokraDetector.analyzeJob({ ...raw, url, history });
  await chrome.storage.local.set({ [key]: { history, job } });
  await clean();
  return job;
}
chrome.runtime.onMessage.addListener((message, sender, respond) => {
  if (sender.id !== chrome.runtime.id) return false;
  let task;
  if (message?.type === "WOKRA_RECORD" && sender.tab) task = async () => {
    // sender.url can retain the original document URL after a LinkedIn SPA navigation.
    const tab = await chrome.tabs.get(sender.tab.id);
    const url = WokraDetector.canonicalUrl(tab.url);
    if (!url || url !== WokraDetector.canonicalUrl(message.job?.url)) throw new Error("Offer changed");
    return recordJob(message.job);
  };
  if (message?.type === "WOKRA_CLEAR" && sender.url === chrome.runtime.getURL("options.html")) task = async () => {
    const all = await chrome.storage.local.get(null);
    await chrome.storage.local.remove(Object.keys(all).filter((key) => key.startsWith(prefix)));
    return { ok: true };
  };
  if (!task) return false;
  serial(task).then(respond, () => respond({ error: "Analyse indisponible. Réessayez après le chargement de l’offre." }));
  return true;
});
function scheduleCleanup() {
  chrome.alarms.create("wokra-cleanup", { periodInMinutes: 60 });
  return serial(clean).catch(() => {});
}
chrome.runtime.onInstalled.addListener(scheduleCleanup);
chrome.runtime.onStartup.addListener(scheduleCleanup);
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "wokra-cleanup") serial(clean).catch(() => {});
});
