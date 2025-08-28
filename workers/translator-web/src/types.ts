import * as v from 'valibot';
import { TranslationDataSchema } from './schemas';

export type TranslationData = v.InferOutput<typeof TranslationDataSchema>;
export type Translation = {
  text: TranslationData['text'];
  fromLang: TranslationData['fromLang'];
  toLang: TranslationData['toLang'];
  translateText: string;
};
