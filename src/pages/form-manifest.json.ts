// The forms in page frontmatter, as data for functions/api/form.js, so the handler accepts only
// real forms and fields and uses these labels rather than anything the browser sends.
import { getCollection } from 'astro:content';

export async function GET() {
  const pages = await getCollection('pages');
  const forms = Object.fromEntries(
    pages
      .filter((p) => p.data.form)
      .map((p) => [
        p.id,
        p.data.form!.fields.map(({ name, label, type, required, options }) => ({ name, label, type, required, options })),
      ])
  );
  return new Response(JSON.stringify(forms), { headers: { 'Content-Type': 'application/json' } });
}
