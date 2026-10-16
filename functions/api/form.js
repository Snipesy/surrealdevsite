// Cloudflare Pages Function: POST /api/form
//
// Receives the forms defined in page frontmatter (src/components/Form.astro),
// checks Turnstile, and emails the submission through Resend.
//
// Settings (Pages → Settings → Variables and Secrets; locally in .dev.vars):
//   TURNSTILE_SECRET_KEY  Turnstile widget secret
//   RESEND_API_KEY        Resend API key
//   FORM_TO               where submissions go, e.g. you@surrealdev.com
//   FORM_FROM             verified Resend sender, e.g. "surrealdev.com <forms@surrealdev.com>"
//   SITE_URL              optional, default https://surrealdev.com (used for links in the email)
//   FORM_DRY_RUN=1        local testing only: print the email instead of sending it

const MAX_FIELD_CHARS = 5000;
const MAX_BODY_BYTES = 200 * 1024; // text only; forms don't take file uploads
const LOCAL_HOSTS = ['localhost', '127.0.0.1', '[::1]'];

// Cloudflare's Turnstile test secrets (1x..., 2x..., 3x...). Real secrets start with 0x.
const isTestSecret = (s) => /^[1-3]x0{20,}/.test(s);
const EMAIL_RE = /^[A-Za-z0-9.!#$%&*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+$/;

let manifest; // form id → fields, from /form-manifest.json (src/pages/form-manifest.json.ts)

export async function onRequestPost({ request, env }) {
  const local = LOCAL_HOSTS.includes(new URL(request.url).hostname);
  const dryRun = env.FORM_DRY_RUN === '1';

  const missing = ['TURNSTILE_SECRET_KEY', 'FORM_TO', 'FORM_FROM', ...(dryRun ? [] : ['RESEND_API_KEY'])].filter((k) => !env[k]);
  if (missing.length) return misconfigured(`missing settings: ${missing.join(', ')}`);
  // Test keys and dry runs switch off protection or delivery; never allow them on the live site
  if (!local && isTestSecret(env.TURNSTILE_SECRET_KEY)) return misconfigured('TURNSTILE_SECRET_KEY is a Cloudflare test key');
  if (!local && dryRun) return misconfigured('FORM_DRY_RUN is set outside localhost');

  const body = await readLimited(request, MAX_BODY_BYTES);
  if (body === null) return reply(413, 'That submission is too large.');
  let data;
  try {
    data = await new Response(body, { headers: { 'Content-Type': request.headers.get('Content-Type') || '' } }).formData();
  } catch {
    return reply(400, 'That submission couldn’t be read.');
  }

  // Bots fill in the hidden field; pretend it worked
  if (data.get('_website')) return reply(200, 'Thanks!');

  if (!(await verifyTurnstile(env.TURNSTILE_SECRET_KEY, data.get('cf-turnstile-response'), request, local))) {
    return reply(400, 'The spam check didn’t pass. Please try again.');
  }

  // Only real forms and fields, with the labels from the site (not from the browser)
  manifest ??= await env.ASSETS.fetch(new URL('/form-manifest.json', request.url)).then((r) => (r.ok ? r.json() : null)).catch(() => null);
  if (!manifest) return misconfigured("couldn't load /form-manifest.json");
  const form = String(data.get('_form') || '');
  const defs = Object.hasOwn(manifest, form) ? manifest[form] : null;
  if (!defs) return reply(400, 'Unknown form.');

  const allowed = new Set(['_form', '_website', 'cf-turnstile-response', ...defs.map((f) => f.name)]);
  for (const [name, value] of data.entries()) {
    if (typeof value !== 'string') return reply(400, 'File uploads aren’t accepted.');
    if (!allowed.has(name)) return reply(400, 'Unexpected field.');
  }

  const fields = [];
  for (const def of defs) {
    const values = data.getAll(def.name);
    if (values.length > 1) return reply(400, 'Unexpected field.');
    const value = String(values[0] ?? '').slice(0, MAX_FIELD_CHARS).trim();
    if (def.required && !value) return reply(400, `Please fill in “${def.label}”.`);
    if (value && def.type === 'email' && !EMAIL_RE.test(value)) return reply(400, `“${def.label}” isn’t a valid email address.`);
    if (value && def.type === 'select' && !def.options?.includes(value)) return reply(400, `Please choose an option for “${def.label}”.`);
    if (value && def.type === 'checkbox' && value !== 'yes') return reply(400, 'Unexpected field.');
    fields.push({ name: def.name, label: def.label, value: def.type === 'checkbox' ? (value ? 'Yes' : 'No') : value });
  }

  const replyTo = fields.find((f) => f.name === 'email' && f.value)?.value; // validated above
  const subject = fields.find((f) => f.name === 'subject')?.value;
  const site = (env.SITE_URL || 'https://surrealdev.com').replace(/\/$/, '');
  const pageUrl = `${site}/${form}/`;
  const notice = 'Sent through the website form. Everything below was typed by the visitor and is unverified.';

  const email = {
    from: env.FORM_FROM,
    to: env.FORM_TO.split(',').map((s) => s.trim()),
    reply_to: replyTo,
    subject: `[surrealdev.com form: ${form}] ${subject || `New submission${replyTo ? ` from ${replyTo}` : ''}`}`.replace(/[\r\n]+/g, ' ').slice(0, 200),
    text: [`Form: ${pageUrl}`, notice, '', ...fields.map((f) => `${f.label}:\n${f.value || '—'}\n`)].join('\n').trim(),
    html:
      `<p style="color:#666">Form: <a href="${esc(pageUrl)}">${esc(pageUrl)}</a><br>${esc(notice)}</p>` +
      fields.map((f) => `<p><strong>${esc(f.label)}</strong><br>${esc(f.value || '—').replace(/\n/g, '<br>')}</p>`).join(''),
  };

  if (dryRun) {
    console.log('FORM_DRY_RUN, not sending:', JSON.stringify(email, null, 2));
    return reply(200, 'Thanks! Your message was sent.');
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(email),
  });
  if (!res.ok) {
    console.error(`Resend ${res.status}: ${(await res.text()).slice(0, 500)}`);
    return reply(502, 'Sending failed on our side. Please try again later or email us.');
  }
  return reply(200, 'Thanks! Your message was sent.');
}

/** The request body, or null once it passes `max` bytes (Content-Length can be missing or wrong). */
async function readLimited(request, max) {
  if (Number(request.headers.get('Content-Length') || 0) > max) return null;
  if (!request.body) return new Uint8Array();
  const reader = request.body.getReader();
  const chunks = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > max) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  const out = new Uint8Array(size);
  let at = 0;
  for (const c of chunks) {
    out.set(c, at);
    at += c.byteLength;
  }
  return out;
}

async function verifyTurnstile(secret, token, request, local) {
  if (!token) return false;
  const body = new FormData();
  body.append('secret', secret);
  body.append('response', String(token));
  const ip = request.headers.get('CF-Connecting-IP');
  if (ip) body.append('remoteip', ip);
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body });
    const out = await res.json();
    if (out.success !== true) return false;
    // A token solved on another site must not work here. Test secrets report a placeholder
    // hostname, and are only accepted on localhost (checked above).
    return (local && isTestSecret(secret)) || out.hostname === new URL(request.url).hostname;
  } catch {
    return false;
  }
}

function misconfigured(why) {
  console.error(`Form handler misconfigured: ${why}`);
  return reply(500, 'The form isn’t set up yet. Please email us instead.');
}

function reply(status, message) {
  return Response.json({ ok: status === 200, message }, { status });
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}
