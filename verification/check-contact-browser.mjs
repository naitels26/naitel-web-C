import { chromium } from 'file:///C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1119-907-0_26.1119.907.0_x64__3k8sg7r9htsxt/dependencies/node/node_modules/playwright/index.mjs';
import { createLandingServer } from '../server.mjs';
import assert from 'node:assert/strict';
const server=createLandingServer({apiKey:null,sendContact:null});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({channel:'msedge',headless:true});
try {
 for(const [width,height] of [[1440,900],[390,844],[320,568]]){
  const context=await browser.newContext({viewport:{width,height}});
  // Stub external resources: verification never sends visitor data to Google.
  let ads=0; await context.route('https://**/*',route=>{if(route.request().url().includes('googletagmanager')) ads++;return route.fulfill({status:200,body:''});});
  const page=await context.newPage(); const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}`);
  await page.locator('#cookieBanner').waitFor({state:'visible'});
  assert.equal(ads,0);
  await page.locator('#cookieReject').click();
  await page.screenshot({path:`verification/contact-footer-${width}.png`});
  await page.locator('.footer-details .cookie-settings-open').click();
  await page.locator('#cookieDialog').waitFor({state:'visible'});
  assert.equal(await page.locator('#cookieAdvertising').isChecked(),false);
  await page.screenshot({path:`verification/cookie-settings-${width}.png`});
  await page.locator('#cookieAdvertising').check(); await page.locator('#cookieSave').click();
  await page.waitForFunction(()=>!!document.querySelector('#optionalAnalytics'));
  await page.reload();
  assert.equal(await page.locator('#cookieBanner').isHidden(),true);
  await page.locator('.footer-details .cookie-settings-open').click();
  assert.equal(await page.locator('#cookieAdvertising').isChecked(),true);
  await page.locator('#cookieAdvertising').uncheck();
  await Promise.all([page.waitForNavigation(),page.locator('#cookieSave').click()]);
  assert.equal(await page.locator('#optionalAnalytics').count(),0);
  await page.locator('[data-lang="en"]').click();
  await page.locator('.footer-details .cookie-settings-open').click();
  assert.equal(await page.locator('#cookieDialogTitle').textContent(),'Cookie settings');
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
  assert.equal(overflow,false);assert.deepEqual(errors,[]);
  console.log(`PASS: ${width}x${height} footer, cookie panel, consent/revoke/reload, English, no overflow or JS errors.`);
  await context.close();
 }
} finally {await browser.close();await new Promise(r=>server.close(r));}

