import * as v from 'valibot';

// Fields to translate text
export const TranslationDataSchema = v.object({
  text: v.string(),
  fromLang: v.string(),
  toLang: v.string(),
});
