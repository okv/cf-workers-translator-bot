import { describe, it, expect, vi } from 'vitest';
import { GoogleAPITranslateTextResponse, translateText } from '../src/translation';

const translationOptions = {
  apiKey: 'test-api-key',
};

vi.mock('translator');

describe('translateText', () => {
  it('should use fetch and its response', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValueOnce({
        data: {
          translations: [{ detectedSourceLanguage: 'en', translatedText: 'Fuchs' }],
        },
      } as GoogleAPITranslateTextResponse),
    });

    const translations = await translateText('fox', 'de', {
      ...translationOptions,
      fetch: fetchMock,
    });

    expect(translations).toEqual([
      {
        text: 'fox',
        fromLang: 'en',
        translatedText: 'Fuchs',
      },
    ]);
  });
});
