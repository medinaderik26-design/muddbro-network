import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const COMPANION_IMAGES: Record<string, string> = {
  Sable: "https://base44.app/api/apps/6a4020251d35ee93ec909dfa/files/mp/public/6a4020251d35ee93ec909dfa/462a39c02_sable.jpg",
  Kaelith: "https://base44.app/api/apps/6a4020251d35ee93ec909dfa/files/mp/public/6a4020251d35ee93ec909dfa/4a7d2af71_kaelith.jpg",
  Vespera: "https://base44.app/api/apps/6a4020251d35ee93ec909dfa/files/mp/public/6a4020251d35ee93ec909dfa/def4188d6_vespera.jpg",
  Lirien: "https://base44.app/api/apps/6a4020251d35ee93ec909dfa/files/mp/public/6a4020251d35ee93ec909dfa/507d8e351_lirien.jpg",
  Thorne: "https://base44.app/api/apps/6a4020251d35ee93ec909dfa/files/mp/public/6a4020251d35ee93ec909dfa/7fec8feb4_thorne.jpg",
};

const REALM_IMAGES: Record<string, string> = {
  "Ancient Earth": "https://base44.app/api/apps/6a4020251d35ee93ec909dfa/files/mp/public/6a4020251d35ee93ec909dfa/d53e61a19_root-weavers.jpg",
  "Bone Singers": "https://base44.app/api/apps/6a4020251d35ee93ec909dfa/files/mp/public/6a4020251d35ee93ec909dfa/ac3b406c7_bone-singers.jpg",
  "Glimmer Children": "https://base44.app/api/apps/6a4020251d35ee93ec909dfa/files/mp/public/6a4020251d35ee93ec909dfa/96b6cceae_glimmer-children.jpg",
  "Hollow Kin": "https://base44.app/api/apps/6a4020251d35ee93ec909dfa/files/mp/public/6a4020251d35ee93ec909dfa/62233c5bb_hollow-kin.jpg",
  "Storm Kin": "https://base44.app/api/apps/6a4020251d35ee93ec909dfa/files/mp/public/6a4020251d35ee93ec909dfa/4418d8d51_storm-kin.jpg",
  "Deep Crystal Hollows": "https://base44.app/api/apps/6a4020251d35ee93ec909dfa/files/mp/public/6a4020251d35ee93ec909dfa/de637772a_deep-crystal-hollows.jpg",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, GET, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } });
  if (req.method === "GET") return new Response(JSON.stringify({ ok: true, service: "Inner Earth Bridge", companion_images: COMPANION_IMAGES, realm_images: REALM_IMAGES }), { headers: { "Content-Type": "application/json" } });
  try {
    const body = await req.json();
    const base44 = createClientFromRequest(req);
    const tid = String(body.telegram_id || "");
    if (!tid) return new Response(JSON.stringify({ error: "missing telegram_id" }), { status: 400, headers: { "Content-Type": "application/json" } });

    // PASSPORT LOAD: Get unified player data across both games
    if (body.action === "passport_load") {
      const ps = await base44.asServiceRole.entities.RingMinePlayer.filter({ telegram_id: tid });
      if (!ps || ps.length === 0) return new Response(JSON.stringify({ ok: false, error: "not found", message: "Start Ring Mine first to create your passport" }), { headers: { "Content-Type": "application/json" } });
      const p = ps[0];
      let ieState: any = null;
      if (p.state_data) { try { const s = JSON.parse(p.state_data); ieState = s.inner_earth || null; } catch {} }
      return new Response(JSON.stringify({
        ok: true,
        passport: {
          telegram_id: tid,
          username: p.username || "",
          full_name: p.full_name || "",
          queen_name: p.queen_name || "",
          queen_bond: p.queen_bond || 0,
          companion: p.companion || null,
          companion_bond: p.companion_bond || 0,
          companion_image: p.companion ? COMPANION_IMAGES[p.companion] : null,
          glyph_state: p.glyph_state || "Seed",
          glyph_cohesion: p.glyph_cohesion || 0,
          growth_xp: p.growth_xp || 0,
          streak_days: p.streak_days || 0,
          mudd_balance: p.mudd_balance || 0,
          mudd_ore_balance: p.mudd_ore_balance || 0,
          total_mudd_burned: p.total_mudd_burned || 0,
          total_withdrawn: p.total_withdrawn || 0,
          ton_wallet_address: p.ton_wallet_address || "",
          inner_earth: ieState,
        }
      }), { headers: { "Content-Type": "application/json" } });
    }

    // PASSPORT SAVE: Inner Earth saves its state into RingMinePlayer
    if (body.action === "passport_save") {
      const ps = await base44.asServiceRole.entities.RingMinePlayer.filter({ telegram_id: tid });
      if (!ps || ps.length === 0) return new Response(JSON.stringify({ ok: false, error: "not found" }), { headers: { "Content-Type": "application/json" } });
      const p = ps[0];
      let sd: any = {};
      if (p.state_data) { try { sd = JSON.parse(p.state_data); } catch {} }
      sd.inner_earth = body.inner_earth || sd.inner_earth || {};
      // Sync MuddOre earned in Inner Earth back to the unified balance
      if (body.mudd_ore_delta !== undefined) {
        const delta = Number(body.mudd_ore_delta) || 0;
        const currentOre = Math.max(p.mudd_ore_balance || 0, sd.ore || 0);
        sd.ore = Math.max(0, currentOre + delta);
        await base44.asServiceRole.entities.RingMinePlayer.update(p.id, { mudd_ore_balance: sd.ore, state_data: JSON.stringify(sd) });
      } else {
        await base44.asServiceRole.entities.RingMinePlayer.update(p.id, { state_data: JSON.stringify(sd) });
      }
      return new Response(JSON.stringify({ ok: true, mudd_ore_balance: sd.ore || 0 }), { headers: { "Content-Type": "application/json" } });
    }

    // ECONOMY TRANSFER: Convert MuddOre to MUDD (1000:1) from Inner Earth
    if (body.action === "convert_ore") {
      const oreAmount = Math.floor(Number(body.mudd_ore_amount) || 0);
      if (oreAmount < 1000) return new Response(JSON.stringify({ ok: false, error: "Min 1000 MuddOre to convert (1000:1 ratio)" }), { headers: { "Content-Type": "application/json" } });
      const ps = await base44.asServiceRole.entities.RingMinePlayer.filter({ telegram_id: tid });
      if (!ps || ps.length === 0) return new Response(JSON.stringify({ ok: false, error: "not found" }), { headers: { "Content-Type": "application/json" } });
      const p = ps[0];
      let sd: any = {};
      if (p.state_data) { try { sd = JSON.parse(p.state_data); } catch {} }
      const currentOre = Math.max(p.mudd_ore_balance || 0, sd.ore || 0);
      if (currentOre < oreAmount) return new Response(JSON.stringify({ ok: false, error: "Need " + oreAmount + " ore (have " + currentOre + ")" }), { headers: { "Content-Type": "application/json" } });
      const muddEarned = Math.floor(oreAmount / 1000);
      const oreSpent = muddEarned * 1000;
      const newOre = currentOre - oreSpent;
      const newMudd = (p.mudd_balance || 0) + muddEarned;
      sd.ore = newOre; sd.mudd = newMudd;
      await base44.asServiceRole.entities.RingMinePlayer.update(p.id, { mudd_ore_balance: newOre, mudd_balance: newMudd, state_data: JSON.stringify(sd) });
      return new Response(JSON.stringify({ ok: true, mudd_earned: muddEarned, new_mudd_balance: newMudd, new_ore_balance: newOre, message: "Converted " + oreSpent + " MuddOre → " + muddEarned + " MUDD" }), { headers: { "Content-Type": "application/json" } });
    }

    // SYNC COMPANION: Pull companion from Ring Mine into Inner Earth
    if (body.action === "sync_companion") {
      const ps = await base44.asServiceRole.entities.RingMinePlayer.filter({ telegram_id: tid });
      if (!ps || ps.length === 0) return new Response(JSON.stringify({ ok: false, error: "not found" }), { headers: { "Content-Type": "application/json" } });
      const p = ps[0];
      const companion = p.companion || null;
      if (!companion) return new Response(JSON.stringify({ ok: false, error: "No companion selected in Ring Mine" }), { headers: { "Content-Type": "application/json" } });
      return new Response(JSON.stringify({
        ok: true,
        companion,
        companion_bond: p.companion_bond || 0,
        companion_image: COMPANION_IMAGES[companion] || null,
        glyph_state: p.glyph_state || "Seed",
        mudd_ore_balance: Math.max(p.mudd_ore_balance || 0, (() => { try { return JSON.parse(p.state_data || "{}").ore || 0; } catch { return 0; })()),
      }), { headers: { "Content-Type": "application/json" } });
    }

    // GET IMAGES: Return all companion/realm image URLs
    if (body.action === "get_images") {
      return new Response(JSON.stringify({ ok: true, companions: COMPANION_IMAGES, realms: REALM_IMAGES }), { headers: { "Content-Type": "application/json" } });
    }

    // LEADERBOARD: Shared leaderboard across both games
    if (body.action === "leaderboard") {
      const players = await base44.asServiceRole.entities.RingMinePlayer.list({ limit: 100, sort: "-growth_xp" });
      const top = (players || []).slice(0, 20).map((p: any, i: number) => ({
        rank: i + 1, username: p.username || p.full_name || "Anonymous",
        xp: p.growth_xp || 0, mudd: p.mudd_balance || 0, bond: p.queen_bond || 0,
        companion: p.companion || null, companion_image: p.companion ? COMPANION_IMAGES[p.companion] : null,
        glyph: p.glyph_state || "Seed", streak: p.streak_days || 0,
      }));
      return new Response(JSON.stringify({ ok: true, leaderboard: top }), { headers: { "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "unknown action" }), { status: 400, headers: { "Content-Type": "application/json" } });
  } catch (e) {
    console.error("innerEarthBridge error:", e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
});
