const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const source = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const tick = () => new Promise(setImmediate);
function detectorContext() {
  const context = vm.createContext({ URL });
  vm.runInContext(source('detector.js'), context);
  return context.WokraDetector;
}
const detector = detectorContext();

test('manifest resources exist and navigation monitoring is injected on LinkedIn entry pages', () => {
  const manifest = JSON.parse(source('manifest.json'));
  const resources = [...Object.values(manifest.icons), manifest.action.default_popup, manifest.options_page,
    manifest.background.service_worker, 'options.js',
    ...manifest.content_scripts.flatMap((script) => [...script.js, ...script.css])];
  for (const file of resources) assert.ok(fs.existsSync(path.join(root, file)), file);
  assert.ok(manifest.content_scripts[0].matches.includes('https://www.linkedin.com/*'));
  assert.ok(manifest.permissions.includes('alarms'));
});

test('canonical offer identity drops tracking, fragments, locale domains, slugs and trailing slashes', () => {
  for (const url of ['https://fr.linkedin.com/jobs/view/developer-123/?tracking=x#details', 'https://linkedin.com/jobs/view/123']) {
    assert.equal(detector.canonicalUrl(url), 'https://www.linkedin.com/jobs/view/123');
  }
  for (const url of ['https://evil.com/jobs/view/123', 'https://linkedin.com.evil.com/jobs/view/123', 'http://linkedin.com/jobs/view/123', 'https://www.linkedin.com/jobs/view/not-a-job', 'https://www.linkedin.com/jobs/search/']) assert.equal(detector.canonicalUrl(url), null);
});

test('dates validate the calendar and support French, English and ISO formats', () => {
  for (const input of ['31/02/2026', '29/02/2025', '2026-13-01', '31 avril 2026', '999999999999999999 years ago']) assert.equal(detector.parseDate(input), null, input);
  for (const input of ['01/07/2026', '2026-07-01', '1 juillet 2026', 'July 1, 2026']) assert.equal(detector.parseDate(input), '2026-07-01T00:00:00.000Z', input);
  assert.equal(detector.parseDate('29/02/2024'), '2024-02-29T00:00:00.000Z');
  assert.ok(Math.abs(Date.now() - Date.parse(detector.parseDate('3 months ago')) - 90 * 86400000) < 1000);
  assert.equal(detector.parseDate('unavailable'), null);
});

test('signals cover both languages and ignore unrelated negations', () => {
  for (const input of ['Constituer notre vivier de candidats. Aucun diplôme requis.', 'Join our talent pool.', 'Poste sous réserve de financement.', 'Poste sous réserve de l’obtention d’un financement.', 'Position subject to funding.']) assert.equal(detector.assessText(input, null, null).level, 'review', input);
  for (const input of ['Ne pas constituer notre vivier.', 'Do not join our talent pool.', 'This position is not subject to funding.', 'Le poste est confirmé.']) assert.equal(detector.assessText(input, null, null).signals.length, 0, input);
  const history = { firstSeenAt: '2020-01-01', lastSeenAt: '2020-06-01', observations: 2 };
  assert.equal(detector.assessText('', '2020-01-01', history).level, 'review');
  assert.equal(detector.assessText('Join our talent pool.', '2020-01-01', history).level, 'multiple');
});

function backgroundContext(initial = {}) {
  const records = structuredClone(initial);
  let listener, alarm, installed;
  let tabUrl;
  const local = {
    get: async (key) => key ? { [key]: records[key] } : structuredClone(records),
    set: async (data) => Object.assign(records, structuredClone(data)),
    remove: async (keys) => { for (const key of keys) delete records[key]; },
  };
  const context = vm.createContext({ URL, chrome: {
    storage: { local },
    tabs: { get: async () => ({ url: tabUrl }) },
    runtime: { id: 'wokra', getURL: (file) => `chrome-extension://wokra/${file}`, onMessage: { addListener(fn) { listener = fn; } }, onInstalled: { addListener(fn) { installed = fn; } }, onStartup: { addListener() {} } },
    alarms: { create() {}, onAlarm: { addListener(fn) { alarm = fn; } } },
  } });
  context.importScripts = (file) => vm.runInContext(source(file), context);
  vm.runInContext(source('background.js'), context);
  return {
    records, local, installed,
    alarm: () => alarm({ name: 'wokra-cleanup' }),
    request: (message, tab = true, actualUrl = message.job?.url) => new Promise((resolve) => {
      tabUrl = actualUrl;
      const accepted = listener(message, { id: 'wokra', url: tab ? 'https://www.linkedin.com/feed/' : 'chrome-extension://wokra/options.html', tab: { id: 1 } }, resolve);
      if (!accepted) resolve(undefined);
    }),
  };
}
const prefix = 'wokra:job:';
const key = (url) => prefix + encodeURIComponent(url);
const raw = (url = 'https://www.linkedin.com/jobs/view/123') => ({ title: 'Developer', description: 'Join our talent pool.', url });
const today = () => new Date().toISOString().slice(0, 10);

test('background serializes concurrent observations and persists canonical URLs only', async () => {
  const bg = backgroundContext();
  const jobs = await Promise.all(Array.from({ length: 5 }, () => bg.request({ type: 'WOKRA_RECORD', job: raw('https://fr.linkedin.com/jobs/view/developer-123/?tracking=secret') })));
  assert.ok(jobs.every((job) => job.level === 'review'));
  const entries = Object.values(bg.records);
  assert.equal(entries.length, 1);
  assert.equal(entries[0].history.observations, 1);
  assert.equal(entries[0].job.url, 'https://www.linkedin.com/jobs/view/123');
  assert.ok(!JSON.stringify(bg.records).includes('secret'));
  assert.equal((await bg.request({ type: 'WOKRA_RECORD', job: { ...raw(), description: '' } })).error.includes('indisponible'), true);
});

test('background uses the current tab URL after SPA navigation and rejects obsolete offers', async () => {
  const bg = backgroundContext();
  // The mock sender.url remains /feed/, matching Chrome's behavior after pushState.
  const accepted = await bg.request({ type: 'WOKRA_RECORD', job: raw() });
  assert.equal(accepted.level, 'review');
  const rejected = await bg.request({ type: 'WOKRA_RECORD', job: raw('https://www.linkedin.com/jobs/view/456') }, true, 'https://www.linkedin.com/jobs/view/789');
  assert.ok(rejected.error);
  assert.equal(Object.keys(bg.records).length, 1);
});

test('cleanup merges legacy aliases, removes expired observations and runs without a new analysis', async () => {
  const url = 'https://www.linkedin.com/jobs/view/123';
  const old = '2020-01-01T00:00:00.000Z';
  const bg = backgroundContext({
    [key('https://fr.linkedin.com/jobs/view/123/?tracking=secret')]: { job: { url: 'secret' }, history: { firstSeenAt: old, lastSeenAt: new Date().toISOString(), observations: 9 } },
    [key(url)]: { job: {}, history: { days: [today()], lastSeenAt: new Date().toISOString() } },
    [key('https://www.linkedin.com/jobs/view/456')]: { job: {}, history: { firstSeenAt: old, lastSeenAt: old } },
    preference: 'keep',
  });
  await bg.installed();
  assert.equal(Object.keys(bg.records).length, 2);
  assert.equal(bg.records[key(url)].history.observations, 1);
  assert.ok(!JSON.stringify(bg.records).includes('2020'));
  assert.ok(!JSON.stringify(bg.records).includes('secret'));
  assert.equal(await bg.request({ type: 'WOKRA_CLEAR' }), undefined);
  assert.equal((await bg.request({ type: 'WOKRA_CLEAR' }, false)).ok, true);
  assert.deepEqual(bg.records, { preference: 'keep' });
});

test('history is capped at 500 offers after recording a new one', async () => {
  const records = {};
  for (let i = 1; i <= 501; i++) records[key(`https://www.linkedin.com/jobs/view/${i}`)] = { job: {}, history: { days: [today()], lastSeenAt: new Date(Date.now() - i * 1000).toISOString() } };
  const bg = backgroundContext(records);
  await bg.request({ type: 'WOKRA_RECORD', job: raw('https://www.linkedin.com/jobs/view/999') });
  assert.equal(Object.keys(bg.records).length, 500);
  assert.ok(bg.records[key('https://www.linkedin.com/jobs/view/999')]);
});

function contentContext(start = 'https://www.linkedin.com/jobs/view/123') {
  let listener, interval, observer;
  let title = '', description = '', badge;
  const timers = new Map();
  let timerId = 0;
  const calls = [];
  let response = async () => ({ level: 'review', label: 'Points à vérifier', signals: [{ title: 'test' }] });
  const context = vm.createContext({ URL, location: { href: start },
    document: {
      querySelector(selector) { return { textContent: /job-title|topcard__title|^h1$/.test(selector) ? title : /description__content/.test(selector) ? description : '' }; },
      getElementById: () => badge,
      createElement: () => ({ setAttribute() {}, append() {}, remove() { badge = null; } }),
      documentElement: { appendChild(node) { badge = node; } },
    },
    chrome: { runtime: { onMessage: { addListener(fn) { listener = fn; } }, sendMessage: async (message) => { calls.push(message); return response(message); } } },
    setTimeout(fn) { timers.set(++timerId, fn); return timerId; }, clearTimeout(id) { timers.delete(id); },
    setInterval(fn) { interval = fn; },
    MutationObserver: class { constructor(fn) { observer = fn; } observe() {} },
  });
  vm.runInContext(source('detector.js'), context);
  vm.runInContext(source('content.js'), context);
  return {
    calls, badge: () => badge,
    setResponse(fn) { response = fn; },
    dom(t, d) { title = t; description = d; observer([{ target: {}, addedNodes: [{}], removedNodes: [] }]); },
    navigate(url) { context.location.href = url; interval(); },
    async flush() { const callbacks = [...timers.values()]; timers.clear(); for (const fn of callbacks) await fn(); },
    request: () => new Promise((resolve) => listener({ type: 'WOKRA_ANALYZE' }, {}, resolve)),
  };
}

test('delayed DOM is retried without storing an empty offer; unrelated mutations do not record twice', async () => {
  const ctx = contentContext();
  await ctx.flush();
  assert.equal(ctx.calls.length, 0);
  assert.match((await ctx.request()).error, /chargement/);
  ctx.dom('Developer', 'Join our talent pool.');
  await ctx.flush();
  assert.equal(ctx.calls.length, 1);
  assert.ok(ctx.badge());
  ctx.dom('Developer', 'Join our talent pool.');
  await ctx.flush();
  assert.equal(ctx.calls.length, 1);
});

test('SPA navigation from a non-offer page starts analysis and rejects the previous offer DOM', async () => {
  const ctx = contentContext('https://www.linkedin.com/feed/');
  await ctx.flush();
  ctx.navigate('https://www.linkedin.com/jobs/view/123');
  ctx.dom('First', 'First description');
  await ctx.flush();
  assert.equal(ctx.calls.length, 1);
  ctx.navigate('https://www.linkedin.com/jobs/view/456');
  await ctx.flush();
  assert.equal(ctx.calls.length, 1);
  assert.equal(ctx.badge(), null);
  ctx.dom('Second', 'Second description');
  await ctx.flush();
  assert.equal(ctx.calls.length, 2);
  assert.equal(ctx.calls[1].job.url, 'https://www.linkedin.com/jobs/view/456');
  ctx.navigate('https://www.linkedin.com/feed/');
  assert.equal(ctx.badge(), null);
});

test('late responses cannot display an old offer and identical concurrent requests share one analysis', async () => {
  const ctx = contentContext();
  let resolve;
  ctx.setResponse(() => new Promise((done) => { resolve = done; }));
  ctx.dom('First', 'Description');
  const first = ctx.request();
  const second = ctx.request();
  assert.equal(ctx.calls.length, 1);
  ctx.navigate('https://www.linkedin.com/jobs/view/456');
  resolve({ label: 'Old result', signals: [] });
  assert.match((await first).error, /changé/);
  await second;
  assert.ok(!ctx.badge());
});

test('automatic and manual message failures are handled', async () => {
  const ctx = contentContext();
  ctx.setResponse(async () => { throw new Error('Extension invalidated'); });
  ctx.dom('First', 'Description');
  await assert.doesNotReject(ctx.flush());
  assert.match((await ctx.request()).error, /indisponible/);
});

test('popup handles tab lookup failures and clears previous signals', async () => {
  const elements = { status: { textContent: '', dataset: { level: 'multiple' } }, signals: { replaceChildren() { this.cleared = true; } }, reanalyze: {} };
  vm.runInNewContext(source('popup.js'), { document: { getElementById: (id) => elements[id] }, URL,
    chrome: { tabs: { query: async () => { throw new Error('Tab unavailable'); } } } });
  await tick();
  assert.match(elements.status.textContent, /Rechargez/);
  assert.equal(elements.status.dataset.level, undefined);
  assert.equal(elements.signals.cleared, true);
});

test('options clear history with success feedback and recover from errors', async () => {
  let click, fail = false;
  const button = { addEventListener(_event, fn) { click = fn; } };
  const status = {};
  vm.runInNewContext(source('options.js'), { document: { getElementById: (id) => id === 'clear-history' ? button : status }, chrome: { runtime: { sendMessage: async () => { if (fail) throw Error(); return { ok: true }; } } } });
  await click();
  assert.match(status.textContent, /effacé/);
  fail = true;
  await click();
  assert.match(status.textContent, /indisponible/);
  assert.equal(button.disabled, false);
});
