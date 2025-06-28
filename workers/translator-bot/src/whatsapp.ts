import { PostData, GetParams, ClientMessage, ServerMessageTypes } from 'whatsapp-api-js/types';
// Reexporting some types to import everything from one place
export { Text } from 'whatsapp-api-js/messages';

export type ServerMessageBase = {
  id: string;
};
// TODO: Move id to the upstream
export type ServerMessageTypesPatched = ServerMessageTypes & ServerMessageBase;

const API_VERSION = 'v23.0';

// TODO: use path instead of url
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
  appSecret: string,
): Promise<boolean> {
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

export async function postWebhook(
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

export async function sendMessage(
  token: string,
  phoneID: string,
  to: string,
  message: ClientMessage,
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

export async function markAsRead(
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

export function getWebhook(params: GetParams, verifyToken?: string) {
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
