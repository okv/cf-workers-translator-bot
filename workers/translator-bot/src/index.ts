import { WhatsAppAPI } from 'whatsapp-api-js';
import { Document, Image, Text } from 'whatsapp-api-js/messages';

// Kind reminder to not hardcode your token and secret
const TOKEN = 'YOUR_TOKEN';
const APP_SECRET = 'YOUR_SECRET';
const VERIFY_TOKEN = 'YOUR_VERIFY_TOKEN';

const Whatsapp = new WhatsAppAPI({
	token: TOKEN,
	appSecret: APP_SECRET,
	webhookVerifyToken: VERIFY_TOKEN,
	v: '23.0',
});

// Assuming get is called on a GET request to your server
function get(request: Request) {
	const { searchParams } = new URL(request.url);
	Whatsapp.get({
		'hub.mode': 'subscribe',
		'hub.verify_token': searchParams.get('hub.verify_token') ?? '',
		'hub.challenge': searchParams.get('hub.challenge') ?? '',
	});
}

// Assuming post is called on a POST request to your server
async function post(request: Request) {
	const body: string = await request.text();

	await Whatsapp.post(JSON.parse(body), body, request.headers.get('x-hub-signature-256') ?? '');
}

Whatsapp.on.message = async ({ phoneID, from, message, name, reply }) => {
	console.log(`User ${name} (${from}) sent to bot ${phoneID} ${JSON.stringify(message)}`);

	let response;

	if (message.type === 'text') {
		response = await reply(new Text(`*${name}* said:\n\n${message.text.body}`), true);
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

Whatsapp.on.sent = ({ phoneID, to, message }) => {
	console.log(`Bot ${phoneID} sent to user ${to} ${message}`);
};

export default {
	async fetch(request: Request, env, ctx): Promise<Response> {
		const url: URL = new URL(request.url);
		const { pathname } = url;
		if (pathname === '/webhook') {
			switch (request.method) {
				case 'GET':
					get(request);
					return new Response('GET /webhook');
				case 'POST':
					await post(request);
					return new Response('POST /webhook');
				default:
					return new Response('Not Found');
			}
		}

		return new Response('Not Found');
	},
} satisfies ExportedHandler<Env>;
