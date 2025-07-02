import { getHandler, postHandler, ServerMessageTypesPatched } from 'whatsapp';
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
          return await postHandler(
            token,
            appSecret,
            request,
            (
              phoneID: string,
              from: string,
              message: ServerMessageTypesPatched,
              name: string,
              data: object,
              token: string,
            ) => {
              return onMessage(phoneID, from, message, name, data, token, env);
            },
          );
      }
    }

    return new Response('Not Found');
  },
} satisfies ExportedHandler<Env>;
