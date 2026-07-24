// Ring Mine UI proxy - serves v5 HTML, forwards API to ringMineApp
const HTML_URL = "https://base44.app/api/apps/6a4020251d35ee93ec909dfa/files/mp/public/6a4020251d35ee93ec909dfa/1f044a687_ringmine_ui_v5.html";
const API_URL = "https://superagent-ec909dfa.base44.app/functions/ringMineApp";
Deno.serve(async (req) => {
  if (req.method === "POST") {
    const r = await fetch(API_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: await req.text() });
    return new Response(await r.text(), { headers: { "Content-Type": "application/json" } });
  }
  const r = await fetch(HTML_URL, { cache: "no-store" });
  if (r.ok) return new Response(await r.text(), { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache" } });
  return new Response("Ring Mine loading...", { headers: { "Content-Type": "text/html" } });
});
