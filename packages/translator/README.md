# Translator package

This is a very minimalistic library to translate text.

It uses [Google Cloud Basic Translation API](https://cloud.google.com/translate/docs/reference/rest/v2/translate), but tries to keep its interface implementation agnostic, so that it can be changed easily.

A usage of this package would be:

```ts
import { translateText } from 'translator';

const [translation] = await translateText(text, 'en', {
  apiKey: commandsParams.translationApiKey,
});

if (translation) {
  return `"${translation.text}" means "${translation.translatedText}" in "${translation.fromLang}" 💡`;
} else {
  return `I don't know what "${text}" means, sorry 😢`;
}
```
