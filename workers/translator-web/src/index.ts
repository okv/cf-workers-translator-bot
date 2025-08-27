export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url: URL = new URL(request.url);
    const { pathname } = url;

    if (pathname === '/translations') {
      return new Response('Translations Page');
    }

    return new Response('Not Found');
  },
} satisfies ExportedHandler<Env>;
