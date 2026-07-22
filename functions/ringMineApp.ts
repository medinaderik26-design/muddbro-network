import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const HTML_URL = "https://base44.app/api/apps/6a4020251d35ee93ec909dfa/files/mp/public/6a4020251d35ee93ec909dfa/6cca828ba_ringmine_ui.html";

Deno.serve(async (req: Request) => {
  if (req.method === "POST") {
    try {
      const body = await req.json();
      const base44 = createClientFromRequest(req);
      const tid = String(body.telegram_id || "");
      if (!tid) return new Response(JSON.stringify({ error: "missing telegram_id" }), { status: 400, headers: { "Content-Type": "application/json" } });

      if (body.action === "load") {
        const ex = await base44.asServiceRole.entities.RingMinePlayer.filter({ telegram_id: tid });
        if (ex && ex.length > 0) { let s = null; try { s = ex[0].state_data ? JSON.parse(ex[0].state_data) : null; } catch { } return new Response(JSON.stringify({ found: true, state: s }), { headers: { "Content-Type": "application/json" } }); }
        return new Response(JSON.stringify({ found: false, state: null }), { headers: { "Content-Type": "application/json" } });
      }

      if (body.action === "save") {
        const st = body.state || {};
        const ex = await base44.asServiceRole.entities.RingMinePlayer.filter({ telegram_id: tid });
        const p: any = { telegram_id: tid, username: body.username || "", full_name: body.full_name || "", state_data: JSON.stringify(st), mudd_ore_balance: st.ore || 0, mudd_balance: st.mudd || 0, growth_xp: st.xp || 0, companion_bond: st.bond || 0, streak_days: st.streak || 0, companion: st.companion || null };
        if (ex && ex.length > 0) await base44.asServiceRole.entities.RingMinePlayer.update(ex[0].id, p);
        else await base44.asServiceRole.entities.RingMinePlayer.create(p);
        return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
      }

      if (body.action === "load_glyph") {
        const ps = await base44.asServiceRole.entities.RingMinePlayer.filter({ telegram_id: tid });
        if (!ps || ps.length === 0) return new Response(JSON.stringify({ ok: false, error: "not found" }), { headers: { "Content-Type": "application/json" } });
        const p = ps[0];
        return new Response(JSON.stringify({ ok: true, glyph_state: p.glyph_state || "Seed", glyph_cohesion: p.glyph_cohesion || 0, glyph_seeds: p.glyph_seeds || [], glyph_lineage: p.glyph_lineage || [], resonance_anchors: p.resonance_anchors || [], queen_name: p.queen_name || "", queen_bond: p.queen_bond || 0, growth_xp: p.growth_xp || 0, streak_days: p.streak_days || 0, companion: p.companion || null, mudd_balance: p.mudd_balance || 0, mudd_ore_balance: p.mudd_ore_balance || 0 }), { headers: { "Content-Type": "application/json" } });
      }

      if (body.action === "mine") {
        const ps = await base44.asServiceRole.entities.RingMinePlayer.filter({ telegram_id: tid });
        if (!ps || ps.length === 0) return new Response(JSON.stringify({ ok: false, error: "not found" }), { headers: { "Content-Type": "application/json" } });
        const p = ps[0];
        const baseYield = 5 + Math.floor(Math.random() * 15);
        const gs = p.glyph_state || "Seed";
        let gm = 1.0;
        switch (gs) { case "Glyph": gm = 1.02; break; case "Resonant": gm = 1.05; break; case "Hyperstate": gm = 1.10; break; case "Monument": gm = 1.20; break; }
        let eb = 0;
        try { const eq = await base44.asServiceRole.entities.MudForgeGear.filter({ owner_telegram_id: tid, equipped: true }); for (const g of eq) eb += (g.mining_bonus || 0); } catch { }
        eb = eb / 100;
        const yield_ = Math.floor(baseYield * gm * (1 + eb));
        let ore = p.mudd_ore_balance || 0, sd: any = null;
        if (p.state_data) { try { sd = JSON.parse(p.state_data); ore = Math.max(ore, sd.ore || 0); } catch { } }
        const newOre = ore + yield_;
        const ud: any = { mudd_ore_balance: newOre };
        if (sd) { sd.ore = newOre; ud.state_data = JSON.stringify(sd); }
        await base44.asServiceRole.entities.RingMinePlayer.update(p.id, ud);
        return new Response(JSON.stringify({ ok: true, yield: yield_, base_yield: baseYield, glyph_bonus: Math.round((gm - 1) * 100) + "%", equip_bonus: Math.round(eb * 100) + "%", new_balance: newOre, glyph_state: gs }), { headers: { "Content-Type": "application/json" } });
      }

      if (body.action === "casino_flip") {
        const bet = Math.floor(Number(body.bet) || 0); const choice = String(body.choice || "heads");
        if (bet < 10) return new Response(JSON.stringify({ ok: false, error: "Min bet 10" }), { headers: { "Content-Type": "application/json" } });
        const ps = await base44.asServiceRole.entities.RingMinePlayer.filter({ telegram_id: tid });
        if (!ps || ps.length === 0) return new Response(JSON.stringify({ ok: false, error: "not found" }), { headers: { "Content-Type": "application/json" } });
        const p = ps[0]; let ore = p.mudd_ore_balance || 0, sd: any = null;
        if (p.state_data) { try { sd = JSON.parse(p.state_data); ore = Math.max(ore, sd.ore || 0); } catch { } }
        if (ore < bet) return new Response(JSON.stringify({ ok: false, error: "Need " + bet + " ore (have " + ore + ")" }), { headers: { "Content-Type": "application/json" } });
        const result = Math.random() < 0.5 ? "heads" : "tails"; const won = result === choice;
        const sableBoost = p.companion === "Sable" && won ? Math.floor(bet * 0.1) : 0;
        const payout = won ? bet * 2 + sableBoost : 0; const newOre = ore - bet + payout;
        const ud: any = { mudd_ore_balance: newOre }; if (sd) { sd.ore = newOre; ud.state_data = JSON.stringify(sd); }
        await base44.asServiceRole.entities.RingMinePlayer.update(p.id, ud);
        return new Response(JSON.stringify({ ok: true, won, result, bet, payout, new_balance: newOre, message: won ? "🪙 " + result.toUpperCase() + "! Won " + payout + " ore!" : "🪙 " + result.toUpperCase() + ". Lost " + bet + " ore." }), { headers: { "Content-Type": "application/json" } });
      }

      if (body.action === "casino_slots") {
        const bet = Math.floor(Number(body.bet) || 0);
        if (bet < 20) return new Response(JSON.stringify({ ok: false, error: "Min bet 20" }), { headers: { "Content-Type": "application/json" } });
        const ps = await base44.asServiceRole.entities.RingMinePlayer.filter({ telegram_id: tid });
        if (!ps || ps.length === 0) return new Response(JSON.stringify({ ok: false, error: "not found" }), { headers: { "Content-Type": "application/json" } });
        const p = ps[0]; let ore = p.mudd_ore_balance || 0, sd: any = null;
        if (p.state_data) { try { sd = JSON.parse(p.state_data); ore = Math.max(ore, sd.ore || 0); } catch { } }
        if (ore < bet) return new Response(JSON.stringify({ ok: false, error: "Need " + bet + " ore (have " + ore + ")" }), { headers: { "Content-Type": "application/json" } });
        const syms = ["💎","⛏️","🔥","🌀","👑","💀"];
        const reels = [syms[Math.floor(Math.random()*6)], syms[Math.floor(Math.random()*6)], syms[Math.floor(Math.random()*6)]];
        let payout = 0, msg = "";
        if (reels[0] === reels[1] && reels[1] === reels[2]) { const m: any = { "💎":10,"👑":8,"🔥":6,"🌀":5,"⛏️":4,"💀":3 }; payout = bet * (m[reels[0]] || 3); msg = "🎰 JACKPOT! Three " + reels[0] + "! Won " + payout + " ore!"; }
        else if (reels[0] === reels[1] || reels[1] === reels[2] || reels[0] === reels[2]) { payout = Math.floor(bet * 1.5); msg = "🎰 Two of a kind! Won " + payout + " ore."; }
        else { msg = "🎰 No match. Lost " + bet + " ore."; }
        const sableSlotBoost = p.companion === "Sable" && payout > 0 ? Math.floor(payout * 0.1) : 0;
        const finalPayout = payout + sableSlotBoost;
        const newOre = ore - bet + finalPayout;
        const ud: any = { mudd_ore_balance: newOre }; if (sd) { sd.ore = newOre; ud.state_data = JSON.stringify(sd); }
        await base44.asServiceRole.entities.RingMinePlayer.update(p.id, ud);
        return new Response(JSON.stringify({ ok: true, reels, bet, payout: finalPayout, new_balance: newOre, message: msg }), { headers: { "Content-Type": "application/json" } });
      }

      if (body.action === "load_gear") { const g = await base44.asServiceRole.entities.MudForgeGear.filter({ owner_telegram_id: tid }); return new Response(JSON.stringify({ gear: g || [] }), { headers: { "Content-Type": "application/json" } }); }
      if (body.action === "equip_gear") { await base44.asServiceRole.entities.MudForgeGear.update(body.gear_id, { equipped: body.equipped }); return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } }); }
      if (body.action === "load_market") { const l = await base44.asServiceRole.entities.MudForgeListing.filter({ status: "active" }); return new Response(JSON.stringify({ listings: l || [] }), { headers: { "Content-Type": "application/json" } }); }
      if (body.action === "load_equipped_gear") { const g = await base44.asServiceRole.entities.MudForgeGear.filter({ owner_telegram_id: tid, equipped: true }); return new Response(JSON.stringify({ gear: g || [] }), { headers: { "Content-Type": "application/json" } }); }

      if (body.action === "craft_gear") {
        const ps = await base44.asServiceRole.entities.RingMinePlayer.filter({ telegram_id: tid });
        if (!ps || ps.length === 0) return new Response(JSON.stringify({ ok: false, error: "not found" }), { headers: { "Content-Type": "application/json" } });
        const p = ps[0]; const CC = 200, BR = 0.3;
        let mudd = p.mudd_balance || 0, sd: any = null;
        if (p.state_data) { try { sd = JSON.parse(p.state_data); mudd = Math.max(mudd, sd.mudd || 0); } catch { } }
        if (mudd < CC) return new Response(JSON.stringify({ ok: false, error: "Need " + CC + " MUDD (have " + mudd + ")" }), { headers: { "Content-Type": "application/json" } });
        const tribe = String(body.tribe || "None"); const roll = Math.random() * 100;
        let rar: string, t: number, mn: number, mx: number;
        if (roll < 45) { rar = "Common"; t = 1; mn = 3; mx = 8; } else if (roll < 73) { rar = "Uncommon"; t = 2; mn = 8; mx = 15; } else if (roll < 89) { rar = "Rare"; t = 3; mn = 15; mx = 25; } else if (roll < 96) { rar = "Epic"; t = 4; mn = 25; mx = 38; } else if (roll < 99) { rar = "Legendary"; t = 5; mn = 38; mx = 55; } else { rar = "Mythic"; t = 6; mn = 55; mx = 75; }
        const mi = Math.floor(mn + Math.random() * (mx - mn)), cb = Math.floor(mi * 0.4), rc = Math.floor(mi * 0.3);
        const gn = (tribe !== "None" ? tribe + " " : "") + rar + " Forged Helm";
        const burn = Math.round(CC * BR), nb = mudd - CC, ntb = (p.total_mudd_burned || 0) + burn;
        const ud: any = { mudd_balance: nb, total_mudd_burned: ntb }; if (sd) { sd.mudd = nb; ud.state_data = JSON.stringify(sd); }
        await base44.asServiceRole.entities.RingMinePlayer.update(p.id, ud);
        const gr = await base44.asServiceRole.entities.MudForgeGear.create({ owner_telegram_id: tid, name: gn, image_url: "", tribe, rarity: rar, gear_slot: "Head", mining_bonus: mi, companion_bonus: cb, racing_bonus: rc, tier: t, equipped: false, minted_onchain: false, nft_address: "", listed_for_sale: false, listing_id: "" });
        return new Response(JSON.stringify({ ok: true, gear: { id: gr.id, name: gn, rarity: rar, tribe, mining_bonus: mi, companion_bonus: cb, racing_bonus: rc }, mudd_balance: nb, burned: burn, total_burned: ntb, message: "Forged " + gn + "! Burned " + burn + " MUDD." }), { headers: { "Content-Type": "application/json" } });
      }

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
        // Forward to walletManager for real on-chain MUDD jetton transfer
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

      return new Response(JSON.stringify({ error: "unknown action" }), { status: 400, headers: { "Content-Type": "application/json" } });
    } catch (e) {
      console.error("ringMineApp error:", e);
      return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
  }

  // Serve Mini App HTML
  const selfUrl = new URL(req.url).origin + new URL(req.url).pathname;
  try {
    const resp = await fetch(HTML_URL, { cache: "no-store" });
    if (resp.ok) {
      let html = await resp.text();
      html = html.replace("window.__RINGMINE_API_URL__", JSON.stringify(selfUrl));
      return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache, no-store, must-revalidate" } });
    }
  } catch (e) { console.error("HTML fetch error:", e); }
  return new Response("<h1>Loading Ring Mine...</h1>", { headers: { "Content-Type": "text/html" } });
});
