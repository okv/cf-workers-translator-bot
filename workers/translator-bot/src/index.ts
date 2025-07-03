import { getHandler, postHandler } from 'whatsapp';
import { onMessage } from './on-message';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url: URL = new URL(request.url);
    const { pathname } = url;

    if (pathname === '/webhook') {
      const {
        WHATSAPP_TOKEN: token,
        WHATSAPP_APP_SECRET: appSecret,
        WHATSAPP_VERIFY_TOKEN: verifyToken,
        TRANSLATION_API_KEY: translationApiKey,
      } = env;

      switch (request.method) {
        case 'GET':
          return getHandler(verifyToken, request);
        case 'POST':
          return await postHandler(appSecret, request, (message, metadata) => {
            return onMessage(message, {
              ...metadata,
              whatsappToken: token,
              translationApiKey,
            });
          });
      }
    }

    return new Response('Not Found');
  },
} satisfies ExportedHandler<Env>;
