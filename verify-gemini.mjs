import assert from 'node:assert/strict';
import { createLandingServer } from './server.mjs';

const success = () => Response.json({ candidates: [{ content: { parts: [{ text:
  JSON.stringify({ answer: 'Respuesta de prueba', usedReferences: [] })
}] } }] });

async function scenario(statuses, expectedStatus, expectedModels, options = {}) {
  const models = [];
  const server = createLandingServer({
    apiKey: 'test-only', model: 'gemini-3.5-flash-lite', sendContact: null,
    ...options,
    fetcher: async (url, request) => {
      models.push(decodeURIComponent(String(url).match(/models\/([^:]+):/)[1]));
      assert.equal(request.headers['x-goog-api-key'], 'test-only');
      const body = JSON.parse(request.body);
      assert.equal(body.generationConfig.responseMimeType, 'application/json');
      if (models.at(-1) === 'gemini-3.8-flash') {
        assert.equal(body.generationConfig.thinkingConfig.thinkingLevel, 'low');
      }
      const status = statuses.shift();
      assert.ok(status, 'Unexpected additional retry');
      return status === 200 ? success() : new Response('', { status });
    }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/chat`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: '¿Qué servicios ofrecen?', language: 'es', referenceKeys: [] })
    });
    assert.equal(response.status, expectedStatus);
    const body = await response.json();
    if (expectedStatus === 200) {
      assert.equal(body.provider, 'gemini');
      assert.equal(body.answer, 'Respuesta de prueba');
    } else assert.equal(body.error, 'gemini_unavailable');
    assert.deepEqual(models, expectedModels);
  } finally {
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  }
}

await scenario([200], 200, ['gemini-3.5-flash-lite']);
await scenario([503, 200], 200, ['gemini-3.5-flash-lite', 'gemini-3.8-flash']);
await scenario([503, 503], 502, ['gemini-3.5-flash-lite', 'gemini-3.8-flash']);
await scenario([504, 200], 200, ['gemini-3.5-flash-lite', 'gemini-3.8-flash']);
await scenario([403], 502, ['gemini-3.5-flash-lite']);
await scenario([400], 502, ['gemini-3.5-flash-lite']);
await scenario([503, 200], 200, ['gemini-3.5-flash-lite', 'custom-model'], { fallbackModel: 'custom-model' });
console.log('PASS: Gemini primary, transient error recovery, bounded fallback, custom fallback and no retry for invalid authentication/request. Simulated Google responses only.');
