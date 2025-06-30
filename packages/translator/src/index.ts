import { TranslateOptions } from './index.d';

/**
 * Translates input text, returning translated text.
 * @param text - The input text to translate.
 * @param to - Required The language to use for translation of the input text, e.g. "en"
 */
export async function translateText(text: string, to: string, options: TranslateOptions): Promise<string> {
  return text.split('').reverse().join('');
}
