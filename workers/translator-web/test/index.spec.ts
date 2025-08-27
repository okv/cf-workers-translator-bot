import { describe, it, expect } from 'vitest';
import { SELF } from 'cloudflare:test';

describe('translator-web worker', () => {
  it('responds "Translations Page" when requesting /translations', async () => {
    const response = await SELF.fetch('https://example.com/translations');
    expect(await response.text()).toMatchInlineSnapshot('"Translations Page"');
  });

  it('responds "Not Found" when requesting the root path', async () => {
    const response = await SELF.fetch('https://example.com');
    expect(await response.text()).toMatchInlineSnapshot('"Not Found"');
  });
});
