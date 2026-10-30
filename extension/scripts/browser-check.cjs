const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
(async () => {
  const extension = path.resolve(__dirname, '..');
  const context = await chromium.launchPersistentContext(fs.mkdtempSync('/tmp/wokra-browser-'), {
    executablePath: process.env.WOKRA_CHROMIUM_EXECUTABLE || chromium.executablePath(),
    headless: true, ignoreDefaultArgs: ['--disable-extensions'], args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`],
  });
  try {
    const worker = context.serviceWorkers()[0] || await context.waitForEvent('serviceworker', { timeout: 15000 });
    const id = new URL(worker.url()).host;
    const errors = [];
    worker.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    await context.route('https://www.linkedin.com/**', route => route.fulfill({ contentType: 'text/html', body: '<!doctype html><html><body><main>Feed</main></body></html>' }));
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('https://www.linkedin.com/feed/');
    await page.evaluate(() => { history.pushState({}, '', '/jobs/view/123?tracking=secret'); });
    await page.waitForTimeout(700);
    assert.equal(await page.locator('#wokra-ghost-job-badge').count(), 0);
    await page.evaluate(() => { document.querySelector('main').innerHTML = '<h1>Developer</h1><div class="jobs-description__content">Constituer notre vivier. Aucun diplôme requis.</div>'; });
    await page.locator('#wokra-ghost-job-badge').waitFor();
    assert.match(await page.locator('#wokra-ghost-job-badge').innerText(), /Points à vérifier/);
    const first = await worker.evaluate(() => chrome.storage.local.get(null));
    assert.equal(Object.keys(first).length, 1);
    assert.ok(!JSON.stringify(first).includes('secret'));
    await page.evaluate(() => history.pushState({}, '', '/jobs/view/456'));
    await page.waitForTimeout(800);
    assert.equal(await page.locator('#wokra-ghost-job-badge').count(), 0);
    await page.evaluate(() => { document.querySelector('h1').textContent = 'Analyst'; document.querySelector('.jobs-description__content').textContent = 'Subject to funding.'; });
    await page.locator('#wokra-ghost-job-badge').waitFor();
    assert.equal(Object.keys(await worker.evaluate(() => chrome.storage.local.get(null))).length, 2);
    // Exercise popup messaging in an extension page while the offer tab is active.
    const popup = await context.newPage();
    await popup.goto(`chrome-extension://${id}/popup.html`);
    await page.bringToFront();
    const result = await popup.evaluate(async (tabId) => chrome.tabs.sendMessage(tabId, { type: 'WOKRA_ANALYZE' }), (await worker.evaluate(async () => (await chrome.tabs.query({ url: 'https://www.linkedin.com/*' }))[0].id)));
    assert.equal(result.level, 'review');
    const options = await context.newPage();
    await options.goto(`chrome-extension://${id}/options.html`);
    await options.locator('#clear-history').click();
    await options.getByText('L’historique local a été effacé.').waitFor();
    assert.equal(Object.keys(await worker.evaluate(() => chrome.storage.local.get(null))).length, 0);
    assert.deepEqual(errors, []);
    console.log('Browser: extension load, delayed DOM, SPA navigation, canonical storage, tab messaging and options deletion PASS');
  } finally { await context.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
