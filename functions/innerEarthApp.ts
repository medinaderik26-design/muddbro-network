// Inner Earth Mini App — serves the full game UI

Deno.serve(async (req: Request) => {
  const html = await Deno.readTextFile("./innerearth_miniapp/index.html").catch(() => null);
  
  if (!html) {
    return new Response(`<!DOCTYPE html><html><body style="background:#000;color:#c9a227;font-family:Georgia;text-align:center;padding:50px">
      <h1>⛏️ Inner Earth</h1><p>Loading...</p></body></html>`, 
      { headers: { "Content-Type": "text/html" }});
  }
  
  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" }
  });
});
