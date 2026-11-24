import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { access, readFile, readdir } from 'node:fs/promises';
import { createLandingHandler } from './server.mjs';
import handler from './api/index.mjs';
import './prepare-vercel.mjs';

assert.equal(typeof handler, 'function', 'Vercel entry exports a handler');
const config = JSON.parse(await readFile(new URL('./vercel.json', import.meta.url)));
assert.equal(config.outputDirectory, 'public');
for (const name of ['index.html', 'privacidad.html', 'cookies.html', 'assets/version-c.css', 'assets/logo-carousel.js', 'assets/logos/partners.csv']) {
  assert.deepEqual(await readFile(new URL('./public/' + name, import.meta.url)), await readFile(new URL('./' + name, import.meta.url)));
}
for (const name of ['.env', 'server.mjs', 'contact-mail.mjs', 'assistant-catalog.txt', 'node_modules', 'verification', 'assets/brochures']) {
  await assert.rejects(access(new URL('./public/' + name, import.meta.url)), { code: 'ENOENT' });
}
assert.deepEqual((await readdir(new URL('./public/', import.meta.url))).sort(), ['assets', 'cookies.html', 'index.html', 'privacidad.html']);
assert.ok(config.functions['api/index.mjs'].includeFiles.includes('assistant-catalog.txt'));

let contacts = 0;
const route = createLandingHandler({
  apiKey: 'test-only',
  sendContact: async () => { contacts++; },
  fetcher: async () => Response.json({ candidates: [{ content: { parts: [{ text: JSON.stringify({ answer: 'Prueba aislada', usedReferences: [] }) }] } }] })
});
// Emulate Vercel's parsed-body helper after it has consumed the HTTP stream.
const server = createServer(async (request, response) => {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  const text = Buffer.concat(chunks).toString();
  Object.defineProperty(request, 'body', { get() { return JSON.parse(text); } });
  await route(request, response);
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
try {
  const base = `http://127.0.0.1:${server.address().port}`;
  const post = (path, body) => fetch(base + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const chat = await post('/api/chat', { question: 'Hola', language: 'es' });
  assert.equal(chat.status, 200);
  assert.equal((await chat.json()).answer, 'Prueba aislada');
  const contact = await post('/api/contact', { name: 'Prueba', company: 'Empresa', email: 'test@example.com', phone: '5551234567', reason: 'support', consent: true });
  assert.equal(contact.status, 200);
  assert.equal(contacts, 1);
  assert.equal((await post('/api/chat', { question: 'x'.repeat(17000), language: 'es' })).status, 413);
  const malformed = await fetch(base + '/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' });
  assert.equal(malformed.status, 400);
  console.log('PASS: Vercel entry, static output, private-file exclusions and parsed-body API requests. No real email or AI request.');
} finally {
  await new Promise(resolve => server.close(resolve));
}
