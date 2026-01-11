const PRESERVE_QUERYSTRING = true;

const REDIRECTS: Record<string, string> = {
  "/bss/faleconosco": "https://espacofacial.com/barrashoppingsul/faleconosco",
  "/bss/faleconsco": "https://espacofacial.com/barrashoppingsul/faleconosco",

  "/nh/faleconosco": "https://espacofacial.com/novohamburgo/faleconosco",
  "/nh/faleconsco": "https://espacofacial.com/novohamburgo/faleconosco",
};

function normalizePath(pathname: string): string {
  const lower = pathname.toLowerCase();
  if (lower.length > 1 && lower.endsWith("/")) return lower.slice(0, -1);
  return lower;
}

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = normalizePath(url.pathname);

    const targetBase = REDIRECTS[path];
    if (!targetBase) return new Response("Not Found", { status: 404 });

    const target = new URL(targetBase);
    if (PRESERVE_QUERYSTRING) target.search = url.search;

    return Response.redirect(target.toString(), 301);
  },
};
