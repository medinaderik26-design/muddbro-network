import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, GET, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } });
  if (req.method === "GET") return new Response(JSON.stringify({ ok: true, service: "Ring Mine Market" }), { headers: { "Content-Type": "application/json" } });
  try {
    const body = await req.json();
    const base44 = createClientFromRequest(req);
    const tid = String(body.telegram_id || "");
    if (!tid) return new Response(JSON.stringify({ error: "missing telegram_id" }), { status: 400, headers: { "Content-Type": "application/json" } });
if (body.action === "list_gear") {
        const g = await base44.asServiceRole.entities.MudForgeGear.filter({ id: body.gear_id });
        if (!g || g.length === 0) return new Response(JSON.stringify({ error: "not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
        if (String(g[0].owner_telegram_id) !== tid) return new Response(JSON.stringify({ error: "not owner" }), { status: 403, headers: { "Content-Type": "application/json" } });
        const l = await base44.asServiceRole.entities.MudForgeListing.create({ seller_telegram_id: tid, seller_username: body.username || "", nft_name: g[0].name, nft_image_url: g[0].image_url || "", nft_collection: "MudForge Genesis", nft_item_index: 0, tribe: g[0].tribe || "None", rarity: g[0].rarity || "Common", gear_slot: g[0].gear_slot || "Head", mining_bonus: g[0].mining_bonus || 0, companion_bonus: g[0].companion_bonus || 0, racing_bonus: g[0].racing_bonus || 0, price_mudd: Math.floor(body.price_mudd_ore / 1000), price_mudd_ore: body.price_mudd_ore, status: "active", buyer_telegram_id: "", sold_at: "" });
        await base44.asServiceRole.entities.MudForgeGear.update(body.gear_id, { listed_for_sale: true, listing_id: l.id });
        return new Response(JSON.stringify({ ok: true, listing_id: l.id }), { headers: { "Content-Type": "application/json" } });
      }
      if (body.action === "buy_market") {
        const ls = await base44.asServiceRole.entities.MudForgeListing.filter({ id: body.listing_id });
        if (!ls || ls.length === 0) return new Response(JSON.stringify({ error: "not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
        if (ls[0].status !== "active") return new Response(JSON.stringify({ error: "not active" }), { status: 400, headers: { "Content-Type": "application/json" } });
        if (String(ls[0].seller_telegram_id) === tid) return new Response(JSON.stringify({ error: "can't buy own" }), { status: 400, headers: { "Content-Type": "application/json" } });
        await base44.asServiceRole.entities.MudForgeListing.update(body.listing_id, { status: "sold", buyer_telegram_id: tid, sold_at: new Date().toISOString() });
        const sg = await base44.asServiceRole.entities.MudForgeGear.filter({ listing_id: body.listing_id });
        if (sg && sg.length > 0) await base44.asServiceRole.entities.MudForgeGear.update(sg[0].id, { owner_telegram_id: tid, listed_for_sale: false, listing_id: "", equipped: false });
        return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
      }
      if (body.action === "cancel_listing") {
        const ls = await base44.asServiceRole.entities.MudForgeListing.filter({ id: body.listing_id });
        if (!ls || ls.length === 0) return new Response(JSON.stringify({ error: "not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
        if (String(ls[0].seller_telegram_id) !== tid) return new Response(JSON.stringify({ error: "not owner" }), { status: 403, headers: { "Content-Type": "application/json" } });
        await base44.asServiceRole.entities.MudForgeListing.update(body.listing_id, { status: "cancelled" });
        const g = await base44.asServiceRole.entities.MudForgeGear.filter({ listing_id: body.listing_id });
        if (g && g.length > 0) await base44.asServiceRole.entities.MudForgeGear.update(g[0].id, { listed_for_sale: false, listing_id: "" });
        return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
      }
      if (body.action === "link_wallet") {
        const wa = String(body.wallet_address || "").trim();
        if (!wa) return new Response(JSON.stringify({ ok: false, error: "missing address" }), { headers: { "Content-Type": "application/json" } });
        if (!/^[UE0k]Q[A-Za-z0-9_\-]{46,48}$/.test(wa)) return new Response(JSON.stringify({ ok: false, error: "invalid TON address" }), { headers: { "Content-Type": "application/json" } });
        const ps = await base44.asServiceRole.entities.RingMinePlayer.filter({ telegram_id: tid });
        if (!ps || ps.length === 0) return new Response(JSON.stringify({ ok: false, error: "not found" }), { headers: { "Content-Type": "application/json" } });
        await base44.asServiceRole.entities.RingMinePlayer.update(ps[0].id, { ton_wallet_address: wa });
        return new Response(JSON.stringify({ ok: true, wallet_address: wa }), { headers: { "Content-Type": "application/json" } });
      }
      if (body.action === "get_wallet") {
        const ps = await base44.asServiceRole.entities.RingMinePlayer.filter({ telegram_id: tid });
        if (!ps || ps.length === 0) return new Response(JSON.stringify({ ok: false, error: "not found" }), { headers: { "Content-Type": "application/json" } });
        const p = ps[0]; let so = 0; if (p.state_data) { try { const s = JSON.parse(p.state_data); so = s.ore || 0; } catch { } }
        const to = Math.max(p.mudd_ore_balance || 0, so);
        return new Response(JSON.stringify({ ok: true, wallet_linked: !!(p.ton_wallet_address), wallet_address: p.ton_wallet_address || "", mudd_ore_balance: to, total_withdrawn: p.total_withdrawn || 0, can_withdraw: to >= 1000, min_withdrawal: 1000 }), { headers: { "Content-Type": "application/json" } });
      }
      if (body.action === "withdraw") {
        const wmUrl = new URL(req.url).origin + "/functions/walletManager";
        const wmRes = await fetch(wmUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "withdraw", telegram_id: tid, mudd_ore_amount: body.mudd_ore_amount }) });
        const wmData = await wmRes.json();
        return new Response(JSON.stringify(wmData), { headers: { "Content-Type": "application/json" } });
      }
      if (body.action === "get_history") {
        const ps = await base44.asServiceRole.entities.RingMinePlayer.filter({ telegram_id: tid });
        if (!ps || ps.length === 0) return new Response(JSON.stringify({ ok: false, error: "not found" }), { headers: { "Content-Type": "application/json" } });
        let hist = []; if (ps[0].withdrawal_history) { try { hist = JSON.parse(ps[0].withdrawal_history); } catch { } }
        return new Response(JSON.stringify({ ok: true, total_withdrawn: ps[0].total_withdrawn || 0, history: hist.slice(-20) }), { headers: { "Content-Type": "application/json" } });
      }
      if (body.action === "leaderboard") {
        const players = await base44.asServiceRole.entities.RingMinePlayer.list({ limit: 100, sort: "-growth_xp" });
        const top = (players || []).slice(0, 20).map((p: any, i: number) => ({ rank: i + 1, username: p.username || p.full_name || "Anonymous", xp: p.growth_xp || 0, mudd: p.mudd_balance || 0, bond: p.queen_bond || 0, companion: p.companion || null, glyph: p.glyph_state || "Seed" }));
        return new Response(JSON.stringify({ ok: true, leaderboard: top }), { headers: { "Content-Type": "application/json" } });
      }
      
    return new Response(JSON.stringify({ error: "unknown action" }), { status: 400, headers: { "Content-Type": "application/json" } });
  } catch (e) {
    console.error("ringMineMarket error:", e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
});