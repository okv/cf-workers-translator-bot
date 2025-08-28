import { Hono } from 'hono';
import { TranslationData } from './types';
import { translationPageTemplate } from './templates/translations';

type Bindings = {
  TRANSLATION_API_KEY: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get('/translations', async (ctx) => {
  const { req } = ctx;

  const translationData: TranslationData = {
    text: req.param('text') ?? 'some text',
    fromLang: req.param('from_lang') ?? 'en',
    toLang: req.param('to_lang') ?? 'de',
  };

  return ctx.html(translationPageTemplate(translationData));
});

app.notFound(async () => {
  return new Response('Not Found');
});

export default app;
