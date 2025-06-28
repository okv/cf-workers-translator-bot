import { ServerMessageTypesPatched, getWebhook, postWebhook } from 'whatsapp';
import { messageHandler } from './mhandler';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    function getHandler(request: Request): Response {
      const { searchParams } = new URL(request.url);
      const body = getWebhook(
        {
          'hub.mode': 'subscribe',
          'hub.verify_token': searchParams.get('hub.verify_token') ?? '',
          'hub.challenge': searchParams.get('hub.challenge') ?? '',
        },
        env.WHATSAPP_VERIFY_TOKEN,
      );

      return new Response(body, {
        status: 200,
        headers: { 'Content-Type': 'text/html' },
      });
    }

    async function postHandler(request: Request): Promise<Response> {
      const requestBody: string = await request.text();

      const responseBody = await postWebhook(
        JSON.parse(requestBody),
        requestBody,
        request.headers.get('x-hub-signature-256') ?? '',
        env.WHATSAPP_APP_SECRET,
        onWhatsAppMessage,
      );
      return new Response(responseBody ?? '');
    }

    function onWhatsAppMessage(
      phoneID: string,
      from: string,
      message: ServerMessageTypesPatched,
      name: string,
      data: object,
    ) {
      return messageHandler(phoneID, from, message, name, data, env.WHATSAPP_TOKEN);
    }

    const url: URL = new URL(request.url);
    const { pathname } = url;
    if (pathname === '/webhook') {
      switch (request.method) {
        case 'GET':
          return getHandler(request);
        case 'POST':
          return await postHandler(request);
      }
    }

    return new Response('Not Found');
  },
} satisfies ExportedHandler<Env>;
