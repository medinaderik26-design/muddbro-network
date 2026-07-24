import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
const HTML_URL = "https://base44.app/api/apps/6a4020251d35ee93ec909dfa/files/mp/public/6a4020251d35ee93ec909dfa/f36e2e863_ringmine_ui_v5.html";
Deno.serve(async (req: Request) => {
  if (req.method === "POST") {
    try {
      const body = await req.json();
      const base44 = createClientFromRequest(req);
      const tid = String(body.telegram_id || "");
      if (!tid) return new Response(JSON.stringify({ error: "missing telegram_id" }), { status: 400, headers: { "Content-Type": "application/json" } });
      if (body.action === "load") {
        const ex = await base44.asServiceRole.entities.RingMinePlayer.filter({ telegram_id: tid });
        if (ex && ex.length > 0) {
          const p = ex[0];
          let sd: any = null;
          try { sd = p.state_data ? (typeof p.state_data === "string" ? JSON.parse(p.state_data) : p.state_data) : null; } catch {}
          const ore = Math.max(p.mudd_ore_balance || 0, sd?.ore || 0);
          const mudd = Math.max(p.mudd_balance || 0, sd?.mudd || 0);
          return new Response(JSON.stringify({ ok: true, player: {
            telegram_id: p.telegram_id, username: p.username || "", full_name: p.full_name || "",
            mudd_ore_balance: ore, mudd_balance: mudd,
            growth_xp: p.growth_xp || 0, companion: p.companion || null,
            companion_bond: p.companion_bond || 0, queen_name: p.queen_name || "",
            queen_bond: p.queen_bond || 0, streak_days: p.streak_days || 0,
            glyph_state: p.glyph_state || "Seed", ton_wallet_address: p.ton_wallet_address || "",
            total_withdrawn: p.total_withdrawn || 0, total_mudd_burned: p.total_mudd_burned || 0,
            state_data: sd
          }}), { headers: { "Content-Type": "application/json" } });
        }
        return new Response(JSON.stringify({ ok:false, player:null }), { headers: { "Content-Type": "application/json" } });
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
        const compBonus = p.companion === "Kaelith" ? 0.15 : 0;
        const yield_ = Math.floor(baseYield * gm * (1 + eb + compBonus));
        let ore = p.mudd_ore_balance || 0, sd: any = null;
        if (p.state_data) { try { sd = typeof p.state_data === "string" ? JSON.parse(p.state_data) : p.state_data; ore = Math.max(ore, sd.ore || 0); } catch { } }
        const newOre = ore + yield_;
        const ud: any = { mudd_ore_balance: newOre };
        if (sd) { sd.ore = newOre; ud.state_data = JSON.stringify(sd); }
        await base44.asServiceRole.entities.RingMinePlayer.update(p.id, ud);
        return new Response(JSON.stringify({ ok: true, yield: yield_, base_yield: baseYield, glyph_bonus: Math.round((gm-1)*100)+"%", companion: p.companion || null, new_balance: newOre, glyph_state: gs }), { headers: { "Content-Type": "application/json" } });
      }
      if (body.action === "casino_flip") {
        const bet = Math.floor(Number(body.bet) || 0), choice = String(body.choice || "heads");
        if (bet < 10) return new Response(JSON.stringify({ ok: false, error: "Min bet 10" }), { headers: { "Content-Type": "application/json" } });
        const ps = await base44.asServiceRole.entities.RingMinePlayer.filter({ telegram_id: tid });
        if (!ps?.length) return new Response(JSON.stringify({ ok: false, error: "not found" }), { headers: { "Content-Type": "application/json" } });
        const p = ps[0]; let ore = p.mudd_ore_balance || 0, sd: any = null;
        if (p.state_data) { try { sd = typeof p.state_data === "string" ? JSON.parse(p.state_data) : p.state_data; ore = Math.max(ore, sd.ore || 0); } catch {} }
        if (ore < bet) return new Response(JSON.stringify({ ok: false, error: "Need " + bet + " ore" }), { headers: { "Content-Type": "application/json" } });
        const result = Math.random() < 0.5 ? "heads" : "tails", won = result === choice;
        const sb = p.companion === "Sable" && won ? Math.floor(bet * 0.1) : 0;
        const payout = won ? bet * 2 + sb : 0, newOre = ore - bet + payout;
        const ud: any = { mudd_ore_balance: newOre }; if (sd) { sd.ore = newOre; ud.state_data = JSON.stringify(sd); }
        await base44.asServiceRole.entities.RingMinePlayer.update(p.id, ud);
        return new Response(JSON.stringify({ ok: true, won, result, bet, payout, sable_bonus: sb, new_balance: newOre, message: won ? "🪙 " + result.toUpperCase() + "! +" + payout : "🪙 " + result.toUpperCase() + ". -" + bet }), { headers: { "Content-Type": "application/json" } });
      }
      if (body.action === "casino_slots") {
        const bet = Math.floor(Number(body.bet) || 0);
        if (bet < 20) return new Response(JSON.stringify({ ok: false, error: "Min bet 20" }), { headers: { "Content-Type": "application/json" } });
        const ps = await base44.asServiceRole.entities.RingMinePlayer.filter({ telegram_id: tid });
        if (!ps?.length) return new Response(JSON.stringify({ ok: false, error: "not found" }), { headers: { "Content-Type": "application/json" } });
        const p = ps[0]; let ore = p.mudd_ore_balance || 0, sd: any = null;
        if (p.state_data) { try { sd = typeof p.state_data === "string" ? JSON.parse(p.state_data) : p.state_data; ore = Math.max(ore, sd.ore || 0); } catch {} }
        if (ore < bet) return new Response(JSON.stringify({ ok: false, error: "Need " + bet + " ore" }), { headers: { "Content-Type": "application/json" } });
        const S = ["💎","⛏️","🔥","🌀","👑","💀"];
        const r = [S[Math.floor(Math.random()*6)],S[Math.floor(Math.random()*6)],S[Math.floor(Math.random()*6)]];
        let payout = 0, msg = "";
        if (r[0]===r[1]&&r[1]===r[2]) { const m:any={"💎":10,"👑":8,"🔥":6,"🌀":5,"⛏️":4,"💀":3}; payout = bet*(m[r[0]]||3); msg = "🎰 JACKPOT! 3x "+r[0]+"! +"+payout; }
        else if (r[0]===r[1]||r[1]===r[2]||r[0]===r[2]) { payout = Math.floor(bet*1.5); msg = "🎰 Pair! +"+payout; }
        else { msg = "🎰 No match. -"+bet; }
        const sb = p.companion === "Sable" && payout > 0 ? Math.floor(payout * 0.1) : 0;
        const fp = payout + sb, newOre = ore - bet + fp;
        const ud: any = { mudd_ore_balance: newOre }; if (sd) { sd.ore = newOre; ud.state_data = JSON.stringify(sd); }
        await base44.asServiceRole.entities.RingMinePlayer.update(p.id, ud);
        return new Response(JSON.stringify({ ok: true, symbols: r, bet, payout: fp, sable_bonus: sb, new_balance: newOre, message: msg }), { headers: { "Content-Type": "application/json" } });
      }
      if (body.action === "casino_dice") {
        const bet = Math.floor(Number(body.bet) || 0); const target = Math.floor(Number(body.target) || 50);
        if (bet < 10) return new Response(JSON.stringify({ ok: false, error: "Min bet 10" }), { headers: { "Content-Type": "application/json" } });
        if (target < 2 || target > 98) return new Response(JSON.stringify({ ok: false, error: "Target 2-98" }), { headers: { "Content-Type": "application/json" } });
        const ps = await base44.asServiceRole.entities.RingMinePlayer.filter({ telegram_id: tid });
        if (!ps?.length) return new Response(JSON.stringify({ ok: false, error: "not found" }), { headers: { "Content-Type": "application/json" } });
        const p = ps[0]; let ore = p.mudd_ore_balance || 0, sd: any = null;
        if (p.state_data) { try { sd = typeof p.state_data === "string" ? JSON.parse(p.state_data) : p.state_data; ore = Math.max(ore, sd.ore || 0); } catch {} }
        if (ore < bet) return new Response(JSON.stringify({ ok: false, error: "Need " + bet + " ore" }), { headers: { "Content-Type": "application/json" } });
        const roll = Math.floor(Math.random() * 100) + 1, won = roll < target;
        const mult = 99 / (target - 1), payout = won ? Math.floor(bet * mult) : 0;
        const sb = p.companion === "Sable" && won ? Math.floor(payout * 0.1) : 0;
        const fp = payout + sb, newOre = ore - bet + fp;
        const ud: any = { mudd_ore_balance: newOre }; if (sd) { sd.ore = newOre; ud.state_data = JSON.stringify(sd); }
        await base44.asServiceRole.entities.RingMinePlayer.update(p.id, ud);
        return new Response(JSON.stringify({ ok: true, roll, target, won, multiplier: mult.toFixed(2), bet, payout: fp, sable_bonus: sb, new_balance: newOre, message: won ? "🎲 " + roll + " < " + target + "! Won " + fp + " ore!" : "🎲 " + roll + " >= " + target + ". Lost " + bet + " ore." }), { headers: { "Content-Type": "application/json" } });
      }
      if (body.action === "casino_crash") {
        const bet = Math.floor(Number(body.bet)||0), target = Number(body.target)||2;
        if (bet < 20) return new Response(JSON.stringify({ok:false,error:"Min bet 20"}),{headers:{"Content-Type":"application/json"}});
        if (target < 1.3 || target > 50) return new Response(JSON.stringify({ok:false,error:"Target 1.3x-50x"}),{headers:{"Content-Type":"application/json"}});
        const ps = await base44.asServiceRole.entities.RingMinePlayer.filter({telegram_id:tid});
        if(!ps?.length) return new Response(JSON.stringify({ok:false,error:"not found"}),{headers:{"Content-Type":"application/json"}});
        const p=ps[0]; let ore=p.mudd_ore_balance||0, sd:any=null;
        if(p.state_data){try{sd=typeof p.state_data==="string"?JSON.parse(p.state_data):p.state_data;ore=Math.max(ore,sd.ore||0);}catch{}}
        if(ore<bet) return new Response(JSON.stringify({ok:false,error:"Need "+bet+" ore"}),{headers:{"Content-Type":"application/json"}});
        const crash=Math.min(50,Math.max(1,0.97/(1-Math.random())));
        const won=crash>=target, payout=won?Math.floor(bet*target):0;
        const sb=p.companion==="Sable"&&won?Math.floor((payout-bet)*0.1):0;
        const fp=payout+sb, newOre=ore-bet+fp;
        const ud:any={mudd_ore_balance:newOre}; if(sd){sd.ore=newOre;ud.state_data=JSON.stringify(sd);}
        await base44.asServiceRole.entities.RingMinePlayer.update(p.id,ud);
        return new Response(JSON.stringify({ok:true,crash:crash.toFixed(2),target,won,bet,payout:fp,sable_bonus:sb,new_balance:newOre,message:won?"💎 "+crash.toFixed(2)+"x! Cashed at "+target+"x. +"+fp:"💥 "+crash.toFixed(2)+"x < "+target+"x. -"+bet}),{headers:{"Content-Type":"application/json"}});
      }
      if (body.action === "casino_hunt") {
        const bet = Math.floor(Number(body.bet)||0), picks = Math.floor(Number(body.picks)||1);
        if (bet < 20) return new Response(JSON.stringify({ok:false,error:"Min bet 20"}),{headers:{"Content-Type":"application/json"}});
        if (picks < 1 || picks > 4) return new Response(JSON.stringify({ok:false,error:"Pick 1-4"}),{headers:{"Content-Type":"application/json"}});
        const ps = await base44.asServiceRole.entities.RingMinePlayer.filter({telegram_id:tid});
        if(!ps?.length) return new Response(JSON.stringify({ok:false,error:"not found"}),{headers:{"Content-Type":"application/json"}});
        const p=ps[0]; let ore=p.mudd_ore_balance||0, sd:any=null;
        if(p.state_data){try{sd=typeof p.state_data==="string"?JSON.parse(p.state_data):p.state_data;ore=Math.max(ore,sd.ore||0);}catch{}}
        if(ore<bet) return new Response(JSON.stringify({ok:false,error:"Need "+bet+" ore"}),{headers:{"Content-Type":"application/json"}});
        const trap=Math.floor(Math.random()*5);
        const chosen:number[]=[]; while(chosen.length<picks){const t=Math.floor(Math.random()*5); if(!chosen.includes(t))chosen.push(t);}
        const hit=chosen.includes(trap);
        const probs:Record<number,number>={1:0.8,2:0.6,3:0.4,4:0.2};
        const mult=Math.floor((1/(probs[picks]||0.8))*0.95*100)/100;
        const payout=hit?0:Math.floor(bet*mult);
        const sb=p.companion==="Sable"&&!hit?Math.floor((payout-bet)*0.1):0;
        const fp=payout+sb, newOre=ore-bet+fp;
        const ud:any={mudd_ore_balance:newOre}; if(sd){sd.ore=newOre;ud.state_data=JSON.stringify(sd);}
        await base44.asServiceRole.entities.RingMinePlayer.update(p.id,ud);
        return new Response(JSON.stringify({ok:true,results:chosen.map((t:number)=>({tile:t,safe:t!==trap})),hit_trap:hit,trap_tile:trap,multiplier:mult,bet,payout:fp,sable_bonus:sb,new_balance:newOre,message:hit?"💀 Trap at chest "+(trap+1)+"! -"+bet:"💎 "+picks+" safe at "+mult+"x! +"+fp}),{headers:{"Content-Type":"application/json"}});
      }
      if (body.action === "load_gear") { const g = await base44.asServiceRole.entities.MudForgeGear.filter({ owner_telegram_id: tid }); return new Response(JSON.stringify({ ok: true, gear: g || [] }), { headers: { "Content-Type": "application/json" } }); }
      if (body.action === "equip_gear") { await base44.asServiceRole.entities.MudForgeGear.update(body.gear_id, { equipped: body.equipped }); return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } }); }
      if (body.action === "load_market") { const l = await base44.asServiceRole.entities.MudForgeListing.filter({ status: "active" }); return new Response(JSON.stringify({ ok: true, listings: l || [] }), { headers: { "Content-Type": "application/json" } }); }
      if (body.action === "craft_gear" || body.action === "forge") {
        const ps = await base44.asServiceRole.entities.RingMinePlayer.filter({ telegram_id: tid });
        if (!ps || ps.length === 0) return new Response(JSON.stringify({ ok: false, error: "not found" }), { headers: { "Content-Type": "application/json" } });
        const p = ps[0]; const CC = 200, BR = 0.3;
        let mudd = p.mudd_balance || 0, sd: any = null;
        if (p.state_data) { try { sd = typeof p.state_data === "string" ? JSON.parse(p.state_data) : p.state_data; mudd = Math.max(mudd, sd.mudd || 0); } catch { } }
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
      
      // Forward market/wallet/leaderboard to ringMineMarket
      const forwardActions = ["list_gear", "buy_market", "cancel_listing", "link_wallet", "get_wallet", "withdraw", "get_history", "leaderboard", "passport_load", "passport_save", "convert_ore", "sync_companion", "get_images"];
      if (forwardActions.includes(body.action)) {
        const mUrl=new URL(req.url).origin+"/functions/ringMineMarket";
        const mRes = await fetch(mUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        const mData = await mRes.json();
        return new Response(JSON.stringify(mData), { headers: { "Content-Type": "application/json" } });
      }
      return new Response(JSON.stringify({ error: "unknown action" }), { status: 400, headers: { "Content-Type": "application/json" } });
    } catch (e) {
      console.error("ringMineApp error:", e);
      return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
  }
  // Serve HTML
  const selfUrl = new URL(req.url).origin + new URL(req.url).pathname;
  if (HTML_URL) {
    try {
      const resp = await fetch(HTML_URL, { cache: "no-store" });
      if (resp.ok) {
        let html = await resp.text();
        html = html.replace("window.__RINGMINE_API_URL__", JSON.stringify(selfUrl));
        return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache, no-store, must-revalidate" } });
      }
    } catch (e) { console.error("HTML fetch error:", e); }
  }
  return new Response("<h1>Ring Mine Mini App</h1><p>POST to interact. HTML not configured.</p>", { headers: { "Content-Type": "text/html" } });
});
