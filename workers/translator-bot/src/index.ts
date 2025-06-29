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
      } = env;
      console.log('Config info', {
        tokenLength: token.length,
        appSecretLength: appSecret.length,
        verifyTokenLength: verifyToken.length,
      });

      switch (request.method) {
        case 'GET':
          return getHandler(verifyToken, request);
        case 'POST':
          return await postHandler(token, appSecret, request, onMessage);
      }
    }

    return new Response('Not Found');
  },
} satisfies ExportedHandler<Env>;
