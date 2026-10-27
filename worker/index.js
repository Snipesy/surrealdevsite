// Cloudflare Worker for surrealdev.com. The site itself is static files (dist/), served by
// Workers static assets without running this code; only /api/* reaches it (see wrangler.jsonc).
import { handleForm } from './form.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    let response;
    if (url.pathname === '/api/form') {
      response = request.method === 'POST' ? await handleForm(request, env) : new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } });
      // Static assets get these from public/_headers; responses made here need them added
      response = new Response(response.body, response);
      response.headers.set('Cache-Control', 'no-store');
      response.headers.set('X-Content-Type-Options', 'nosniff');
      response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains');
    } else {
      response = await env.ASSETS.fetch(request);
    }
    // Staging must never show up in search results
    if (env.NOINDEX === '1') {
      response = new Response(response.body, response);
      response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    }
    return response;
  },
};
