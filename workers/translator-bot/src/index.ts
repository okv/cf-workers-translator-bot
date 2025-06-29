import { getHandler, postHandler } from 'whatsapp';
import { onMessage } from './on-message';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url: URL = new URL(request.url);
    const { pathname } = url;

    if (pathname === '/webhook') {
      switch (request.method) {
        case 'GET':
          return getHandler(env.WHATSAPP_VERIFY_TOKEN, request);
        case 'POST':
          return await postHandler(env.WHATSAPP_TOKEN, env.WHATSAPP_APP_SECRET, request, onMessage);
      }
    }

    return new Response('Not Found');
  },
} satisfies ExportedHandler<Env>;
