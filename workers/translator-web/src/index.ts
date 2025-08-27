import { Hono } from 'hono';

type Bindings = {
  TRANSLATION_API_KEY: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get('/translations', async () => {
  return new Response('Translations Page');
});

app.notFound(async () => {
  return new Response('Not Found');
});

export default app;
