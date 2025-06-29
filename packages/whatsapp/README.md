# WhatsApp API Library

This is a very minimalistic library to send and receive WhatsApp messages.

This library is a partial port of [whatsapp-api-js](https://github.com/Secreto31126/whatsapp-api-js) to make it work with CloudFlare workers. It uses the original package as a dev dependency for the types.

An usage example with CloudFlare workers would be:

```ts
import { getHandler, postHandler } from 'whatsapp';
// This is your handler for messages in a separate module
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
```
