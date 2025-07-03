export type TranslateOptions = {
  apiKey: string;
  fromLang?: string;
  fetch?: (
    input: RequestInfo | URL,
    init?: RequestInit<RequestInitCfProperties>,
  ) => Promise<Response>;
};

export type Translation = {
  text: string;
  fromLang: string;
  translatedText: string;
};

export type RequestInitCfPropertiesExtended = RequestInitCfProperties & {
  fetch?: (
    input: RequestInfo | URL,
    init?: RequestInit<RequestInitCfProperties>,
  ) => Promise<Response>;
};

const TRANSLATION_API_URL = 'https://translation.googleapis.com/language/translate/v2';

export type GoogleAPITranslateTextResponse = {
  data?: {
    translations?: [
      {
        translatedText?: string;
        detectedSourceLanguage?: string;
      },
    ];
  };
};

async function fetchGoogleAPI(
  url: string,
  apiKey: string,
  options?: RequestInitCfPropertiesExtended,
): Promise<Response> {
  const request = options?.fetch ?? fetch;
  return request(url, {
    headers: Object.assign(
      {
        'X-goog-api-key': apiKey,
      },
      options?.headers,
    ),
  });
}

/**
 * Translates input text, returning translated text.
 * @param text - The input text to translate.
 * @param toLang - Required The language to use for translation of the input text, e.g. "en"
 * @returns An of translations
 */
export async function translateText(
  text: string,
  toLang: string,
  options: TranslateOptions,
): Promise<Translation[]> {
  const params = new URLSearchParams([
    ['q', text],
    ['target', toLang],
    ['format', 'text'],
  ]);
  const url = `${TRANSLATION_API_URL}?${params}`;
  const response = await fetchGoogleAPI(url, options.apiKey, {
    fetch: options.fetch,
  });

  if (response.ok) {
    const body = (await response.json()) as GoogleAPITranslateTextResponse;
    const translations = body?.data?.translations ?? [];
    return translations.map((translation) => ({
      text,
      fromLang: translation.detectedSourceLanguage ?? 'xx',
      translatedText: translation.translatedText ?? 'translatedText',
    }));
  } else {
    const body = await response.text();
    const errorMessage = `Translation request has failed with status ${response.status}: ${body}`;
    throw new Error(errorMessage);
  }
}
