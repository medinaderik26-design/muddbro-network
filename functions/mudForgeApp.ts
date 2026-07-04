import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req: Request) => {
  // ── API: MudForge marketplace CRUD ──────────────────────────────────────
  if (req.method === "POST") {
    try {
      const body = await req.json();
      const base44 = createClientFromRequest(req);
      const telegramId = String(body.telegram_id || "");
      if (!telegramId) {
        return new Response(JSON.stringify({ error: "missing telegram_id" }), { status: 400, headers: { "Content-Type": "application/json" } });
      }

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
        await base44.asServiceRole.entities.MudForgeGear.update(body.gear_id, { equipped: body.equipped });
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
        await base44.asServiceRole.entities.MudForgeListing.update(listingId, {
          status: "sold",
          buyer_telegram_id: telegramId,
          sold_at: new Date().toISOString()
        });
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

      if (body.action === "load_player") {
        const existing = await base44.asServiceRole.entities.RingMinePlayer.filter({ telegram_id: telegramId });
        if (existing && existing.length > 0) {
          let state = null;
          try { state = existing[0].state_data ? JSON.parse(existing[0].state_data) : null; } catch (e) { state = null; }
          return new Response(JSON.stringify({ found: true, ore: state ? state.ore : 0, mudd: state ? state.mudd : 0 }), { headers: { "Content-Type": "application/json" } });
        }
        return new Response(JSON.stringify({ found: false, ore: 0, mudd: 0 }), { headers: { "Content-Type": "application/json" } });
      }

      return new Response(JSON.stringify({ error: "unknown action" }), { status: 400, headers: { "Content-Type": "application/json" } });
    } catch (e) {
      console.error("mudForgeApp API error:", e);
      return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>MudForge</title>
<script src="https://telegram.org/js/telegram-web-app.js"></script>
<style>
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:rgba(0,0,0,0)}
:root{--cyan:#a0f0ff;--gold:#ffd700;--dark:#0a0a0f;--dark2:#1a0a2e;--text:#e0f0ff;--border:#445577;--card:rgba(15,18,35,0.95)}
html,body{width:100%;min-height:100vh;background:var(--dark);color:var(--text);font-family:'Courier New',monospace;display:flex;flex-direction:column;overflow-x:hidden}
body{background-image:radial-gradient(circle at 50% 50%,rgba(100,200,255,0.08) 0%,transparent 70%),linear-gradient(180deg,var(--dark),var(--dark2))}
.topbar{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:rgba(10,10,15,0.95);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:100}
.topbar .title{font-size:16px;font-weight:bold;color:var(--cyan);letter-spacing:2px;text-transform:uppercase}
.topbar .balance{font-size:12px;color:var(--gold)}
.fg-tabs{display:flex;gap:4px;padding:10px;position:sticky;top:43px;z-index:99;background:rgba(10,10,15,0.95)}
.fg-tab{flex:1;padding:10px 4px;background:rgba(255,255,255,0.04);border:1px solid var(--border);border-radius:8px;color:rgba(160,240,255,0.4);font-size:10px;text-transform:uppercase;text-align:center;font-family:'Courier New',monospace;cursor:pointer;-webkit-appearance:none}
.fg-tab.on{background:rgba(160,240,255,0.1);border-color:var(--cyan);color:var(--cyan)}
.fg-scroll{flex:1;padding:12px;overflow-y:auto;-webkit-overflow-scrolling:touch}
.fg-section{display:none}
.fg-section.on{display:block}
.fg-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
.fg-card{background:var(--card);border:1px solid var(--border);border-radius:10px;padding:10px;text-align:center;position:relative}
.fg-card.rare{border-color:#4488ff;box-shadow:0 0 8px rgba(68,136,255,0.2)}
.fg-card.epic{border-color:#aa44ff;box-shadow:0 0 8px rgba(170,68,255,0.2)}
.fg-card.legendary{border-color:var(--gold);box-shadow:0 0 10px rgba(255,215,0,0.3)}
.fg-card.mythic{border-color:#ff4444;box-shadow:0 0 12px rgba(255,68,68,0.4)}
.fg-card img{width:100%;border-radius:8px;margin-bottom:6px;aspect-ratio:1;object-fit:cover;background:rgba(255,255,255,0.02)}
.fg-card .fg-name{font-size:11px;color:var(--cyan);font-weight:bold;margin-bottom:2px}
.fg-card .fg-tribe{font-size:8px;color:rgba(160,240,255,0.3);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px}
.fg-card .fg-stats{font-size:8px;color:rgba(224,240,255,0.4);line-height:1.5;margin-bottom:6px}
.fg-rarity{position:absolute;top:6px;right:6px;font-size:7px;padding:2px 6px;border-radius:8px;text-transform:uppercase;letter-spacing:1px}
.fg-rarity.Common{background:rgba(255,255,255,0.1);color:#aaa}
.fg-rarity.Rare{background:rgba(68,136,255,0.2);color:#4488ff}
.fg-rarity.Epic{background:rgba(170,68,255,0.2);color:#aa44ff}
.fg-rarity.Legendary{background:rgba(255,215,0,0.15);color:var(--gold)}
.fg-rarity.Mythic{background:rgba(255,68,68,0.2);color:#ff4444}
.fg-btn{width:100%;padding:8px;border:1px solid var(--cyan);border-radius:8px;background:transparent;color:var(--cyan);font-size:10px;font-weight:bold;font-family:'Courier New',monospace;cursor:pointer;-webkit-appearance:none;touch-action:manipulation}
.fg-btn:active{background:rgba(160,240,255,0.1)}
.fg-btn:disabled{opacity:0.3;cursor:default}
.fg-btn.sell{border-color:var(--gold);color:var(--gold)}
.fg-btn.equipped{border-color:#44ff44;color:#44ff44}
.fg-price{font-size:13px;color:var(--gold);font-weight:bold;margin-bottom:4px}
.fg-empty{text-align:center;padding:40px 20px;color:rgba(160,240,255,0.2);font-size:11px}
.fg-seller{font-size:8px;color:rgba(160,240,255,0.3);margin-bottom:4px}
.fg-list-form{background:var(--card);border:1px solid var(--border);border-radius:10px;padding:12px;margin-bottom:10px}
.fg-list-form input{width:100%;padding:8px;background:rgba(255,255,255,0.04);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:12px;font-family:'Courier New',monospace;margin-bottom:8px}
.fg-list-form input:focus{border-color:var(--cyan);outline:none}
.fg-loading{text-align:center;padding:30px;color:rgba(160,240,255,0.3);font-size:11px}
.fg-toast{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:rgba(10,10,15,0.95);border:1px solid var(--cyan);border-radius:10px;padding:12px 20px;color:var(--cyan);font-size:11px;z-index:999;animation:toastIn 0.3s ease}
@keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(20px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
</style>
</head>
<body>

<div class="topbar">
  <div class="title">MudForge</div>
  <div class="balance" id="ore-display">MuddOre: 0</div>
</div>

<div class="fg-tabs">
  <button class="fg-tab on" data-fgtab="shop">Shop</button>
  <button class="fg-tab" data-fgtab="mygear">My Gear</button>
  <button class="fg-tab" data-fgtab="market">Market</button>
</div>

<div class="fg-scroll">
  <div id="fg-shop" class="fg-section on">
    <div id="fg-shop-grid" class="fg-grid"><div class="fg-loading">Loading forge...</div></div>
  </div>
  <div id="fg-mygear" class="fg-section">
    <div id="fg-mygear-grid" class="fg-grid"><div class="fg-empty">Loading your gear...</div></div>
  </div>
  <div id="fg-market" class="fg-section">
    <div id="fg-market-grid" class="fg-grid"><div class="fg-loading">Loading marketplace...</div></div>
  </div>
</div>

<script>
var API_URL = window.location.href;
var telegramId = null, tgUsername = "";
var playerOre = 0;
var playerGear = [];
var marketListings = [];

var FORGE_GEAR = [
  {id:"starter_helm",name:"Rune Tactician Helm",tribe:"Starter",rarity:"Common",slot:"Head",tier:1,mining:5,companion:0,racing:0,cost:100,
   img:"https://base44.app/api/apps/6a4020251d35ee93ec909dfa/files/mp/public/6a4020251d35ee93ec909dfa/23b3e5f4c_image-96.jpg"},
  {id:"hollowkin_helm",name:"Hollow Veil Helm",tribe:"Hollow-Kin",rarity:"Rare",slot:"Head",tier:2,mining:10,companion:3,racing:0,cost:500,
   img:"https://base44.app/api/apps/6a4020251d35ee93ec909dfa/files/mp/public/6a4020251d35ee93ec909dfa/6ddc0306f_image-68.jpg"},
  {id:"rootweaver_helm",name:"Crystal Root Helm",tribe:"Root-Weavers",rarity:"Rare",slot:"Head",tier:2,mining:12,companion:2,racing:2,cost:500,
   img:"https://base44.app/api/apps/6a4020251d35ee93ec909dfa/files/mp/public/6a4020251d35ee93ec909dfa/6ef5a7bd3_image-70.jpg"},
  {id:"bonesinger_helm",name:"Bone-Singer Helm",tribe:"Bone-Singers",rarity:"Rare",slot:"Head",tier:2,mining:8,companion:5,racing:0,cost:500,
   img:"https://base44.app/api/apps/6a4020251d35ee93ec909dfa/files/mp/public/6a4020251d35ee93ec909dfa/b028d285f_image-67.jpg"},
  {id:"stormkin_mask",name:"Plasma Storm Mask",tribe:"Storm-Kin",rarity:"Epic",slot:"Head",tier:3,mining:20,companion:5,racing:5,cost:2000,
   img:"https://base44.app/api/apps/6a4020251d35ee93ec909dfa/files/mp/public/6a4020251d35ee93ec909dfa/caaf486c2_image-64.jpg"},
  {id:"glimmer_visor",name:"Glimmer HUD Visor",tribe:"Glimmer-Children",rarity:"Epic",slot:"Head",tier:3,mining:25,companion:3,racing:3,cost:2000,
   img:"https://base44.app/api/apps/6a4020251d35ee93ec909dfa/files/mp/public/6a4020251d35ee93ec909dfa/987e25690_image-78.jpg"},
  {id:"silver_spiked",name:"Silver Crystal Helm",tribe:"None",rarity:"Legendary",slot:"Head",tier:4,mining:35,companion:10,racing:5,cost:10000,
   img:"https://base44.app/api/apps/6a4020251d35ee93ec909dfa/files/mp/public/6a4020251d35ee93ec909dfa/495e318cb_image-165.jpg"},
  {id:"queens_mask",name:"Queen Obsidian Mask",tribe:"Queen Protocol",rarity:"Mythic",slot:"Head",tier:5,mining:50,companion:20,racing:10,cost:50000,
   img:"https://base44.app/api/apps/6a4020251d35ee93ec909dfa/files/mp/public/6a4020251d35ee93ec909dfa/aa874fd62_image-150.jpg"}
];

function apiCall(data) {
  return fetch(API_URL, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(data)
  }).then(function(r){return r.json();});
}

function toast(msg) {
  var t = document.createElement("div");
  t.className = "fg-toast";
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(function(){ t.remove(); }, 2500);
}

function forgeTab(tab) {
  document.querySelectorAll(".fg-tab").forEach(function(t){t.classList.remove("on")});
  document.querySelectorAll(".fg-section").forEach(function(s){s.classList.remove("on")});
  document.querySelector("[data-fgtab=" + tab + "]").classList.add("on");
  document.getElementById("fg-" + tab).classList.add("on");
  if(tab === "mygear") loadMyGear();
  if(tab === "market") loadMarket();
}

function updateOreDisplay() {
  document.getElementById("ore-display").textContent = "MuddOre: " + playerOre;
}

function renderShop() {
  var grid = document.getElementById("fg-shop-grid");
  grid.innerHTML = "";
  FORGE_GEAR.forEach(function(g) {
    var card = document.createElement("div");
    card.className = "fg-card " + g.rarity.toLowerCase();
    var stats = "";
    if(g.mining) stats += "+" + g.mining + "% Mining<br>";
    if(g.companion) stats += "+" + g.companion + "% Companion<br>";
    if(g.racing) stats += "+" + g.racing + "% Racing<br>";
    card.innerHTML = '<div class="fg-rarity ' + g.rarity + '">' + g.rarity + '</div>' +
      '<img src="' + g.img + '">' +
      '<div class="fg-name">' + g.name + '</div>' +
      '<div class="fg-tribe">' + g.tribe + '</div>' +
      '<div class="fg-stats">' + stats + '</div>' +
      '<div class="fg-price">' + g.cost + ' MuddOre</div>' +
      '<button class="fg-btn" data-buy-gear="' + g.id + '" ' + (playerOre < g.cost ? "disabled" : "") + '>Buy and Mint NFT</button>';
    grid.appendChild(card);
  });
}

function buyForgeGear(gearId) {
  var g = FORGE_GEAR.find(function(x){return x.id === gearId});
  if(!g || playerOre < g.cost) return;
  apiCall({
    action: "buy_gear", telegram_id: telegramId,
    item: {name: g.name, image_url: g.img, tribe: g.tribe, rarity: g.rarity, gear_slot: g.slot, tier: g.tier, mining_bonus: g.mining, companion_bonus: g.companion, racing_bonus: g.racing}
  }).then(function(d) {
    if(d.ok) {
      toast(g.name + " acquired! NFT minted.");
      playerOre -= g.cost;
      updateOreDisplay();
      renderShop();
    } else {
      toast("Failed to mint NFT");
    }
  });
}

function loadMyGear() {
  apiCall({action: "load_gear", telegram_id: telegramId}).then(function(d) {
    playerGear = d.gear || [];
    renderMyGear();
  });
}

function renderMyGear() {
  var grid = document.getElementById("fg-mygear-grid");
  if(playerGear.length === 0) {
    grid.innerHTML = '<div class="fg-empty">No gear yet. Visit the Shop to mint your first NFT.</div>';
    return;
  }
  grid.innerHTML = "";
  playerGear.forEach(function(g) {
    var card = document.createElement("div");
    card.className = "fg-card " + (g.rarity || "common").toLowerCase();
    var stats = "";
    if(g.mining_bonus) stats += "+" + g.mining_bonus + "% Mining<br>";
    if(g.companion_bonus) stats += "+" + g.companion_bonus + "% Companion<br>";
    if(g.racing_bonus) stats += "+" + g.racing_bonus + "% Racing<br>";
    var eqBtn = g.equipped ?
      '<button class="fg-btn equipped" data-equip-gear="' + g.id + '" data-equipped="true">Equipped</button>' :
      '<button class="fg-btn" data-equip-gear="' + g.id + '" data-equipped="false">Equip</button>';
    var sellBtn = g.listed_for_sale ?
      '<button class="fg-btn" disabled>Listed for Sale</button>' :
      '<button class="fg-btn sell" data-sell-gear="' + g.id + '" data-gear-name="' + (g.name || "").replace(/"/g, "") + '">List for Sale</button>';
    var imgHtml = g.image_url ? '<img src="' + g.image_url + '">' : '';
    card.innerHTML = '<div class="fg-rarity ' + (g.rarity || "Common") + '">' + (g.rarity || "Common") + '</div>' +
      imgHtml + '<div class="fg-name">' + (g.name || "Unknown") + '</div>' +
      '<div class="fg-tribe">' + (g.tribe || "None") + '</div>' +
      '<div class="fg-stats">' + stats + '</div>' + eqBtn + sellBtn;
    grid.appendChild(card);
  });
}

function toggleEquipGear(gearId, equipped) {
  apiCall({action: "equip_gear", telegram_id: telegramId, gear_id: gearId, equipped: equipped}).then(function(d) {
    playerGear.forEach(function(g){ if(g.id === gearId) g.equipped = equipped; });
    renderMyGear();
    toast(equipped ? "Gear equipped" : "Gear unequipped");
  });
}

function openListForm(gearId, gearName) {
  var grid = document.getElementById("fg-mygear-grid");
  var existing = document.getElementById("list-form-" + gearId);
  if(existing) { existing.remove(); return; }
  var form = document.createElement("div");
  form.className = "fg-list-form";
  form.id = "list-form-" + gearId;
  form.innerHTML = '<div style="font-size:11px;color:var(--cyan);margin-bottom:8px">List: ' + gearName + '</div>' +
    '<input type="number" id="list-price-input" placeholder="Price in MuddOre" min="1" value="100">' +
    '<button class="fg-btn sell" data-confirm-list="' + gearId + '">Confirm Listing</button>' +
    '<button class="fg-btn" data-cancel-form="' + gearId + '" style="margin-top:4px">Cancel</button>';
  grid.insertBefore(form, grid.firstChild);
}

function listGearForSale(gearId, price) {
  apiCall({action: "list_gear", telegram_id: telegramId, gear_id: gearId, price_mudd_ore: price, username: tgUsername}).then(function(d) {
    if(d.ok) {
      toast("Listed for " + price + " MuddOre (" + Math.floor(price/1000) + " MUDD)");
      loadMyGear();
    } else {
      toast("Failed: " + (d.error || "unknown"));
    }
  });
}

function loadMarket() {
  apiCall({action: "load_market", telegram_id: telegramId}).then(function(d) {
    marketListings = d.listings || [];
    renderMarket();
  });
}

function renderMarket() {
  var grid = document.getElementById("fg-market-grid");
  if(marketListings.length === 0) {
    grid.innerHTML = '<div class="fg-empty">No listings yet. Be the first to sell gear on MudForge!</div>';
    return;
  }
  grid.innerHTML = "";
  marketListings.forEach(function(l) {
    var card = document.createElement("div");
    card.className = "fg-card " + (l.rarity || "common").toLowerCase();
    var stats = "";
    if(l.mining_bonus) stats += "+" + l.mining_bonus + "% Mining<br>";
    if(l.companion_bonus) stats += "+" + l.companion_bonus + "% Companion<br>";
    if(l.racing_bonus) stats += "+" + l.racing_bonus + "% Racing<br>";
    var isOwn = String(l.seller_telegram_id) === String(telegramId);
    var buyBtn = isOwn ?
      '<button class="fg-btn" data-cancel-listing="' + l.id + '">Cancel Listing</button>' :
      '<button class="fg-btn" data-buy-market="' + l.id + '" ' + (playerOre < (l.price_mudd_ore || 0) ? "disabled" : "") + '>Buy (' + (l.price_mudd_ore || 0) + ' Ore)</button>';
    var imgHtml = l.nft_image_url ? '<img src="' + l.nft_image_url + '">' : '';
    card.innerHTML = '<div class="fg-rarity ' + (l.rarity || "Common") + '">' + (l.rarity || "Common") + '</div>' +
      imgHtml + '<div class="fg-name">' + (l.nft_name || "Unknown") + '</div>' +
      '<div class="fg-tribe">' + (l.tribe || "None") + '</div>' +
      '<div class="fg-seller">Seller: ' + (l.seller_username || "Anonymous") + '</div>' +
      '<div class="fg-stats">' + stats + '</div>' +
      '<div class="fg-price">' + (l.price_mudd_ore || 0) + ' MuddOre</div>' + buyBtn;
    grid.appendChild(card);
  });
}

function buyMarketItem(listingId) {
  var listing = marketListings.find(function(l){return l.id === listingId});
  if(!listing || playerOre < (listing.price_mudd_ore || 0)) return;
  apiCall({action: "buy_market", telegram_id: telegramId, listing_id: listingId}).then(function(d) {
    if(d.ok) {
      toast("NFT purchased! Gear transferred.");
      playerOre -= (listing.price_mudd_ore || 0);
      updateOreDisplay();
      loadMarket();
      loadMyGear();
    } else {
      toast("Purchase failed: " + (d.error || "unknown"));
    }
  });
}

function cancelListing(listingId) {
  apiCall({action: "cancel_listing", telegram_id: telegramId, listing_id: listingId}).then(function(d) {
    if(d.ok) {
      toast("Listing cancelled.");
      loadMarket();
      loadMyGear();
    }
  });
}

// Event delegation for all buttons
document.addEventListener("click", function(e) {
  var el;
  if((el = e.target.closest("[data-fgtab]"))) { forgeTab(el.getAttribute("data-fgtab")); return; }
  if((el = e.target.closest("[data-buy-gear]"))) { buyForgeGear(el.getAttribute("data-buy-gear")); return; }
  if((el = e.target.closest("[data-equip-gear]"))) { toggleEquipGear(el.getAttribute("data-equip-gear"), el.getAttribute("data-equipped") !== "true"); return; }
  if((el = e.target.closest("[data-sell-gear]"))) { openListForm(el.getAttribute("data-sell-gear"), el.getAttribute("data-gear-name")); return; }
  if((el = e.target.closest("[data-confirm-list]"))) {
    var priceInput = document.getElementById("list-price-input");
    var price = parseInt(priceInput.value, 10);
    if(price && price > 0) listGearForSale(el.getAttribute("data-confirm-list"), price);
    return;
  }
  if((el = e.target.closest("[data-cancel-form]"))) { var f = document.getElementById("list-form-" + el.getAttribute("data-cancel-form")); if(f) f.remove(); return; }
  if((el = e.target.closest("[data-buy-market]"))) { buyMarketItem(el.getAttribute("data-buy-market")); return; }
  if((el = e.target.closest("[data-cancel-listing]"))) { cancelListing(el.getAttribute("data-cancel-listing")); return; }
});

// Init
if(window.Telegram && window.Telegram.WebApp) {
  Telegram.WebApp.ready();
  Telegram.WebApp.expand();
  try {
    var tgUser = Telegram.WebApp.initDataUnsafe && Telegram.WebApp.initDataUnsafe.user;
    if(tgUser && tgUser.id) {
      telegramId = String(tgUser.id);
      tgUsername = tgUser.username || "";
      apiCall({action: "load_player", telegram_id: telegramId}).then(function(d) {
        if(d && d.found) { playerOre = d.ore || 0; }
        updateOreDisplay();
        renderShop();
      });
    }
  } catch(e) { renderShop(); }
} else { renderShop(); }
</script>
</body>
</html>`;
  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache, no-store, must-revalidate", "Pragma": "no-cache", "Expires": "0" }
  });
});
