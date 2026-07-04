Deno.serve(async (req: Request) => {
  // Handle POST (save/load) by proxying to ringMineApp
  if (req.method === "POST") {
    const body = await req.text();
    const resp = await fetch("https://superagent-ec909dfa.base44.app/functions/ringMineApp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body
    });
    const text = await resp.text();
    return new Response(text, {
      status: resp.status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      }
    });
  }

  // GET: fetch game HTML and serve with cache-busting headers
  const resp = await fetch("https://superagent-ec909dfa.base44.app/functions/ringMineApp", {
    headers: { "Cache-Control": "no-cache" }
  });
  const html = await resp.text();
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0"
    }
  });
});
