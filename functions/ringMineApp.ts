import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req: Request) => {
  // ── API: load/save player state via RingMinePlayer entity ──────────────
  if (req.method === "POST") {
    try {
      const body = await req.json();
      const base44 = createClientFromRequest(req);
      const telegramId = String(body.telegram_id || "");
      if (!telegramId) {
        return new Response(JSON.stringify({ error: "missing telegram_id" }), { status: 400, headers: { "Content-Type": "application/json" } });
      }

      if (body.action === "load") {
        const existing = await base44.asServiceRole.entities.RingMinePlayer.filter({ telegram_id: telegramId });
        if (existing && existing.length > 0) {
          const p = existing[0];
          let state = null;
          try { state = p.state_data ? JSON.parse(p.state_data) : null; } catch (e) { state = null; }
          return new Response(JSON.stringify({ found: true, state }), { headers: { "Content-Type": "application/json" } });
        }
        return new Response(JSON.stringify({ found: false, state: null }), { headers: { "Content-Type": "application/json" } });
      }

      if (body.action === "save") {
        const state = body.state || {};
        const existing = await base44.asServiceRole.entities.RingMinePlayer.filter({ telegram_id: telegramId });
        const payload: any = {
          telegram_id: telegramId,
          username: body.username || "",
          full_name: body.full_name || "",
          state_data: JSON.stringify(state),
          mudd_ore_balance: state.ore || 0,
          mudd_balance: state.mudd || 0,
          growth_xp: state.xp || 0,
          companion_bond: state.bond || 0,
          streak_days: state.streak || 0,
          companion: state.companion || null
        };
        if (existing && existing.length > 0) {
          await base44.asServiceRole.entities.RingMinePlayer.update(existing[0].id, payload);
        } else {
          await base44.asServiceRole.entities.RingMinePlayer.create(payload);
        }
        return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
      }

      
      // ── MUDFORGE API ──
      if (body.action === "load_gear") {
        const gear = await base44.asServiceRole.entities.MudForgeGear.filter({ owner_telegram_id: telegramId });
        return new Response(JSON.stringify({ gear: gear || [] }), { headers: { "Content-Type": "application/json" } });
      }

      if (body.action === "buy_gear") {
        const item = body.item;
        const gearRec = await base44.asServiceRole.entities.MudForgeGear.create({
          owner_telegram_id: telegramId,
          name: item.name,
          image_url: item.image_url || "",
          tribe: item.tribe || "None",
          rarity: item.rarity || "Common",
          gear_slot: item.gear_slot || "Head",
          mining_bonus: item.mining_bonus || 0,
          companion_bonus: item.companion_bonus || 0,
          racing_bonus: item.racing_bonus || 0,
          tier: item.tier || 1,
          equipped: false,
          minted_onchain: false,
          nft_address: "",
          listed_for_sale: false,
          listing_id: ""
        });
        return new Response(JSON.stringify({ ok: true, gear_id: gearRec.id }), { headers: { "Content-Type": "application/json" } });
      }

      if (body.action === "equip_gear") {
        const gearId = body.gear_id;
        const equipped = body.equipped;
        await base44.asServiceRole.entities.MudForgeGear.update(gearId, { equipped });
        return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
      }

      if (body.action === "load_market") {
        const listings = await base44.asServiceRole.entities.MudForgeListing.filter({ status: "active" });
        return new Response(JSON.stringify({ listings: listings || [] }), { headers: { "Content-Type": "application/json" } });
      }

      if (body.action === "list_gear") {
        const gearId = body.gear_id;
        const priceMuddOre = body.price_mudd_ore;
        const gear = await base44.asServiceRole.entities.MudForgeGear.filter({ id: gearId });
        if (!gear || gear.length === 0) {
          return new Response(JSON.stringify({ error: "gear not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
        }
        const g = gear[0];
        if (String(g.owner_telegram_id) !== telegramId) {
          return new Response(JSON.stringify({ error: "not owner" }), { status: 403, headers: { "Content-Type": "application/json" } });
        }
        const listing = await base44.asServiceRole.entities.MudForgeListing.create({
          seller_telegram_id: telegramId,
          seller_username: body.username || "",
          nft_name: g.name,
          nft_image_url: g.image_url || "",
          nft_collection: "MudForge Genesis",
          nft_item_index: 0,
          tribe: g.tribe || "None",
          rarity: g.rarity || "Common",
          gear_slot: g.gear_slot || "Head",
          mining_bonus: g.mining_bonus || 0,
          companion_bonus: g.companion_bonus || 0,
          racing_bonus: g.racing_bonus || 0,
          price_mudd: Math.floor(priceMuddOre / 1000),
          price_mudd_ore: priceMuddOre,
          status: "active",
          buyer_telegram_id: "",
          sold_at: ""
        });
        await base44.asServiceRole.entities.MudForgeGear.update(gearId, { listed_for_sale: true, listing_id: listing.id });
        return new Response(JSON.stringify({ ok: true, listing_id: listing.id }), { headers: { "Content-Type": "application/json" } });
      }

      if (body.action === "buy_market") {
        const listingId = body.listing_id;
        const listings = await base44.asServiceRole.entities.MudForgeListing.filter({ id: listingId });
        if (!listings || listings.length === 0) {
          return new Response(JSON.stringify({ error: "listing not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
        }
        const listing = listings[0];
        if (listing.status !== "active") {
          return new Response(JSON.stringify({ error: "listing not active" }), { status: 400, headers: { "Content-Type": "application/json" } });
        }
        if (String(listing.seller_telegram_id) === telegramId) {
          return new Response(JSON.stringify({ error: "cannot buy own listing" }), { status: 400, headers: { "Content-Type": "application/json" } });
        }
        // Update listing
        await base44.asServiceRole.entities.MudForgeListing.update(listingId, {
          status: "sold",
          buyer_telegram_id: telegramId,
          sold_at: new Date().toISOString()
        });
        // Transfer gear to buyer
        const sellerGear = await base44.asServiceRole.entities.MudForgeGear.filter({ listing_id: listingId });
        if (sellerGear && sellerGear.length > 0) {
          await base44.asServiceRole.entities.MudForgeGear.update(sellerGear[0].id, {
            owner_telegram_id: telegramId,
            listed_for_sale: false,
            listing_id: "",
            equipped: false
          });
        }
        return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
      }

      if (body.action === "cancel_listing") {
        const listingId = body.listing_id;
        const listings = await base44.asServiceRole.entities.MudForgeListing.filter({ id: listingId });
        if (!listings || listings.length === 0) {
          return new Response(JSON.stringify({ error: "listing not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
        }
        if (String(listings[0].seller_telegram_id) !== telegramId) {
          return new Response(JSON.stringify({ error: "not owner" }), { status: 403, headers: { "Content-Type": "application/json" } });
        }
        await base44.asServiceRole.entities.MudForgeListing.update(listingId, { status: "cancelled" });
        const gear = await base44.asServiceRole.entities.MudForgeGear.filter({ listing_id: listingId });
        if (gear && gear.length > 0) {
          await base44.asServiceRole.entities.MudForgeGear.update(gear[0].id, { listed_for_sale: false, listing_id: "" });
        }
        return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
      }

      // ── WALLET API ──
      if (body.action === "link_wallet") {
        const walletAddress = String(body.wallet_address || "").trim();
        if (!walletAddress) {
          return new Response(JSON.stringify({ ok: false, error: "Missing wallet_address" }), { headers: { "Content-Type": "application/json" } });
        }
        const validAddress = /^[UE0]Q[A-Za-z0-9_\-]{46,48}$/.test(walletAddress);
        if (!validAddress) {
          return new Response(JSON.stringify({ ok: false, error: "Invalid TON address" }), { headers: { "Content-Type": "application/json" } });
        }
        const players = await base44.asServiceRole.entities.RingMinePlayer.filter({ telegram_id: telegramId });
        if (!players || players.length === 0) {
          return new Response(JSON.stringify({ ok: false, error: "Player not found" }), { headers: { "Content-Type": "application/json" } });
        }
        await base44.asServiceRole.entities.RingMinePlayer.update(players[0].id, { ton_wallet_address: walletAddress });
        if (players[0].state_data) {
          try { const st = JSON.parse(players[0].state_data); st.tonWallet = walletAddress; await base44.asServiceRole.entities.RingMinePlayer.update(players[0].id, { state_data: JSON.stringify(st) }); } catch(e){}
        }
        return new Response(JSON.stringify({ ok: true, wallet_address: walletAddress }), { headers: { "Content-Type": "application/json" } });
      }

      if (body.action === "get_wallet") {
        const players = await base44.asServiceRole.entities.RingMinePlayer.filter({ telegram_id: telegramId });
        if (!players || players.length === 0) {
          return new Response(JSON.stringify({ ok: false, error: "Player not found" }), { headers: { "Content-Type": "application/json" } });
        }
        const p = players[0];
        let stateOre = 0;
        if (p.state_data) { try { const st = JSON.parse(p.state_data); stateOre = st.ore || 0; } catch(e){} }
        const totalOre = Math.max(p.mudd_ore_balance || 0, stateOre);
        return new Response(JSON.stringify({
          ok: true, wallet_linked: !!(p.ton_wallet_address), wallet_address: p.ton_wallet_address || "",
          mudd_ore_balance: totalOre, total_withdrawn: p.total_withdrawn || 0,
          can_withdraw: totalOre >= 1000, min_withdrawal: 1000
        }), { headers: { "Content-Type": "application/json" } });
      }

      if (body.action === "withdraw") {
        const oreAmount = Number(body.mudd_ore_amount || 0);
        if (oreAmount < 1000) {
          return new Response(JSON.stringify({ ok: false, error: "Minimum withdrawal is 1000 MuddOre" }), { headers: { "Content-Type": "application/json" } });
        }
        const players = await base44.asServiceRole.entities.RingMinePlayer.filter({ telegram_id: telegramId });
        if (!players || players.length === 0) {
          return new Response(JSON.stringify({ ok: false, error: "Player not found" }), { headers: { "Content-Type": "application/json" } });
        }
        const p = players[0];
        const walletAddress = p.ton_wallet_address || "";
        if (!walletAddress) {
          return new Response(JSON.stringify({ ok: false, error: "No wallet linked" }), { headers: { "Content-Type": "application/json" } });
        }
        let currentOre = p.mudd_ore_balance || 0;
        let stateData = null;
        if (p.state_data) { try { stateData = JSON.parse(p.state_data); currentOre = Math.max(currentOre, stateData.ore || 0); } catch(e){} }
        if (currentOre < oreAmount) {
          return new Response(JSON.stringify({ ok: false, error: "Insufficient MuddOre: have " + currentOre + ", need " + oreAmount }), { headers: { "Content-Type": "application/json" } });
        }
        const muddAmount = Math.floor(oreAmount / 1000);
        const remainingOre = currentOre - oreAmount;
        const leftoverOre = oreAmount % 1000;
        let history = [];
        if (p.withdrawal_history) { try { history = JSON.parse(p.withdrawal_history); } catch(e){} }
        history.push({ date: new Date().toISOString(), mudd_ore_amount: oreAmount, mudd_sent: muddAmount, wallet: walletAddress, status: "pending" });
        if (history.length > 50) history = history.slice(-50);
        const updateData = { mudd_ore_balance: remainingOre + leftoverOre, total_withdrawn: (p.total_withdrawn || 0) + muddAmount, withdrawal_history: JSON.stringify(history) };
        if (stateData) { stateData.ore = remainingOre + leftoverOre; updateData.state_data = JSON.stringify(stateData); }
        await base44.asServiceRole.entities.RingMinePlayer.update(p.id, updateData);
        return new Response(JSON.stringify({ ok: true, mudd_sent: muddAmount, remaining_ore: remainingOre + leftoverOre, wallet: walletAddress, status: "pending" }), { headers: { "Content-Type": "application/json" } });
      }

      if (body.action === "get_history") {
        const players = await base44.asServiceRole.entities.RingMinePlayer.filter({ telegram_id: telegramId });
        if (!players || players.length === 0) { return new Response(JSON.stringify({ ok: false, error: "not found" }), { headers: { "Content-Type": "application/json" } }); }
        const p = players[0];
        let history = [];
        if (p.withdrawal_history) { try { history = JSON.parse(p.withdrawal_history); } catch(e){} }
        return new Response(JSON.stringify({ ok: true, total_withdrawn: p.total_withdrawn || 0, history: history.slice(-20) }), { headers: { "Content-Type": "application/json" } });
      }

      if (body.action === "load_equipped_gear") {
        const gear = await base44.asServiceRole.entities.MudForgeGear.filter({ owner_telegram_id: telegramId, equipped: true });
        return new Response(JSON.stringify({ gear: gear || [] }), { headers: { "Content-Type": "application/json" } });
      }

      return new Response(JSON.stringify({ error: "unknown action" }), { status: 400, headers: { "Content-Type": "application/json" } });
    } catch (e) {
      console.error("ringMineApp API error:", e);
      return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
  }

  const html = await fetchHTML();
  // Inject the API URL so frontend knows where to send POST requests
  const selfUrl = new URL(req.url).origin + new URL(req.url).pathname;
  const injectedHtml = html.replace("window.__RINGMINE_API_URL__", JSON.stringify(selfUrl));
  return new Response(injectedHtml, {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache, no-store, must-revalidate", "Pragma": "no-cache", "Expires": "0" }
  });
});

async function fetchHTML() {
  try {
    const resp = await fetch("https://base44.app/api/apps/6a4020251d35ee93ec909dfa/files/mp/public/6a4020251d35ee93ec909dfa/e7adfa5b7_ringmine_game.html", { cache: "no-store" });
    if (resp.ok) return await resp.text();
  } catch(e) {}
  return "<h1>Loading Ring Mine...</h1><p>If this persists, please restart the bot.</p>";
}
