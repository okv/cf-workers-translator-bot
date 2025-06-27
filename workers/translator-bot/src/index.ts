/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
	async fetch(request: Request, env, ctx): Promise<Response> {
		const url: URL = new URL(request.url);
		const { pathname } = url;
		if (pathname === '/webhook') {
			switch (request.method) {
				case 'GET':
					return new Response('GET /webhook');
				case 'POST':
					return new Response('POST /webhook');
				default:
					return new Response('Not Found');
			}
		}

		return new Response('Not Found');
	},
} satisfies ExportedHandler<Env>;
