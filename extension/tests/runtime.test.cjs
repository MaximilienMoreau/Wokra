const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const source = (name) => fs.readFileSync(path.join(root, name), 'utf8');

test('all manifest resources exist', () => {
  const manifest = JSON.parse(source('manifest.json'));
  const resources = [
    ...Object.values(manifest.icons), manifest.action.default_popup, manifest.options_page,
    ...manifest.content_scripts.flatMap((script) => [...script.js, ...script.css]),
  ];
  for (const file of resources) assert.ok(fs.existsSync(path.join(root, file)), file);
});

function contentContext() {
  const timers = [];
  let listener;
  let removed = false;
  const context = {
    location: { href: 'https://www.linkedin.com/jobs/view/123', pathname: '/jobs/view/123' },
    document: {
      title: 'Offre', querySelector: () => null,
      getElementById: () => ({ remove() { removed = true; } }),
    },
    chrome: {
      storage: { local: { get: async () => { throw new Error('Extension context invalidated'); } } },
      runtime: { onMessage: { addListener(fn) { listener = fn; } } },
    },
    setTimeout(fn) { timers.push(fn); }, setInterval() {},
  };
  vm.createContext(context);
  vm.runInContext(source('detector.js'), context);
  vm.runInContext(source('content.js'), context);
  return { timers, listener, removed: () => removed };
}

test('automatic analysis handles storage errors and removes stale results', async () => {
  const context = contentContext();
  await assert.doesNotReject(context.timers[0]());
  assert.equal(context.removed(), true);
});

test('message errors return a response; unrelated messages do not keep a channel open', async () => {
  const { listener } = contentContext();
  assert.equal(listener({ type: 'OTHER' }, {}, () => assert.fail()), false);
  const response = await new Promise((resolve) => {
    assert.equal(listener({ type: 'WOKRA_ANALYZE' }, {}, resolve), true);
  });
  assert.match(response.error, /Analyse indisponible/);
});

test('popup handles tab lookup failures and clears previous signals', async () => {
  const elements = {
    status: { textContent: '', dataset: { level: 'multiple' } },
    signals: { replaceChildren() { this.cleared = true; } },
    reanalyze: {},
  };
  vm.runInNewContext(source('popup.js'), {
    document: { getElementById: (id) => elements[id] }, URL,
    chrome: { tabs: { query: async () => { throw new Error('Tab unavailable'); } } },
  });
  await new Promise(setImmediate);
  assert.match(elements.status.textContent, /Rechargez/);
  assert.equal(elements.status.dataset.level, undefined);
  assert.equal(elements.signals.cleared, true);
});
