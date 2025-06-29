import { ServerMessageTypesPatched, postWebhook, getWebhook } from './whatsapp-api-js';

export function getHandler(verifyToken: string, request: Request): Response {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  if (mode !== 'subscribe') {
    throw new Error(`This mode is not supported: ${mode}`);

  }

  const body = getWebhook(
    {
      'hub.mode': 'subscribe',
      'hub.verify_token': searchParams.get('hub.verify_token') ?? '',
      'hub.challenge': searchParams.get('hub.challenge') ?? '',
    },
    verifyToken,
  );

  return new Response(body, {
    status: 200,
    headers: { 'Content-Type': 'text/html' },
  });
}

export async function postHandler(
  token: string,
  appSecret: string,
  request: Request,
  onMessage: Function,
): Promise<Response> {
  const requestBody: string = await request.text();

  const responseBody = await postWebhook(
    JSON.parse(requestBody),
    requestBody,
    request.headers.get('x-hub-signature-256') ?? '',
    appSecret,
    function onWhatsAppMessage(
      phoneID: string,
      from: string,
      message: ServerMessageTypesPatched,
      name: string,
      data: object,
    ) {
      return onMessage(phoneID, from, message, name, data, token);
    },
  );
  return new Response(responseBody ?? '');
}
