import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import nodemailer from 'nodemailer';
import { createContactSender } from './contact-mail.mjs';

const code = await readFile(new URL('./assets/consent.js', import.meta.url), 'utf8');
function browser(saved, blocked = false) {
  const scripts = [], values = new Map(saved ? [['naitel-cookie-choice-v1', saved]] : []);
  let reloads = 0;
  const context = {
    window: { addEventListener() {} },
    document: { createElement: () => ({}), head: { append: script => scripts.push(script) } },
    localStorage: {
      getItem: key => { if (blocked) throw Error('Storage blocked'); return values.get(key); },
      setItem: (key, value) => { if (blocked) throw Error('Storage blocked'); values.set(key, value); }
    },
    location: { reload() { reloads++; } }
  };
  vm.runInNewContext(code, context);
  return { ...context, scripts, get reloads() { return reloads; } };
}
for (const initial of [undefined, 'essential', 'invalid']) {
  const page = browser(initial);
  assert.equal(page.scripts.length, 0, 'Google blocked without explicit consent');
  assert.equal(page.window.dataLayer[0][2].ad_user_data, 'denied');
  page.window.naitelConsent.save('optional');
  assert.equal(page.scripts.length, 1);
  assert.match(page.scripts[0].src, /id=AW-18496508499$/);
  page.window.naitelConsent.save('optional');
  assert.equal(page.scripts.length, 1, 'No duplicate tag');
  page.window.naitelConsent.save('essential');
  assert.equal(page.window.dataLayer.at(-1)[2].ad_personalization, 'denied');
  assert.equal(page.reloads, 1, 'Unload Google after withdrawal');
}
assert.equal(browser('optional').scripts.length, 1, 'Remember acceptance');
const blocked = browser(undefined, true);
blocked.window.naitelConsent.save('optional');
assert.equal(blocked.scripts.length, 1, 'Current choice works with storage blocked');

const original = nodemailer.createTransport;
let sent;
try {
  nodemailer.createTransport = () => ({ sendMail: async message => {
    sent = message;
    return { accepted: ['ventas@naitel.com'] };
  } });
  const send = createContactSender({ SMTP_HOST: 'smtp.example.test', SMTP_USER: 'sender@example.test', SMTP_PASS: 'test-only' });
  await send({ name: 'Persona de prueba', company: 'Empresa <test>', email: 'reply@example.test', phone: '8001886248', reason: 'Diagnóstico' });
  assert.equal(sent.to, 'ventas@naitel.com');
  assert.deepEqual(sent.envelope.to, ['ventas@naitel.com']);
  assert.equal(sent.replyTo, 'reply@example.test');
  assert.match(sent.html, /Empresa &lt;test&gt;/);
} finally { nodemailer.createTransport = original; }
console.log('PASS: Ads blocked/accepted/restored/revoked, duplicate prevention, blocked storage; sales recipient, envelope and reply-to. No real email or Google requests.');
