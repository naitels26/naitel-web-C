import assert from 'node:assert/strict';
import { createContactSender, CONTACT_RECIPIENT } from './contact-mail.mjs';

const env = {
  M365_TENANT_ID: '11111111-1111-1111-1111-111111111111',
  M365_CLIENT_ID: '22222222-2222-2222-2222-222222222222',
  M365_CLIENT_SECRET: 'test-only+&secret', M365_SENDER: 'sender@example.test'
};
const fields = { name: 'Prueba', company: 'Empresa <prueba>', email: 'reply@example.test',
  phone: '5551234567', reason: 'Diagnóstico' };
assert.equal(CONTACT_RECIPIENT, 'aleon@naitel.com');
assert.equal(createContactSender({}), null);
for (const key of Object.keys(env)) {
  const incomplete = { ...env, [key]: '' };
  assert.equal(createContactSender(incomplete), null, `Incomplete ${key} must not send`);
}
assert.equal(createContactSender({ ...env, M365_TENANT_ID: '../common' }), null);
assert.equal(createContactSender({ ...env, M365_SENDER: 'bad\r\n@example.test' }), null);
const calls = [];
const send = createContactSender(env, { fetcher: async (url, request) => {
  calls.push({ url, request });
  return calls.length === 1 ? Response.json({ access_token: 'test-token' }) : new Response(null, { status: 202 });
} });
await send(fields);
assert.equal(calls.length, 2);
assert.equal(calls[0].url, `https://login.microsoftonline.com/${env.M365_TENANT_ID}/oauth2/v2.0/token`);
const form = new URLSearchParams(calls[0].request.body);
assert.equal(form.get('client_secret'), env.M365_CLIENT_SECRET);
assert.equal(form.get('scope'), 'https://graph.microsoft.com/.default');
assert.equal(form.get('grant_type'), 'client_credentials');
assert.equal(calls[1].url, 'https://graph.microsoft.com/v1.0/users/sender%40example.test/sendMail');
assert.equal(calls[1].request.headers.Authorization, 'Bearer test-token');
const body = JSON.parse(calls[1].request.body);
assert.deepEqual(body.message.toRecipients, [{ emailAddress: { address: 'aleon@naitel.com' } }]);
assert.deepEqual(body.message.replyTo, [{ emailAddress: { address: fields.email } }]);
assert.match(body.message.body.content, /Empresa &lt;prueba&gt;/);
assert.equal(body.saveToSentItems, true);
for (const [authStatus, sendStatus, code] of [[401, 202, 'M365_AUTH_401'], [200, 403, 'M365_SEND_403'], [200, 429, 'M365_SEND_429'], [200, 500, 'M365_SEND_500']]) {
  let count = 0;
  const failing = createContactSender(env, { fetcher: async () => {
    count++;
    if (count === 1) return Response.json({ access_token: 'test-token', error: 'private response' }, { status: authStatus });
    return Response.json({ error: 'private response' }, { status: sendStatus });
  } });
  await assert.rejects(failing(fields), error => error.code === code && !error.message.includes('private'));
  assert.equal(count, authStatus === 200 ? 2 : 1, 'No automatic resend');
}
const invalidToken = createContactSender(env, { fetcher: async () => Response.json({}) });
await assert.rejects(invalidToken(fields), { code: 'M365_AUTH_TOKEN' });
console.log('PASS: Microsoft 365 OAuth request, Graph payload, test recipient, reply-to, incomplete setup, auth/send failures, no retries or leaked errors. No real messages sent.');
