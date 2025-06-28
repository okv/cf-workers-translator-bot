import { Text } from './message-types';
import type { PostData, ServerMessageTypes, GetParams } from './types';

async function apiFetch(url: string, token: string, options: RequestInit = {}): Promise<Response> {
  console.log('apiFetch sending request:', { url });
  return fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.headers ? options.headers : undefined),
    },
  });
}

const API_VERSION = 'v23.0';

interface WhatsAppMessage {
  _type: string;
}

interface WhatsAppRequest {
  messaging_product: string;
  type: string;
  to: string;
  [key: string]: any;
}

function escapeUnicode(str: string): string {
  return str.replace(/[^\0-~]/g, (ch) => {
    return '\\u' + ('000' + ch.charCodeAt(0).toString(16)).slice(-4);
  });
}

async function verifyRequestSignature(
  raw_body: string,
  signature: string,
  appSecret?: string,
): Promise<boolean> {
  if (!appSecret) throw new Error('WhatsAppAPIMissingAppSecretError');
  const { subtle } = crypto;
  if (!subtle) throw new Error('WhatsAppAPIMissingCryptoSubtleError');
  signature = signature.split('sha256=')[1];
  if (!signature) return false;
  const encoder = new TextEncoder();
  const keyBuffer = encoder.encode(appSecret);
  const key = await subtle.importKey('raw', keyBuffer, { name: 'HMAC', hash: 'SHA-256' }, true, [
    'sign',
    'verify',
  ]);
  const data = encoder.encode(escapeUnicode(raw_body));
  const result = await subtle.sign('HMAC', key, data);
  const result_array = Array.from(new Uint8Array(result));
  const check = result_array.map((b) => b.toString(16).padStart(2, '0')).join('');
  return signature === check;
}

async function postWebhook(
  data: PostData,
  raw_body: string,
  signature: string,
  appSecret: string,
  onMessage?: Function,
  onStatus?: Function,
) {
  if (!raw_body) throw new Error('WhatsAppAPIMissingRawBodyError');
  if (!signature) throw new Error('WhatsAppAPIMissingSignatureError');
  if (!(await verifyRequestSignature(raw_body, signature, appSecret))) {
    throw new Error('WhatsAppAPIFailedToVerifyError');
  }
  if (!data.object) {
    // TODO: set response status code to 400
    throw new Error('WhatsAppAPIUnexpectedError: Invalid payload: 400');
  }
  const value = data.entry[0].changes[0].value;
  const phoneID = value.metadata.phone_number_id;
  if ('messages' in value) {
    const message = value.messages[0];
    const contact = value.contacts?.[0];
    const from = contact?.wa_id ?? message.from;
    const name = contact?.profile.name;
    if (onMessage) {
      return onMessage(phoneID, from, message, name, data);
    }
  } else if ('statuses' in value) {
    const statuses = value.statuses[0];
    const phone = statuses.recipient_id;
    const status = statuses.status;
    const id = statuses.id;
    const timestamp = statuses.timestamp;
    const conversation = statuses.conversation;
    const pricing = statuses.pricing;
    const error = statuses.errors?.[0];
    const biz_opaque_callback_data = statuses.biz_opaque_callback_data;
    if (onStatus) {
      return onStatus(
        phoneID,
        phone,
        status,
        id,
        timestamp,
        conversation,
        pricing,
        error,
        biz_opaque_callback_data,
        data,
      );
    }
  }
  console.warn('WhatsAppAPIUnexpectedError: Unexpected payload: 200', { value });
}

async function sendMessage(
  token: string,
  phoneID: string,
  to: string,
  message: WhatsAppMessage,
  context?: string,
) {
  const type = message._type;
  const request: WhatsAppRequest = {
    messaging_product: 'whatsapp',
    type,
    to,
  };
  request[type] = message;
  if (context) request.context = { message_id: context };
  const promise = apiFetch(`https://graph.facebook.com/${API_VERSION}/${phoneID}/messages`, token, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
  const response = await (await promise).json();
  return response;
}

async function markAsRead(
  token: string,
  phoneID: string,
  messageId: string,
  indicator?: string,
): Promise<object> {
  const promise = apiFetch(`https://graph.facebook.com/${API_VERSION}/${phoneID}/messages`, token, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: messageId,
      typing_indicator: indicator ? { type: indicator } : void 0,
    }),
  });
  return await (await promise).json();
}

function getWebhook(params: GetParams, verifyToken?: string) {
  if (!verifyToken) {
    throw new Error('WhatsAppAPIMissingVerifyTokenError');
  }
  const { 'hub.mode': mode, 'hub.verify_token': token, 'hub.challenge': challenge } = params;
  if (!mode || !token) {
    throw new Error('WhatsAppAPIMissingSearchParamsError');
  }
  if (mode === 'subscribe' && token === verifyToken) {
    return challenge;
  }
  throw new Error('WhatsAppAPIFailedToVerifyTokenError');
}

export default {
  async fetch(request: Request, env, ctx): Promise<Response> {
    const TOKEN = env.WHATSAPP_TOKEN;

    // Assuming get is called on a GET request to your server
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

    // Assuming post is called on a POST request to your server
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
      message: ServerMessageTypes,
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
