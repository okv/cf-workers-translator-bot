export type TranslateOptions = {
  apiKey: string;
  fromLang?: string;
};

export type Translation = {
  text: string;
  fromLang: string;
  translatedText: string;
};

/**
 * Translates input text, returning translated text.
 * @param text - The input text to translate.
 * @param to - Required The language to use for translation of the input text, e.g. "en"
 * @returns An of translations
 */
export async function translateText(
  text: string,
  to: string,
  options: TranslateOptions,
): Promise<Translation[]> {
  const translatedText = text.split('').reverse().join('');
  return [{
    text,
    fromLang: 'de',
    translatedText,
  }];
}
