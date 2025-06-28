import {
  ServerMessageTypesPatched,
  Text,
  getWebhook,
  postWebhook,
  sendMessage,
  markAsRead,
} from './whatsapp';

export default {
  async fetch(request: Request, env, ctx): Promise<Response> {
    const TOKEN = env.WHATSAPP_TOKEN;

    function get(request: Request): Response {
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

    async function post(request: Request): Promise<Response> {
      const requestBody: string = await request.text();

      const responseBody = await postWebhook(
        JSON.parse(requestBody),
        requestBody,
        request.headers.get('x-hub-signature-256') ?? '',
        env.WHATSAPP_APP_SECRET,
        onMessage,
      );
      return new Response(responseBody ?? '');
    }

    async function onMessage(
      phoneID: string,
      from: string,
      message: ServerMessageTypesPatched,
      name: string,
    ) {
      console.log(`User ${name} (${from}) sent to bot ${phoneID} ${JSON.stringify(message)}`);

      let response;

      if (['text', 'image', 'document'].includes(message.type)) {
        let content = '';
        switch (message.type) {
          case 'text':
            content = `*${name}* said:\n\n${message.text.body}`;
            break;
          case 'image':
            content = `*${name}* shared:\n\n an image with ID ${message.image.id}`;
            break;
          case 'document':
            content = `*${name}* shared:\n\n an document with ID ${message.document.id}`;
            break;
        }

        response = await sendMessage(TOKEN, phoneID, from, new Text(content));
      }

      console.log(
        response ??
          'There are more types of messages, such as contacts, ' +
            'locations, templates, interactive, reactions and ' +
            'all the other media types.',
      );

      markAsRead(TOKEN, phoneID, message.id);
    }

    const url: URL = new URL(request.url);
    const { pathname } = url;
    if (pathname === '/webhook') {
      switch (request.method) {
        case 'GET':
          return get(request);
        case 'POST':
          return await post(request);
        default:
          return new Response('Not Found');
      }
    }

    return new Response('Not Found');
  },
} satisfies ExportedHandler<Env>;
