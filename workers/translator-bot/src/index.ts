import { WhatsAppAPI } from 'whatsapp-api-js';
import { Document, Image, Text } from 'whatsapp-api-js/messages';

async function apiFetch(url: string, token: string, options: RequestInit = {}): Promise<Response> {
	console.log('apiFetch sending request:', { url })
  return fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.headers ? options.headers : undefined)
    }
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

async function sendMessage(token: string, phoneID: string, to: string, message: WhatsAppMessage, context?: string) {
  const type = message._type;
  const request: WhatsAppRequest = {
    messaging_product: "whatsapp",
    type,
    to,
  };
  request[type] = message;
  if (context) request.context = { message_id: context };
  const promise = apiFetch(
    `https://graph.facebook.com/${API_VERSION}/${phoneID}/messages`,
		token,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(request)
    }
  );
  const response = await (await promise).json();
	return response;
}

// Assuming get is called on a GET request to your server
function get(api: WhatsAppAPI, request: Request): Response {
	// const { searchParams } = new URL(request.url);
	// Whatsapp.get({
	// 	'hub.mode': 'subscribe',
	// 	'hub.verify_token': searchParams.get('hub.verify_token') ?? '',
	// 	'hub.challenge': searchParams.get('hub.challenge') ?? '',
	// });

	const { searchParams } = new URL(request.url);
	const body = api.get({
		'hub.mode': 'subscribe',
		'hub.verify_token': searchParams.get('hub.verify_token') ?? '',
		'hub.challenge': searchParams.get('hub.challenge') ?? '',
	});

	return new Response(body, {
		status: 200,
		headers: {'Content-Type': 'text/html'}
	});
}

// Assuming post is called on a POST request to your server
async function post(api: WhatsAppAPI, request: Request): Promise<Response> {
	const requestBody: string = await request.text();

	const responseBody = await api.post(JSON.parse(requestBody), requestBody, request.headers.get('x-hub-signature-256') ?? '');
	return new Response(responseBody ?? '');
}


export default {
	async fetch(request: Request, env, ctx): Promise<Response> {

const TOKEN = env.WHATSAPP_TOKEN;

const Whatsapp = new WhatsAppAPI({
	token: TOKEN,
	appSecret: env.WHATSAPP_APP_SECRET,
	webhookVerifyToken: env.WHATSAPP_VERIFY_TOKEN,
	v: 'v23.0',
});

Whatsapp.on.message = async ({ phoneID, from, message, name, reply }) => {
	console.log(`User ${name} (${from}) sent to bot ${phoneID} ${JSON.stringify(message)}`);

	let response;

	if (message.type === 'text') {
		response = await sendMessage(TOKEN, phoneID, from, new Text(`*${name}* said:\n\n${message.text.body} :wave:`));
		// response = await reply(
  //           new Text(`*${name}* said:\n\n${message.text.body}`),
  //           true
  //       );
	}

	if (message.type === 'image') {
		response = await reply(new Image(message.image.id, true, `Nice photo, ${name}`));
	}

	if (message.type === 'document') {
		response = await reply(new Document(message.document.id, true, undefined, 'Our document'));
	}

	console.log(
		response ??
			'There are more types of messages, such as contacts, ' +
				'locations, templates, interactive, reactions and ' +
				'all the other media types.',
	);

	Whatsapp.markAsRead(phoneID, message.id);
};

Whatsapp.on.sent = async ({ phoneID, to, message }) => {
	console.log(`Bot ${phoneID} sent to user ${to} ${message}`);
};

		const url: URL = new URL(request.url);
		const { pathname } = url;
		if (pathname === '/webhook') {
			switch (request.method) {
				case 'GET':
					return get(Whatsapp, request);
				case 'POST':
					return await post(Whatsapp, request);
				default:
					return new Response('Not Found');
			}
		}

		return new Response('Not Found');
	},
} satisfies ExportedHandler<Env>;
