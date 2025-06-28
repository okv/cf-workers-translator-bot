import { env, createExecutionContext, waitOnExecutionContext, SELF } from 'cloudflare:test';
import { beforeAll, describe, it, expect } from 'vitest';
import worker from '../src/index';

// For now, you'll need to do something like this to get a correctly-typed
// `Request` to pass to `worker.fetch()`.
const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

describe('translator-bot worker', () => {
  beforeAll(() => {
    // All vars from .dev.vars.example should be overriden here
    // TODO: move it to helpers
    env.WHATSAPP_TOKEN = 'test-token';
    env.WHATSAPP_APP_SECRET = 'test-app-secret';
    env.WHATSAPP_VERIFY_TOKEN = 'test-verify-token';
  });

  it('responds "Not Found" when requesting the root path', async () => {
    const request = new IncomingRequest('http://example.com');
    // Create an empty context to pass to `worker.fetch()`.
    const ctx = createExecutionContext();
    const response = await worker.fetch(request, env, ctx);
    // Wait for all `Promise`s passed to `ctx.waitUntil()` to settle before running test assertions
    await waitOnExecutionContext(ctx);
    expect(await response.text()).toMatchInlineSnapshot('"Not Found"');
  });

  it('responds "Not Found" when requesting the root path (integration style)', async () => {
    const response = await SELF.fetch('https://example.com');
    expect(await response.text()).toMatchInlineSnapshot('"Not Found"');
  });

  it('responds with a challenge id when requesting GET /webhook', async () => {
    const request = new IncomingRequest(
      'http://example.com/webhook?hub.mode=subscribe&hub.challenge=1158201444&hub.verify_token=test-verify-token',
    );
    const ctx = createExecutionContext();
    const response = await worker.fetch(request, env, ctx);
    await waitOnExecutionContext(ctx);
    expect(await response.text()).toMatchInlineSnapshot('"1158201444"');
  });
});
