import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ─── Genesis Catalog: 10 curated helmet NFTs ────────────────────────────────
const CATALOG = [
  { key: "sun-forged-molten-crown", name: "Sun-Forged Molten Crown", index: 1, image: "https://media.base44.com/images/public/6a4020251d35ee93ec909dfa/d38196aa1_image.jpg", tribe: "Sun-Forged", rarity: "Genesis Prime", mining_bonus: 70, companion_bonus: 25, racing_bonus: 12, durability: 100, ability: "Eternal Flame", desc: "A crown of living lava that has never cooled since the world's first forging.", price_mudd: 5000, minted_onchain: true, nft_address: "0QCGwqBbWLOEst04RpjaFD2C3G1QS2uWXkxFJ7xDFwLwYrq8", is_house: true },
  { key: "void-touched-oracle", name: "Void-Touched Oracle", index: 10, image: "https://media.base44.com/images/public/6a4020251d35ee93ec909dfa/dfc70da83_image.jpg", tribe: "Void-Touched", rarity: "Genesis", mining_bonus: 55, companion_bonus: 20, racing_bonus: 8, durability: 96, ability: "Oracle's Gaze", desc: "Sees through the folds of the deep-mine void.", price_mudd: 3500, minted_onchain: false, nft_address: "", is_house: false },
  { key: "void-touched-plasma-core", name: "Void-Touched Plasma Core", index: 9, image: "https://media.base44.com/images/public/6a4020251d35ee93ec909dfa/a107f23c6_image.jpg", tribe: "Void-Touched", rarity: "Mythic", mining_bonus: 45, companion_bonus: 15, racing_bonus: 6, durability: 92, ability: "Plasma Surge", desc: "A shard of raw plasma bound in warped void-metal.", price_mudd: 2500, minted_onchain: false, nft_address: "", is_house: false },
  { key: "hollow-kin-warlord-crown", name: "Hollow-Kin Warlord Crown", index: 8, image: "https://media.base44.com/images/public/6a4020251d35ee93ec909dfa/276023908_image.jpg", tribe: "Hollow-Kin", rarity: "Legendary", mining_bonus: 38, companion_bonus: 12, racing_bonus: 4, durability: 90, ability: "Warlord's Resolve", desc: "Worn by the war-chiefs of the Hollow-Kin in the deepest sieges.", price_mudd: 1500, minted_onchain: false, nft_address: "", is_house: false },
  { key: "frost-bound-wraith", name: "Frost-Bound Wraith Helm", index: 7, image: "https://media.base44.com/images/public/6a4020251d35ee93ec909dfa/eccf94f89_image.jpg", tribe: "Frost-Bound", rarity: "Legendary", mining_bonus: 35, companion_bonus: 10, racing_bonus: 3, durability: 88, ability: "Veil Sight", desc: "Carved from eternal ice, it hums with the whispers of frost-wraiths.", price_mudd: 1500, minted_onchain: false, nft_address: "", is_house: false },
  { key: "frost-bound-seeker", name: "Frost-Bound Seeker", index: 6, image: "https://media.base44.com/images/public/6a4020251d35ee93ec909dfa/2cfd723d6_image.jpg", tribe: "Frost-Bound", rarity: "Epic", mining_bonus: 28, companion_bonus: 6, racing_bonus: 2, durability: 82, ability: "Deep Scan", desc: "Tracks veins hidden beneath the deepest permafrost.", price_mudd: 800, minted_onchain: false, nft_address: "", is_house: false },
  { key: "deepborn-crystal-bloom", name: "Deepborn Crystal Bloom Helm", index: 5, image: "https://media.base44.com/images/public/6a4020251d35ee93ec909dfa/dae32c3f9_image.jpg", tribe: "Deepborn", rarity: "Epic", mining_bonus: 30, companion_bonus: 8, racing_bonus: 0, durability: 75, ability: "Vein Sight", desc: "Crystal shards bloom outward, resonating with buried ore.", price_mudd: 800, minted_onchain: false, nft_address: "", is_house: false },
  { key: "deepborn-prospector-hud", name: "Deepborn Prospector HUD", index: 4, image: "https://media.base44.com/images/public/6a4020251d35ee93ec909dfa/4819aa9fc_image.jpg", tribe: "Deepborn", rarity: "Rare", mining_bonus: 22, companion_bonus: 4, racing_bonus: 0, durability: 68, ability: "Vein Scan", desc: "A prospector's dream — live ore telemetry beamed to the eye.", price_mudd: 400, minted_onchain: false, nft_address: "", is_house: false },
  { key: "hollow-kin-rune-visor", name: "Hollow-Kin Rune Visor", index: 3, image: "https://media.base44.com/images/public/6a4020251d35ee93ec909dfa/9267d333c_image.jpg", tribe: "Hollow-Kin", rarity: "Rare", mining_bonus: 18, companion_bonus: 6, racing_bonus: 3, durability: 65, ability: "Echo Vision", desc: "Runes etched by hollow-kin seers to see through stone.", price_mudd: 400, minted_onchain: false, nft_address: "", is_house: false },
  { key: "bone-singers-ember-helm", name: "Bone-Singer's Ember Helm", index: 2, image: "https://media.base44.com/images/public/6a4020251d35ee93ec909dfa/2bcbd5cc4_image.jpg", tribe: "Hollow-Kin", rarity: "Uncommon", mining_bonus: 12, companion_bonus: 3, racing_bonus: 0, durability: 55, ability: "Bone Song", desc: "Embers glow faintly where the bone-singers hum their old songs.", price_mudd: 150, minted_onchain: false, nft_address: "", is_house: false },
];

const RARITY_COLOR: Record<string, string> = {
  "Genesis Prime": "#ff4444", "Genesis": "#ffd700", "Mythic": "#ff4444",
  "Legendary": "#ffd700", "Epic": "#aa44ff", "Rare": "#4488ff", "Uncommon": "#44ff88", "Common": "#aaaaaa"
};

const COLLECTION_ADDRESS = "kQAid8tfDNbNLLHWDInRbhGK_Rfv_ouRtL7ocitfMv07KJ2b";
const G0_WALLET = "0QAG3lJZz24VOz6eicLTqP5M-YtfKJ96Naq3FPUz548Pcsw8";
const MARKET_FEE_BPS = 500; // 5% platform fee on all marketplace sales
const HOUSE_TELEGRAM_ID = "muddbro_house";

const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, GET, OPTIONS", "Access-Control-Allow-Headers": "Content-Type", "Content-Type": "application/json" };

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  if (req.method === "POST") {
    try {
      const body = await req.json();
      const base44 = createClientFromRequest(req);
      const action = body.action || "";

      if (action === "get_catalog") {
        return new Response(JSON.stringify({ ok: true, catalog: CATALOG, collection_address: COLLECTION_ADDRESS, house_wallet: G0_WALLET }), { headers: corsHeaders });
      }

      const telegramId = String(body.telegram_id || "").trim();
      if (!telegramId) {
        return new Response(JSON.stringify({ ok: false, error: "missing telegram_id" }), { status: 400, headers: corsHeaders });
      }

      if (action === "identify") {
        let players = await base44.asServiceRole.entities.RingMinePlayer.filter({ telegram_id: telegramId });
        let player = players && players.length > 0 ? players[0] : null;
        if (!player) {
          player = await base44.asServiceRole.entities.RingMinePlayer.create({
            telegram_id: telegramId,
            username: body.username || "",
            full_name: body.full_name || "",
            mudd_balance: 0,
            mudd_ore_balance: 0
          });
        }
        return new Response(JSON.stringify({
          ok: true,
          mudd_balance: player.mudd_balance || 0,
          mudd_ore_balance: player.mudd_ore_balance || 0,
          ton_wallet_address: player.ton_wallet_address || ""
        }), { headers: corsHeaders });
      }

      if (action === "link_wallet") {
        const addr = String(body.wallet_address || "").trim();
        if (!/^(UQ|EQ|0Q|kQ)[A-Za-z0-9_-]{46}$/.test(addr)) {
          return new Response(JSON.stringify({ ok: false, error: "invalid TON address format" }), { status: 400, headers: corsHeaders });
        }
        const players = await base44.asServiceRole.entities.RingMinePlayer.filter({ telegram_id: telegramId });
        if (players && players.length > 0) {
          await base44.asServiceRole.entities.RingMinePlayer.update(players[0].id, { ton_wallet_address: addr });
        }
        return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
      }

      if (action === "my_collection") {
        const gear = await base44.asServiceRole.entities.MudForgeGear.filter({ owner_telegram_id: telegramId });
        return new Response(JSON.stringify({ ok: true, gear: gear || [] }), { headers: corsHeaders });
      }

      if (action === "browse_market") {
        const listings = await base44.asServiceRole.entities.MudForgeListing.filter({ status: "active" });
        return new Response(JSON.stringify({ ok: true, listings: listings || [] }), { headers: corsHeaders });
      }

      if (action === "request_mint") {
        const catalogKey = String(body.catalog_key || "");
        const item = CATALOG.find(c => c.key === catalogKey);
        if (!item) return new Response(JSON.stringify({ ok: false, error: "unknown catalog item" }), { status: 404, headers: corsHeaders });
        if (item.is_house) return new Response(JSON.stringify({ ok: false, error: "This Genesis piece is the house's forging proof — not for sale." }), { status: 400, headers: corsHeaders });

        const players = await base44.asServiceRole.entities.RingMinePlayer.filter({ telegram_id: telegramId });
        if (!players || players.length === 0) return new Response(JSON.stringify({ ok: false, error: "player not found — identify first" }), { status: 404, headers: corsHeaders });
        const player = players[0];
        const balance = player.mudd_balance || 0;
        if (balance < item.price_mudd) {
          return new Response(JSON.stringify({ ok: false, error: `not enough MUDD. Need ${item.price_mudd}, have ${balance}` }), { status: 400, headers: corsHeaders });
        }

        // Prevent double-minting same catalog item by same user while pending
        const existing = await base44.asServiceRole.entities.MudForgeGear.filter({ owner_telegram_id: telegramId, catalog_key: catalogKey });
        if (existing && existing.some((g: any) => g.mint_tx_status === "requested" || g.mint_tx_status === "minted")) {
          return new Response(JSON.stringify({ ok: false, error: "you already own or are minting this item" }), { status: 400, headers: corsHeaders });
        }

        await base44.asServiceRole.entities.RingMinePlayer.update(player.id, { mudd_balance: balance - item.price_mudd });

        const gearRec = await base44.asServiceRole.entities.MudForgeGear.create({
          owner_telegram_id: telegramId,
          name: item.name,
          image_url: item.image,
          tribe: item.tribe,
          rarity: item.rarity,
          gear_slot: "Head",
          mining_bonus: item.mining_bonus,
          companion_bonus: item.companion_bonus,
          racing_bonus: item.racing_bonus,
          tier: item.index,
          equipped: false,
          minted_onchain: false,
          nft_address: "",
          listed_for_sale: false,
          listing_id: "",
          catalog_key: catalogKey,
          mint_tx_status: "requested",
          owner_wallet_address: player.ton_wallet_address || ""
        });

        return new Response(JSON.stringify({ ok: true, gear_id: gearRec.id, message: "Mint request queued — your NFT will be forged on-chain shortly." }), { headers: corsHeaders });
      }

      if (action === "list_gear") {
        const gearId = body.gear_id;
        const priceMudd = Number(body.price_mudd || 0);
        const gear = await base44.asServiceRole.entities.MudForgeGear.filter({ id: gearId });
        if (!gear || gear.length === 0) return new Response(JSON.stringify({ ok: false, error: "gear not found" }), { status: 404, headers: corsHeaders });
        const g = gear[0];
        if (String(g.owner_telegram_id) !== telegramId) return new Response(JSON.stringify({ ok: false, error: "not owner" }), { status: 403, headers: corsHeaders });

        const listing = await base44.asServiceRole.entities.MudForgeListing.create({
          seller_telegram_id: telegramId,
          seller_username: body.username || "",
          nft_name: g.name,
          nft_image_url: g.image_url || "",
          nft_collection: "MudForge Genesis",
          nft_item_index: g.tier || 0,
          tribe: g.tribe || "None",
          rarity: g.rarity || "Common",
          gear_slot: g.gear_slot || "Head",
          mining_bonus: g.mining_bonus || 0,
          companion_bonus: g.companion_bonus || 0,
          racing_bonus: g.racing_bonus || 0,
          price_mudd: priceMudd,
          price_mudd_ore: priceMudd * 1000,
          status: "active",
          buyer_telegram_id: "",
          sold_at: "",
          nft_address: g.nft_address || ""
        });
        await base44.asServiceRole.entities.MudForgeGear.update(gearId, { listed_for_sale: true, listing_id: listing.id });
        return new Response(JSON.stringify({ ok: true, listing_id: listing.id }), { headers: corsHeaders });
      }

      if (action === "buy_listing") {
        const listingId = body.listing_id;
        const listings = await base44.asServiceRole.entities.MudForgeListing.filter({ id: listingId });
        if (!listings || listings.length === 0) return new Response(JSON.stringify({ ok: false, error: "listing not found" }), { status: 404, headers: corsHeaders });
        const listing = listings[0];
        if (listing.status !== "active") return new Response(JSON.stringify({ ok: false, error: "listing not active" }), { status: 400, headers: corsHeaders });
        if (String(listing.seller_telegram_id) === telegramId) return new Response(JSON.stringify({ ok: false, error: "cannot buy your own listing" }), { status: 400, headers: corsHeaders });

        const players = await base44.asServiceRole.entities.RingMinePlayer.filter({ telegram_id: telegramId });
        if (!players || players.length === 0) return new Response(JSON.stringify({ ok: false, error: "player not found" }), { status: 404, headers: corsHeaders });
        const player = players[0];
        const balance = player.mudd_balance || 0;
        if (balance < listing.price_mudd) return new Response(JSON.stringify({ ok: false, error: "not enough MUDD" }), { status: 400, headers: corsHeaders });

        await base44.asServiceRole.entities.RingMinePlayer.update(player.id, { mudd_balance: balance - listing.price_mudd });

        // 5% platform fee goes to the MuddBro Forge house treasury, seller gets the rest
        const feeAmount = Math.floor(listing.price_mudd * MARKET_FEE_BPS / 10000);
        const sellerAmount = listing.price_mudd - feeAmount;

        const sellers = await base44.asServiceRole.entities.RingMinePlayer.filter({ telegram_id: listing.seller_telegram_id });
        if (sellers && sellers.length > 0) {
          await base44.asServiceRole.entities.RingMinePlayer.update(sellers[0].id, { mudd_balance: (sellers[0].mudd_balance || 0) + sellerAmount });
        }

        if (feeAmount > 0) {
          const houseAccounts = await base44.asServiceRole.entities.RingMinePlayer.filter({ telegram_id: HOUSE_TELEGRAM_ID });
          if (houseAccounts && houseAccounts.length > 0) {
            await base44.asServiceRole.entities.RingMinePlayer.update(houseAccounts[0].id, { mudd_balance: (houseAccounts[0].mudd_balance || 0) + feeAmount });
          } else {
            await base44.asServiceRole.entities.RingMinePlayer.create({ telegram_id: HOUSE_TELEGRAM_ID, username: "MuddBro Treasury", full_name: "MuddBro Forge House Account", mudd_balance: feeAmount, mudd_ore_balance: 0 });
          }
        }

        await base44.asServiceRole.entities.MudForgeListing.update(listingId, { status: "sold", buyer_telegram_id: telegramId, sold_at: new Date().toISOString() });

        const sellerGear = await base44.asServiceRole.entities.MudForgeGear.filter({ listing_id: listingId });
        if (sellerGear && sellerGear.length > 0) {
          await base44.asServiceRole.entities.MudForgeGear.update(sellerGear[0].id, {
            owner_telegram_id: telegramId,
            listed_for_sale: false,
            listing_id: "",
            equipped: false,
            owner_wallet_address: player.ton_wallet_address || ""
          });
        }
        return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
      }

      if (action === "cancel_listing") {
        const listingId = body.listing_id;
        const listings = await base44.asServiceRole.entities.MudForgeListing.filter({ id: listingId });
        if (!listings || listings.length === 0) return new Response(JSON.stringify({ ok: false, error: "listing not found" }), { status: 404, headers: corsHeaders });
        if (String(listings[0].seller_telegram_id) !== telegramId) return new Response(JSON.stringify({ ok: false, error: "not owner" }), { status: 403, headers: corsHeaders });
        await base44.asServiceRole.entities.MudForgeListing.update(listingId, { status: "cancelled" });
        const gear = await base44.asServiceRole.entities.MudForgeGear.filter({ listing_id: listingId });
        if (gear && gear.length > 0) await base44.asServiceRole.entities.MudForgeGear.update(gear[0].id, { listed_for_sale: false, listing_id: "" });
        return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
      }

      return new Response(JSON.stringify({ ok: false, error: "unknown action" }), { status: 400, headers: corsHeaders });
    } catch (e) {
      console.error("muddbroNftStore API error:", e);
      return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500, headers: corsHeaders });
    }
  }

  // ─── GET: serve the store page ──────────────────────────────────────────
  const html = STORE_HTML;
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
});

const STORE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>MUDDBRO // NFT FORGE</title>
<script src="https://telegram.org/js/telegram-web-app.js"></script>
<style>
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
:root{--cyan:#a0f0ff;--gold:#ffd700;--dark:#05050a;--dark2:#0a0a1a;--text:#e0f0ff;--border:#2a3550;--card:rgba(12,15,28,0.9);--danger:#ff4444}
html,body{width:100%;min-height:100vh;background:var(--dark);color:var(--text);font-family:'Courier New',monospace;overflow-x:hidden}
body{
  background-image:
    radial-gradient(circle at 20% 10%, rgba(160,240,255,0.06) 0%, transparent 45%),
    radial-gradient(circle at 80% 90%, rgba(255,215,0,0.05) 0%, transparent 45%),
    linear-gradient(180deg,var(--dark),var(--dark2));
  min-height:100vh;
}
.grid-overlay{position:fixed;inset:0;pointer-events:none;z-index:0;opacity:0.15;
  background-image:linear-gradient(rgba(160,240,255,0.5) 1px, transparent 1px),linear-gradient(90deg, rgba(160,240,255,0.5) 1px, transparent 1px);
  background-size:40px 40px;mask-image:radial-gradient(circle at 50% 0%, black 0%, transparent 70%);}
.wrap{position:relative;z-index:1;max-width:1100px;margin:0 auto;padding:0 16px 60px;}
.hero{padding:36px 0 20px;text-align:center;}
.hero h1{font-size:clamp(28px,6vw,46px);letter-spacing:6px;color:var(--cyan);text-shadow:0 0 20px rgba(160,240,255,0.5);text-transform:uppercase;}
.hero h1 span{color:var(--gold);text-shadow:0 0 20px rgba(255,215,0,0.5);}
.hero p{margin-top:8px;color:rgba(160,240,255,0.5);font-size:12px;letter-spacing:2px;text-transform:uppercase;}
.identity-bar{display:flex;gap:8px;justify-content:center;align-items:center;margin-top:18px;flex-wrap:wrap;}
.identity-bar input{background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:6px;padding:9px 12px;color:var(--text);font-family:'Courier New',monospace;font-size:12px;width:180px;}
.identity-bar input:focus{outline:none;border-color:var(--cyan);}
.btn{border:1px solid var(--cyan);background:rgba(160,240,255,0.06);color:var(--cyan);padding:9px 18px;border-radius:6px;font-family:'Courier New',monospace;font-size:11px;letter-spacing:1px;text-transform:uppercase;cursor:pointer;transition:all .15s;}
.btn:hover{background:rgba(160,240,255,0.15);box-shadow:0 0 12px rgba(160,240,255,0.3);}
.btn:disabled{opacity:0.3;cursor:default;}
.btn.gold{border-color:var(--gold);color:var(--gold);background:rgba(255,215,0,0.06);}
.btn.gold:hover{background:rgba(255,215,0,0.15);box-shadow:0 0 12px rgba(255,215,0,0.3);}
.btn.danger{border-color:var(--danger);color:var(--danger);}
.status-chip{font-size:11px;color:var(--gold);border:1px solid rgba(255,215,0,0.3);padding:6px 12px;border-radius:20px;background:rgba(255,215,0,0.05);}
.tabs{display:flex;gap:6px;margin:26px 0 20px;overflow-x:auto;padding-bottom:2px;}
.tab{flex:1;min-width:100px;text-align:center;padding:11px 8px;border:1px solid var(--border);border-radius:8px;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:rgba(160,240,255,0.45);cursor:pointer;background:rgba(255,255,255,0.02);white-space:nowrap;}
.tab.on{border-color:var(--cyan);color:var(--cyan);background:rgba(160,240,255,0.08);box-shadow:0 0 10px rgba(160,240,255,0.15);}
.section{display:none;}
.section.on{display:block;animation:fadein .25s ease;}
@keyframes fadein{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px;}
.card{background:var(--card);border:1px solid var(--border);border-radius:14px;overflow:hidden;position:relative;transition:transform .15s, box-shadow .15s;}
.card:hover{transform:translateY(-3px);}
.card .img-wrap{position:relative;aspect-ratio:1;overflow:hidden;background:rgba(255,255,255,0.02);}
.card img{width:100%;height:100%;object-fit:cover;}
.rarity-badge{position:absolute;top:8px;right:8px;font-size:8px;padding:3px 8px;border-radius:10px;text-transform:uppercase;letter-spacing:1px;font-weight:bold;backdrop-filter:blur(4px);}
.onchain-badge{position:absolute;top:8px;left:8px;font-size:8px;padding:3px 8px;border-radius:10px;background:rgba(68,255,136,0.15);color:#44ff88;border:1px solid rgba(68,255,136,0.4);letter-spacing:1px;}
.card-body{padding:12px 14px;}
.card-name{font-size:12px;color:var(--cyan);font-weight:bold;margin-bottom:3px;}
.card-tribe{font-size:9px;color:rgba(160,240,255,0.4);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;}
.card-stats{font-size:9px;color:rgba(224,240,255,0.5);line-height:1.6;margin-bottom:10px;}
.card-stats b{color:var(--gold);}
.card-price{font-size:14px;color:var(--gold);font-weight:bold;margin-bottom:8px;}
.card-desc{font-size:9.5px;color:rgba(160,240,255,0.35);margin-bottom:10px;line-height:1.5;font-style:italic;}
.card .btn{width:100%;}
.explorer-link{display:block;font-size:9px;color:#44ff88;text-decoration:none;text-align:center;margin-top:6px;letter-spacing:1px;}
.explorer-link:hover{text-decoration:underline;}
.empty{text-align:center;padding:50px 20px;color:rgba(160,240,255,0.25);font-size:12px;letter-spacing:1px;}
.toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:rgba(10,10,20,0.97);border:1px solid var(--cyan);border-radius:10px;padding:14px 22px;color:var(--cyan);font-size:12px;z-index:999;max-width:90vw;text-align:center;box-shadow:0 0 20px rgba(160,240,255,0.2);}
.toast.err{border-color:var(--danger);color:var(--danger);}
.market-form{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:14px;margin-bottom:16px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;}
.market-form input{background:rgba(255,255,255,0.04);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-family:'Courier New',monospace;font-size:11px;width:120px;}
.seller-tag{font-size:9px;color:rgba(160,240,255,0.35);margin-bottom:6px;}
.section-title{font-size:13px;color:var(--gold);letter-spacing:2px;text-transform:uppercase;margin-bottom:14px;}
.featured{display:flex;gap:20px;background:var(--card);border:1px solid rgba(255,68,68,0.3);border-radius:16px;padding:20px;margin-bottom:26px;box-shadow:0 0 30px rgba(255,68,68,0.08);flex-wrap:wrap;}
.featured img{width:180px;height:180px;border-radius:12px;object-fit:cover;flex-shrink:0;}
.featured-info{flex:1;min-width:220px;}
.featured-info h2{color:var(--gold);font-size:18px;margin-bottom:6px;letter-spacing:1px;}
.featured-info p{font-size:11px;color:rgba(160,240,255,0.5);margin-bottom:10px;line-height:1.6;}
.spinner{border:2px solid rgba(160,240,255,0.15);border-top-color:var(--cyan);border-radius:50%;width:26px;height:26px;animation:spin 0.8s linear infinite;margin:30px auto;}
@keyframes spin{to{transform:rotate(360deg)}}
</style>
</head>
<body>
<div class="grid-overlay"></div>
<div class="wrap">
  <div class="hero">
    <h1>MUDD<span>BRO</span> FORGE</h1>
    <p>On-Chain Gear · TON Testnet · Genesis Collection</p>
    <div class="identity-bar" id="identityBar"></div>
  </div>

  <div class="tabs">
    <div class="tab on" data-tab="gallery">Gallery</div>
    <div class="tab" data-tab="market">Market</div>
    <div class="tab" data-tab="vault">My Vault</div>
    <div class="tab" data-tab="wallet">Wallet</div>
  </div>

  <div class="section on" id="sec-gallery">
    <div id="featuredWrap"></div>
    <div class="section-title">Genesis Catalog — Mint With MUDD</div>
    <div class="grid" id="catalogGrid"><div class="spinner"></div></div>
  </div>

  <div class="section" id="sec-market">
    <div class="section-title">Player Marketplace</div>
    <div class="grid" id="marketGrid"><div class="empty">Connect your Telegram ID above to browse the market.</div></div>
  </div>

  <div class="section" id="sec-vault">
    <div class="section-title">My Vault</div>
    <div class="grid" id="vaultGrid"><div class="empty">Connect your Telegram ID above to see your collection.</div></div>
  </div>

  <div class="section" id="sec-wallet">
    <div class="section-title">Link TON Wallet</div>
    <div class="market-form">
      <input id="walletInput" placeholder="UQ... / 0Q... / kQ... address">
      <button class="btn gold" onclick="linkWallet()">Link Wallet</button>
    </div>
    <p style="font-size:10px;color:rgba(160,240,255,0.4);line-height:1.6;">Link your TON wallet so future mints and marketplace purchases send NFTs directly to you instead of staying in the custodial vault. Get testnet TON free from <b style="color:var(--gold)">@test_giver_ton_bot</b> on Telegram.</p>
  </div>
</div>

<script>
const API = window.location.href.split('?')[0];
let TG_ID = "";
let TG_USERNAME = "";
let MUDD_BALANCE = 0;
let ORE_BALANCE = 0;

function toast(msg, isErr){
  const t = document.createElement('div');
  t.className = 'toast' + (isErr ? ' err' : '');
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(()=>t.remove(), 3200);
}

async function api(action, payload){
  payload = payload || {};
  payload.action = action;
  payload.telegram_id = TG_ID;
  payload.username = TG_USERNAME;
  const res = await fetch(API, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
  return res.json();
}

function renderIdentityBar(){
  const bar = document.getElementById('identityBar');
  if (TG_ID) {
    bar.innerHTML = '<span class="status-chip">@' + (TG_USERNAME||TG_ID) + ' · ' + MUDD_BALANCE.toLocaleString() + ' MUDD · ' + ORE_BALANCE.toLocaleString() + ' Ore</span> <button class="btn" onclick="disconnect()">Disconnect</button>';
  } else {
    bar.innerHTML = '<input id="idInput" placeholder="Telegram username or ID"><button class="btn gold" onclick="connectManual()">Connect</button>';
  }
}

function disconnect(){ TG_ID=""; TG_USERNAME=""; localStorage.removeItem('muddbro_tid'); localStorage.removeItem('muddbro_uname'); renderIdentityBar(); loadVault(); loadMarket(); }

async function connectManual(){
  const val = document.getElementById('idInput').value.trim();
  if (!val) return toast('Enter your Telegram username or numeric ID', true);
  TG_ID = val.replace('@','');
  TG_USERNAME = val.replace('@','');
  localStorage.setItem('muddbro_tid', TG_ID);
  localStorage.setItem('muddbro_uname', TG_USERNAME);
  await doIdentify();
}

async function doIdentify(){
  const r = await api('identify', {});
  if (r.ok) {
    MUDD_BALANCE = r.mudd_balance || 0;
    ORE_BALANCE = r.mudd_ore_balance || 0;
    if (r.ton_wallet_address) document.getElementById('walletInput').value = r.ton_wallet_address;
    renderIdentityBar();
    loadVault();
    loadMarket();
    toast('Connected as @' + TG_USERNAME);
  } else {
    toast(r.error || 'Failed to connect', true);
  }
}

async function linkWallet(){
  if (!TG_ID) return toast('Connect your Telegram ID first', true);
  const addr = document.getElementById('walletInput').value.trim();
  const r = await api('link_wallet', { wallet_address: addr });
  if (r.ok) toast('Wallet linked! Future mints go straight to your address.');
  else toast(r.error || 'Invalid address', true);
}

const RARITY_COLORS = {"Genesis Prime":"#ff4444","Genesis":"#ffd700","Mythic":"#ff4444","Legendary":"#ffd700","Epic":"#aa44ff","Rare":"#4488ff","Uncommon":"#44ff88","Common":"#aaaaaa"};

function rarityBadge(rarity){
  const c = RARITY_COLORS[rarity] || '#aaaaaa';
  return '<div class="rarity-badge" style="background:'+c+'22;color:'+c+';border:1px solid '+c+'66">'+rarity+'</div>';
}

let CATALOG = [];
async function loadCatalog(){
  const r = await api('get_catalog', {});
  if (!r.ok) return;
  CATALOG = r.catalog;
  const featured = CATALOG.find(c => c.is_house);
  if (featured) {
    document.getElementById('featuredWrap').innerHTML =
      '<div class="featured"><img src="'+featured.image+'"><div class="featured-info">' +
      '<h2>⚡ GENESIS MINT — LIVE ON-CHAIN</h2>' +
      '<p>'+featured.desc+'</p>' +
      '<div class="card-stats">Mining <b>+'+featured.mining_bonus+'</b> · Companion <b>+'+featured.companion_bonus+'</b> · Racing <b>+'+featured.racing_bonus+'</b> · Ability: <b>'+featured.ability+'</b></div>' +
      '<a class="explorer-link" style="text-align:left" target="_blank" href="https://testnet.tonscan.org/address/'+featured.nft_address+'">View on TON Explorer →</a>' +
      '</div></div>';
  }
  const grid = document.getElementById('catalogGrid');
  const sellable = CATALOG.filter(c => !c.is_house);
  grid.innerHTML = sellable.map(c => {
    return '<div class="card">' +
      '<div class="img-wrap"><img src="'+c.image+'">' + rarityBadge(c.rarity) + '</div>' +
      '<div class="card-body">' +
        '<div class="card-name">'+c.name+'</div>' +
        '<div class="card-tribe">'+c.tribe+' Tribe</div>' +
        '<div class="card-desc">'+c.desc+'</div>' +
        '<div class="card-stats">Mining <b>+'+c.mining_bonus+'</b> · Companion <b>+'+c.companion_bonus+'</b> · Racing <b>+'+c.racing_bonus+'</b><br>Ability: <b>'+c.ability+'</b></div>' +
        '<div class="card-price">'+c.price_mudd.toLocaleString()+' MUDD</div>' +
        '<button class="btn gold" onclick="mintItem(\\''+c.key+'\\')">Mint NFT</button>' +
      '</div></div>';
  }).join('');
}

async function mintItem(key){
  if (!TG_ID) return toast('Connect your Telegram ID first', true);
  const r = await api('request_mint', { catalog_key: key });
  if (r.ok) {
    toast(r.message || 'Mint requested!');
    await doIdentify();
    loadVault();
  } else {
    toast(r.error || 'Mint failed', true);
  }
}

async function loadMarket(){
  const grid = document.getElementById('marketGrid');
  const r = await api('browse_market', {});
  if (!r.ok || !r.listings || r.listings.length === 0) {
    grid.innerHTML = '<div class="empty">No active listings yet. Be the first to list gear from your Vault!</div>';
    return;
  }
  grid.innerHTML = r.listings.map(l => {
    const mine = String(l.seller_telegram_id) === TG_ID;
    return '<div class="card">' +
      '<div class="img-wrap"><img src="'+(l.nft_image_url||'')+'">' + rarityBadge(l.rarity) + (l.nft_address ? '<div class="onchain-badge">ON-CHAIN</div>' : '') + '</div>' +
      '<div class="card-body">' +
        '<div class="card-name">'+l.nft_name+'</div>' +
        '<div class="seller-tag">seller: @'+(l.seller_username||l.seller_telegram_id)+'</div>' +
        '<div class="card-stats">Mining <b>+'+l.mining_bonus+'</b> · Companion <b>+'+l.companion_bonus+'</b> · Racing <b>+'+l.racing_bonus+'</b></div>' +
        '<div class="card-price">'+(l.price_mudd||0).toLocaleString()+' MUDD</div>' +
        '<div style="font-size:8px;color:rgba(160,240,255,0.3);margin-bottom:6px">5% platform fee included</div>' +
        (mine ? '<button class="btn danger" onclick="cancelListing(\\''+l.id+'\\')">Cancel Listing</button>' : '<button class="btn gold" onclick="buyListing(\\''+l.id+'\\')">Buy Now</button>') +
      '</div></div>';
  }).join('');
}

async function buyListing(id){
  if (!TG_ID) return toast('Connect your Telegram ID first', true);
  const r = await api('buy_listing', { listing_id: id });
  if (r.ok) { toast('Purchased!'); await doIdentify(); loadMarket(); loadVault(); }
  else toast(r.error || 'Purchase failed', true);
}

async function cancelListing(id){
  const r = await api('cancel_listing', { listing_id: id });
  if (r.ok) { toast('Listing cancelled'); loadMarket(); loadVault(); }
  else toast(r.error || 'Cancel failed', true);
}

async function loadVault(){
  const grid = document.getElementById('vaultGrid');
  if (!TG_ID) { grid.innerHTML = '<div class="empty">Connect your Telegram ID above to see your collection.</div>'; return; }
  const r = await api('my_collection', {});
  if (!r.ok || !r.gear || r.gear.length === 0) {
    grid.innerHTML = '<div class="empty">Your vault is empty. Mint something from the Gallery!</div>';
    return;
  }
  grid.innerHTML = r.gear.map(g => {
    const statusTag = g.mint_tx_status === 'requested' ? '<div class="onchain-badge" style="background:rgba(255,215,0,0.15);color:var(--gold);border-color:rgba(255,215,0,0.4)">FORGING...</div>'
      : (g.minted_onchain ? '<div class="onchain-badge">ON-CHAIN</div>' : '');
    return '<div class="card">' +
      '<div class="img-wrap"><img src="'+(g.image_url||'')+'">' + rarityBadge(g.rarity) + statusTag + '</div>' +
      '<div class="card-body">' +
        '<div class="card-name">'+g.name+'</div>' +
        '<div class="card-tribe">'+g.tribe+' Tribe</div>' +
        '<div class="card-stats">Mining <b>+'+g.mining_bonus+'</b> · Companion <b>+'+g.companion_bonus+'</b> · Racing <b>+'+g.racing_bonus+'</b></div>' +
        (g.nft_address ? '<a class="explorer-link" target="_blank" href="https://testnet.tonscan.org/address/'+g.nft_address+'">View on Explorer →</a>' : '') +
        (g.listed_for_sale ? '<button class="btn" disabled>Listed For Sale</button>' : '<button class="btn" onclick="promptList(\\''+g.id+'\\')">List For Sale</button>') +
      '</div></div>';
  }).join('');
}

async function promptList(gearId){
  const price = prompt('List price in MUDD (5% platform fee applies — you receive 95%):');
  if (!price || isNaN(Number(price))) return;
  const r = await api('list_gear', { gear_id: gearId, price_mudd: Number(price) });
  if (r.ok) { toast('Listed on the market!'); loadVault(); loadMarket(); }
  else toast(r.error || 'Listing failed', true);
}

document.querySelectorAll('.tab').forEach(t => {
  t.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(x=>x.classList.remove('on'));
    document.querySelectorAll('.section').forEach(x=>x.classList.remove('on'));
    t.classList.add('on');
    document.getElementById('sec-'+t.dataset.tab).classList.add('on');
    if (t.dataset.tab === 'market') loadMarket();
    if (t.dataset.tab === 'vault') loadVault();
  });
});

(function init(){
  try {
    const tg = window.Telegram && window.Telegram.WebApp;
    if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
      tg.ready();
      TG_ID = String(tg.initDataUnsafe.user.id);
      TG_USERNAME = tg.initDataUnsafe.user.username || tg.initDataUnsafe.user.first_name || TG_ID;
    }
  } catch(e){}
  if (!TG_ID) {
    TG_ID = localStorage.getItem('muddbro_tid') || "";
    TG_USERNAME = localStorage.getItem('muddbro_uname') || "";
  }
  renderIdentityBar();
  loadCatalog();
  if (TG_ID) doIdentify();
})();
</script>
</body>
</html>`;
