import { describe, it, expect, vi } from 'vitest';
import { GoogleAPITranslateTextResponse, translateText } from '../src/translation';

const translationOptions = {
  apiKey: 'test-api-key',
};

describe('translateText', () => {
  it('should translate using fetch', async () => {
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
    expect(vi.mocked(fetchMock)).toBeCalledWith(
      'https://translation.googleapis.com/language/translate/v2?q=fox&target=de&format=text',
      { headers: { 'X-goog-api-key': 'test-api-key' } },
    );
  });

  it('should throw when fetch throws', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 400,
      text: vi.fn().mockResolvedValueOnce('The request is not good'),
    });

    await expect(() => {
      return translateText('fox', 'de', {
        ...translationOptions,
        fetch: fetchMock,
      });
    }).rejects.toThrow('Translation request has failed with status 400: The request is not good');
  });
});
