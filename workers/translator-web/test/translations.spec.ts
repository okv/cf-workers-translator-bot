import { describe, it, expect } from 'vitest';
import { SELF } from 'cloudflare:test';

describe('translator-web worker', () => {
  it('responds "Translations Page" when requesting /translations', async () => {
    const response = await SELF.fetch('https://example.com/translations');
    const body = await response.text();
    expect(body).toMatch('Translator Web: Translate');
    expect(body).toMatch('Text to translate');
    expect(body).toMatch('From');
    expect(body).toMatch('To');
    expect(body).toMatch('Translate');
  });
});
