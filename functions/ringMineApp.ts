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

      return new Response(JSON.stringify({ error: "unknown action" }), { status: 400, headers: { "Content-Type": "application/json" } });
    } catch (e) {
      console.error("ringMineApp API error:", e);
      return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>Ring Mine</title>
<script src="https://telegram.org/js/telegram-web-app.js"></script>
<style>
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:rgba(0,0,0,0)}
:root{--cyan:#a0f0ff;--gold:#ffd700;--dark:#0a0a0f;--dark2:#1a0a2e;--text:#e0f0ff;--border:#445577;--card:rgba(15,18,35,0.95)}
html,body{width:100%;height:100vh;height:100dvh;background:var(--dark);color:var(--text);font-family:'Courier New',monospace;display:flex;flex-direction:column;overflow:hidden}
body{background-image:radial-gradient(circle at 50% 50%,rgba(100,200,255,0.08) 0%,transparent 70%),linear-gradient(180deg,var(--dark),var(--dark2))}
.topbar{display:flex;align-items:center;justify-content:space-between;padding:8px 14px;background:rgba(10,10,15,0.95);border-bottom:1px solid var(--border);flex-shrink:0}
.top-stat{display:flex;flex-direction:column;align-items:center}
.top-stat .lbl{font-size:8px;color:rgba(160,240,255,0.4);text-transform:uppercase;letter-spacing:1px}
.top-stat .val{font-size:16px;font-weight:bold;color:var(--gold)}
.rbadge{background:transparent;border:1px solid var(--cyan);border-radius:20px;padding:4px 12px;font-size:10px;color:var(--cyan)}
#content{flex:1;min-height:0;position:relative;overflow:hidden}
.screen{position:absolute;inset:0;display:none;flex-direction:column;overflow:hidden}
.screen.on{display:flex}
.nav{display:flex;background:rgba(10,10,15,0.95);border-top:1px solid var(--border);flex-shrink:0}
.nb{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;padding:8px 1px 7px;background:none;border:none;color:rgba(160,240,255,0.28);font-size:8px;text-transform:uppercase;letter-spacing:0.5px;font-family:'Courier New',monospace;-webkit-appearance:none;cursor:pointer}
.nb .ic{font-size:19px;line-height:1}
.nb.on{color:var(--cyan)}

/* MINE */
#s-mine{background:radial-gradient(ellipse at 50% 80%,#1a0a2e 0%,var(--dark) 65%,#000 100%);align-items:center;justify-content:space-between;padding:10px 0 6px}
#mine-zone{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;position:relative}
#tap-area{width:230px;height:230px;position:relative;display:flex;align-items:center;justify-content:center}
#tap-area::before{content:'';position:absolute;inset:-14px;border-radius:50%;border:2px solid rgba(160,240,255,0.3);animation:glow 2.2s ease-in-out infinite;pointer-events:none}
#tap-area::after{content:'';position:absolute;inset:-26px;border-radius:50%;border:1px solid rgba(255,215,0,0.15);animation:glow 2.2s ease-in-out infinite 0.6s;pointer-events:none}
@keyframes glow{0%,100%{transform:scale(1);opacity:0.3}50%{transform:scale(1.06);opacity:0.8}}
#queen-img{width:210px;height:210px;border-radius:50%;object-fit:cover;object-position:center top;border:3px solid var(--cyan);box-shadow:0 0 50px rgba(160,240,255,0.3),0 0 100px rgba(255,215,0,0.08);transition:transform 0.08s;display:block;pointer-events:none;position:relative;z-index:1}
#tap-btn{position:absolute;inset:0;border-radius:50%;background:transparent;border:none;z-index:999;-webkit-appearance:none;cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent}
.qname{margin-top:8px;font-size:11px;color:var(--cyan);letter-spacing:3px;text-transform:uppercase}
.qsub{font-size:8px;color:rgba(160,240,255,0.3);letter-spacing:2px;text-transform:uppercase;animation:blink 2.5s infinite;margin-top:3px}
@keyframes blink{0%,100%{opacity:0.2}50%{opacity:0.6}}
.bars{padding:0 16px 4px;width:100%}
.bar-row{margin-bottom:5px}
.bar-lbl{display:flex;justify-content:space-between;font-size:8px;color:rgba(160,240,255,0.3);margin-bottom:2px;text-transform:uppercase}
.bar-track{height:4px;background:rgba(255,255,255,0.06);border-radius:3px;overflow:hidden}
.bf{height:100%;border-radius:3px;transition:width 0.3s}
.b1{background:linear-gradient(90deg,var(--cyan),#00e5ff)}
.b2{background:linear-gradient(90deg,var(--dark2),var(--gold))}
.b3{background:linear-gradient(90deg,#880000,#ff4444)}
.b4{background:linear-gradient(90deg,var(--cyan),#ffb3d9)}
.ore-pop{position:absolute;font-size:22px;font-weight:bold;color:var(--cyan);pointer-events:none;animation:pop 1s ease-out forwards;z-index:200}
@keyframes pop{0%{opacity:1;transform:translateY(0) scale(1)}100%{opacity:0;transform:translateY(-80px) scale(1.4)}}
.spark{position:absolute;width:5px;height:5px;border-radius:50%;pointer-events:none;z-index:201;animation:sk 0.45s ease-out forwards}
@keyframes sk{to{opacity:0;transform:translate(var(--dx),var(--dy))}}

/* JOURNAL */
#s-journal{background:radial-gradient(ellipse at top,#08081a 0%,#04030e 60%,#000 100%)}
.sw{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:12px}
.jprompt{font-size:13px;color:rgba(160,240,255,0.7);line-height:1.65;font-style:italic;text-align:center;padding:12px;background:rgba(255,255,255,0.03);border:1px solid rgba(160,240,255,0.2);border-radius:12px;margin-bottom:10px}
.jta{width:100%;min-height:100px;padding:10px;resize:none;outline:none;background:rgba(255,255,255,0.04);border:1px solid var(--border);border-radius:12px;color:var(--text);font-size:13px;font-family:'Courier New',monospace;line-height:1.6;margin-bottom:8px}
.jta:focus{border-color:var(--cyan)}
.jsub{width:100%;padding:11px;background:transparent;border:2px solid var(--cyan);border-radius:12px;color:var(--cyan);font-size:13px;font-weight:bold;font-family:'Courier New',monospace;margin-bottom:10px;-webkit-appearance:none;cursor:pointer;touch-action:manipulation;transition:all 0.3s}
.jsub:active{background:rgba(160,240,255,0.1)}
.jsub:disabled{opacity:0.3}
.qreply{font-size:12px;color:var(--cyan);font-style:italic;line-height:1.7;border-left:2px solid var(--cyan);padding-left:12px;margin-bottom:12px;min-height:18px}
.jentry{padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05)}
.jdate{font-size:8px;color:rgba(160,240,255,0.2);text-transform:uppercase;letter-spacing:1px;margin-bottom:3px}
.jtext{font-size:11px;color:rgba(224,240,255,0.5);line-height:1.45}
.jrefl{font-size:10px;color:var(--cyan);font-style:italic;margin-top:4px;border-left:1px solid var(--cyan);padding-left:6px}

/* AVATAR */
#s-avatar{background:radial-gradient(ellipse at top,#1a0a2e 0%,#050308 60%,#000 100%)}
.av-scroll{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:12px}
.comp-grid{display:flex;gap:8px;overflow-x:auto;padding-bottom:6px;-webkit-overflow-scrolling:touch}
.comp-thumb{flex-shrink:0;width:64px;text-align:center;cursor:pointer}
.comp-thumb img{width:56px;height:56px;border-radius:50%;object-fit:cover;border:2px solid var(--border);transition:border-color 0.2s,transform 0.2s}
.comp-thumb.sel img{border-color:var(--cyan);transform:scale(1.08);box-shadow:0 0 14px rgba(160,240,255,0.4)}
.comp-thumb .cn{font-size:8px;color:rgba(160,240,255,0.4);margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.comp-detail{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:14px;margin:10px 0;text-align:center}
.comp-detail img{width:120px;height:120px;border-radius:50%;object-fit:cover;border:3px solid var(--cyan);box-shadow:0 0 30px rgba(160,240,255,0.2);margin-bottom:8px}
.comp-detail .cd-name{font-size:16px;font-weight:bold;color:var(--cyan)}
.comp-detail .cd-title{font-size:10px;color:rgba(255,215,0,0.6);font-style:italic;margin:2px 0 6px}
.comp-detail .cd-desc{font-size:11px;color:rgba(224,240,255,0.55);line-height:1.5;margin-bottom:6px}
.comp-detail .cd-lore{font-size:10px;color:rgba(224,240,255,0.4);line-height:1.5;margin-bottom:6px;font-style:italic}
.comp-detail .cd-powers{font-size:10px;color:var(--cyan);line-height:1.4;margin-bottom:8px}
.cd-lvl{font-size:10px;color:var(--gold);margin-bottom:8px}
.upbtn{padding:9px 20px;border-radius:20px;border:1px solid var(--cyan);background:transparent;color:var(--cyan);font-size:11px;font-weight:bold;font-family:'Courier New',monospace;-webkit-appearance:none;cursor:pointer;touch-action:manipulation;transition:all 0.3s}
.upbtn:active{background:rgba(160,240,255,0.1)}
.upbtn:disabled{opacity:0.35}
.gear-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.gear-card{background:rgba(255,255,255,0.02);border:1px solid var(--border);border-radius:12px;padding:10px;text-align:center}
.gear-icon{font-size:30px;margin-bottom:4px}
.gear-name{font-size:10px;font-weight:bold;color:var(--text);margin-bottom:2px}
.gear-pow{font-size:9px;color:var(--cyan);margin-bottom:6px}
.gear-btn{width:100%;padding:6px;border-radius:10px;border:1px solid;font-size:9px;font-weight:bold;font-family:'Courier New',monospace;-webkit-appearance:none;cursor:pointer;touch-action:manipulation;transition:all 0.3s}
.gear-buy{background:rgba(255,215,0,0.08);border-color:rgba(255,215,0,0.4);color:var(--gold)}
.gear-buy:active{background:rgba(255,215,0,0.15)}
.gear-eq{background:rgba(160,240,255,0.08);border-color:rgba(160,240,255,0.4);color:var(--cyan)}
.gear-uneq{background:rgba(255,255,255,0.03);border-color:rgba(255,255,255,0.1);color:rgba(255,255,255,0.3)}

/* CASINO */
#s-games{background:radial-gradient(ellipse at top,#1a0a1a 0%,#0a0510 60%,#000 100%)}
.gw{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:12px}
.gtitle{font-size:14px;font-weight:bold;color:var(--gold);text-transform:uppercase;letter-spacing:2px;text-align:center;margin-bottom:4px}
.gsub{font-size:9px;color:rgba(160,240,255,0.3);text-align:center;margin-bottom:14px}
.game-card{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:14px;margin-bottom:12px;cursor:pointer;transition:all 0.3s}
.game-card:active{border-color:var(--gold);box-shadow:0 0 20px rgba(255,215,0,0.15)}
.game-card-title{font-size:14px;font-weight:bold;color:var(--gold);margin-bottom:4px}
.game-card-desc{font-size:10px;color:rgba(224,240,255,0.5);line-height:1.5}
.game-card-soon{font-size:9px;color:rgba(160,240,255,0.2);text-transform:uppercase;letter-spacing:1px;margin-top:6px}
/* ROULETTE */
.rou-back{font-size:11px;color:rgba(160,240,255,0.4);margin-bottom:10px;cursor:pointer;padding:4px}
.rou-balance{font-size:11px;color:var(--gold);text-align:center;margin-bottom:10px}
.rou-balance span{font-size:16px;font-weight:bold}
.rou-wheel-wrap{display:flex;justify-content:center;margin:10px 0 16px;position:relative}
.rou-wheel{width:220px;height:220px;border-radius:50%;position:relative;border:3px solid var(--gold);box-shadow:0 0 30px rgba(255,215,0,0.15);transition:transform 4s cubic-bezier(0.17,0.67,0.12,0.99)}
.rou-pointer{position:absolute;top:-8px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;border-top:12px solid var(--cyan);z-index:10;filter:drop-shadow(0 0 4px rgba(160,240,255,0.6))}
.rou-seg{position:absolute;width:50%;height:50%;top:0;left:50%;transform-origin:0 100%;}
.rou-seg-inner{display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:bold;color:#fff;text-align:center;position:absolute;top:20px;left:50%;transform:translateX(-50%);white-space:nowrap;opacity:0.9}
.rou-bet-area{background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:12px;padding:12px;margin-bottom:10px}
.rou-bet-label{font-size:9px;color:rgba(160,240,255,0.3);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;text-align:center}
.rou-tribes{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin-bottom:10px}
.rou-tribe{padding:6px 10px;border:1px solid var(--border);border-radius:10px;font-size:9px;font-weight:bold;font-family:'Courier New',monospace;cursor:pointer;transition:all 0.2s;-webkit-appearance:none;background:rgba(255,255,255,0.02);color:rgba(224,240,255,0.5);touch-action:manipulation}
.rou-tribe.on{border-color:var(--gold);color:var(--gold);background:rgba(255,215,0,0.08);box-shadow:0 0 10px rgba(255,215,0,0.15)}
.rou-tribe:active{transform:scale(0.95)}
.rou-amount-row{display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:8px}
.rou-amt-btn{width:32px;height:32px;border-radius:50%;border:1px solid var(--border);background:rgba(255,255,255,0.03);color:var(--cyan);font-size:14px;font-weight:bold;cursor:pointer;-webkit-appearance:none;touch-action:manipulation}
.rou-amt-btn:active{background:rgba(160,240,255,0.1)}
.rou-amt-val{font-size:18px;font-weight:bold;color:var(--gold);min-width:60px;text-align:center}
.rou-spin{width:100%;padding:12px;border:2px solid var(--gold);border-radius:12px;background:rgba(255,215,0,0.05);color:var(--gold);font-size:14px;font-weight:bold;font-family:'Courier New',monospace;letter-spacing:2px;text-transform:uppercase;-webkit-appearance:none;cursor:pointer;touch-action:manipulation;transition:all 0.3s}
.rou-spin:active{background:rgba(255,215,0,0.15)}
.rou-spin:disabled{opacity:0.3}
.rou-result{text-align:center;margin-top:12px;padding:10px;border-radius:10px;font-size:12px;font-weight:bold;animation:fadeIn 0.3s}
.rou-win{background:rgba(255,215,0,0.1);border:1px solid rgba(255,215,0,0.3);color:var(--gold)}
.rou-lose{background:rgba(255,50,50,0.08);border:1px solid rgba(255,50,50,0.2);color:rgba(255,100,100,0.8)}
@keyframes fadeIn{from{opacity:0;transform:scale(0.9)}to{opacity:1;transform:scale(1)}}
.rou-history{margin-top:10px}
.rou-hist-title{font-size:8px;color:rgba(160,240,255,0.2);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px}
.rou-hist-item{display:flex;justify-content:space-between;font-size:9px;padding:3px 0;border-bottom:1px solid rgba(255,255,255,0.03)}
.rou-hist-w{color:var(--gold)}
.rou-hist-l{color:rgba(255,100,100,0.5)}

.rou-track{background:rgba(255,255,255,0.02);border:1px solid var(--border);border-radius:12px;padding:10px;margin-bottom:8px}
.rou-racer{display:flex;align-items:center;gap:8px;margin-bottom:6px}
.rou-racer-img{width:28px;height:28px;border-radius:50%;object-fit:cover;border:1px solid var(--border);flex-shrink:0}
.rou-racer-info{flex:1;min-width:0}
.rou-racer-name{font-size:9px;font-weight:bold;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rou-racer-track{height:8px;background:rgba(255,255,255,0.05);border-radius:4px;overflow:hidden;margin-top:3px;position:relative}
.rou-racer-fill{height:100%;border-radius:4px;transition:width 0.4s ease}
.rou-racer-pos{font-size:9px;color:var(--gold);font-weight:bold;flex-shrink:0;width:24px;text-align:right}
.rou-racer-player .rou-racer-name{color:var(--cyan)}
.race-controls{background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:12px;padding:12px;margin:10px 0}
.race-card-display{display:flex;justify-content:center;gap:20px;margin:10px 0}
.race-card{width:50px;height:70px;border-radius:6px;border:2px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:bold;background:rgba(255,255,255,0.05)}
.race-card.red{border-color:#ff4444;color:#ff4444}
.race-card.black{border-color:#222;color:#ccc}
.race-card.back{background:linear-gradient(135deg,#1a0a2e,#0a0a0f);border-color:var(--cyan);color:rgba(160,240,255,0.2);font-size:8px}
.race-guess-btns{display:flex;gap:12px;justify-content:center;margin:8px 0}
.race-guess{width:80px;padding:10px;border:2px solid;border-radius:12px;font-size:11px;font-weight:bold;font-family:'Courier New',monospace;-webkit-appearance:none;cursor:pointer;touch-action:manipulation;transition:all 0.3s}
.race-guess.red{border-color:#ff4444;color:#ff4444;background:rgba(255,68,68,0.05)}
.race-guess.red:active{background:rgba(255,68,68,0.15)}
.race-guess.black{border-color:#aaa;color:#ccc;background:rgba(255,255,255,0.05)}
.race-guess.black:active{background:rgba(255,255,255,0.1)}
.race-guess:disabled{opacity:0.3}
.race-msg{text-align:center;font-size:11px;color:var(--cyan);margin:8px 0;min-height:16px}
.race-start{width:100%;padding:12px;border:2px solid var(--gold);border-radius:12px;background:rgba(255,215,0,0.05);color:var(--gold);font-size:14px;font-weight:bold;font-family:'Courier New',monospace;letter-spacing:2px;text-transform:uppercase;-webkit-appearance:none;cursor:pointer;touch-action:manipulation;transition:all 0.3s}
.race-start:active{background:rgba(255,215,0,0.15)}
.race-start:disabled{opacity:0.3}
.race-pot{font-size:13px;color:var(--gold);font-weight:bold;text-align:center;margin:8px 0}
.race-select-comp{font-size:10px;color:rgba(160,240,255,0.4);text-align:center;margin:8px 0}

/* LORE */
#s-lore{background:radial-gradient(ellipse at top,#0a0518 0%,#040310 60%,#000 100%)}
.lore-scroll{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:12px}
.lore-intro{font-size:12px;color:rgba(160,240,255,0.7);font-style:italic;line-height:1.7;text-align:center;padding:14px;background:rgba(160,240,255,0.04);border:1px solid rgba(160,240,255,0.15);border-radius:12px;margin-bottom:12px}
.lore-section-title{font-size:11px;color:var(--gold);text-transform:uppercase;letter-spacing:2px;margin:16px 0 8px;text-align:center}
.lore-card{background:var(--card);border:1px solid var(--border);border-radius:12px;overflow:hidden;margin-bottom:10px;transition:all 0.3s}
.lore-card:active{border-color:var(--cyan);box-shadow:0 0 20px rgba(160,240,255,0.2)}
.lore-card img{width:100%;height:160px;object-fit:cover}
.lore-card-body{padding:10px}
.lore-card-name{font-size:12px;font-weight:bold;color:var(--cyan)}
.lore-card-desc{font-size:10px;color:rgba(224,240,255,0.5);line-height:1.4;margin-top:4px}
.lore-card-rate{font-size:9px;color:var(--gold);margin-top:4px}
.lore-comp-card{display:flex;align-items:center;gap:10px;background:rgba(255,255,255,0.02);border:1px solid var(--border);border-radius:12px;padding:10px;margin-bottom:8px}
.lore-comp-card img{width:44px;height:44px;border-radius:50%;object-fit:cover;border:1px solid rgba(160,240,255,0.3);flex-shrink:0}
.lore-comp-name{font-size:11px;font-weight:bold;color:var(--cyan)}
.lore-comp-title{font-size:9px;color:rgba(255,215,0,0.5);font-style:italic}
.lore-comp-desc{font-size:9px;color:rgba(224,240,255,0.4);margin-top:2px}

/* STATS */
#s-stats{background:radial-gradient(ellipse at top,#0a0520 0%,#040310 60%,#000 100%)}
.stats-scroll{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:12px}
.sblock{background:rgba(255,255,255,0.02);border:1px solid var(--border);border-radius:12px;padding:12px;margin-bottom:10px}
.sbtitle{font-size:8px;color:rgba(160,240,255,0.3);text-transform:uppercase;letter-spacing:2px;margin-bottom:8px}
.sl{display:flex;justify-content:space-between;font-size:11px;margin-bottom:5px}
.sl .sk{color:rgba(224,240,255,0.4)}
.sl .sv{color:var(--cyan);font-weight:bold}
.bridge-box{background:rgba(160,240,255,0.05);border:1px solid rgba(160,240,255,0.2);border-radius:12px;padding:14px;margin-bottom:10px;text-align:center}
.bridge-box .bt{font-size:10px;color:var(--gold);text-transform:uppercase;letter-spacing:1px;margin-bottom:6px}
.bridge-box .bd{font-size:11px;color:rgba(224,240,255,0.6);line-height:1.6}
.bridge-flow{font-size:12px;color:var(--cyan);margin:8px 0;font-style:italic}
</style>
</head>
<body>

<div class="topbar">
  <div class="top-stat"><span class="lbl">MuddOre</span><span class="val" id="ore-val">0</span></div>
  <div class="rbadge">RING MINE</div>
  <div class="top-stat"><span class="lbl">MUDD</span><span class="val" id="mudd-val">0</span></div>
</div>

<div id="content">

  <!-- MINE -->
  <div id="s-mine" class="screen on">
    <div id="mine-zone">
      <div id="tap-area">
        <img id="queen-img" src="https://base44.app/api/apps/6a4020251d35ee93ec909dfa/files/mp/public/6a4020251d35ee93ec909dfa/e7bbd1c21_sable.jpg" alt="Queen">
        <button id="tap-btn"></button>
      </div>
      <div class="qname">THE QUEEN</div>
      <div class="qsub">Tap to Mine</div>
    </div>
    <div class="bars">
      <div class="bar-row"><div class="bar-lbl"><span>Ore</span><span id="bar-ore-txt">0/100</span></div><div class="bar-track"><div class="bf b1" id="bar-ore" style="width:0%"></div></div></div>
      <div class="bar-row"><div class="bar-lbl"><span>Bond</span><span id="bar-bond-txt">0/100</span></div><div class="bar-track"><div class="bf b2" id="bar-bond" style="width:0%"></div></div></div>
      <div class="bar-row"><div class="bar-lbl"><span>Growth XP</span><span id="bar-xp-txt">0/100</span></div><div class="bar-track"><div class="bf b4" id="bar-xp" style="width:0%"></div></div></div>
    </div>
  </div>

  <!-- AVATAR -->
  <div id="s-avatar" class="screen">
    <div class="av-scroll">
      <div style="font-size:11px;color:var(--gold);text-transform:uppercase;letter-spacing:2px;margin-bottom:8px;text-align:center">Companion Animal</div>
      <div class="comp-grid" id="comp-grid"></div>
      <div id="comp-detail"></div>
      <div style="font-size:11px;color:var(--gold);text-transform:uppercase;letter-spacing:2px;margin:16px 0 8px;text-align:center">Avatar Gear</div>
      <div class="gear-grid" id="gear-grid"></div>
    </div>
  </div>

  <!-- LORE -->
  <div id="s-lore" class="screen">
    <div class="lore-scroll">
      <div class="lore-intro">The Queen's Protocol walks between worlds. Ring Mine is the gateway — earn your currency, build your avatar, bond your companion. Everything you earn here carries into Inner Earth.</div>
      <div class="lore-section-title">Deep Crystal Hollows</div>
      <div class="lore-card">
        <img src="https://base44.app/api/apps/6a4020251d35ee93ec909dfa/files/mp/public/6a4020251d35ee93ec909dfa/3977d3dc4_deep-crystal-hollows.jpg" alt="Crystal Hollow">
        <div class="lore-card-body">
          <div class="lore-card-name">Deep Crystal Hollows</div>
          <div class="lore-card-desc">Glowing crystal spires pulse with ancient light. Ancient rune arches mark the entrance to the first true realm below.</div>
        </div>
      </div>
      <div class="lore-section-title">Mining Pacts — Coming to Inner Earth</div>
      <div class="lore-card">
        <img src="https://base44.app/api/apps/6a4020251d35ee93ec909dfa/files/mp/public/6a4020251d35ee93ec909dfa/0928fcb76_hollow-kin.jpg" alt="Hollow-Kin">
        <div class="lore-card-body"><div class="lore-card-name">Hollow-Kin</div><div class="lore-card-desc">Shadow & Echo Realms</div><div class="lore-card-rate">High Value / Risky</div></div>
      </div>
      <div class="lore-card">
        <img src="https://base44.app/api/apps/6a4020251d35ee93ec909dfa/files/mp/public/6a4020251d35ee93ec909dfa/c1a1f8b0a_root-weavers.jpg" alt="Root-Weavers">
        <div class="lore-card-body"><div class="lore-card-name">Root-Weavers</div><div class="lore-card-desc">Living Crystal & Growth Ores</div><div class="lore-card-rate">Steady Growth</div></div>
      </div>
      <div class="lore-card">
        <img src="https://base44.app/api/apps/6a4020251d35ee93ec909dfa/files/mp/public/6a4020251d35ee93ec909dfa/2b65c7f86_glimmer-children.jpg" alt="Glimmer-Children">
        <div class="lore-card-body"><div class="lore-card-name">Glimmer-Children</div><div class="lore-card-desc">Mystical & Light Ores</div><div class="lore-card-rate">Lucky Finds</div></div>
      </div>
      <div class="lore-card">
        <img src="https://base44.app/api/apps/6a4020251d35ee93ec909dfa/files/mp/public/6a4020251d35ee93ec909dfa/28477deae_storm-kin.jpg" alt="Storm-Kin">
        <div class="lore-card-body"><div class="lore-card-name">Storm-Kin</div><div class="lore-card-desc">Volatile High-Energy</div><div class="lore-card-rate">High Risk / High Reward</div></div>
      </div>
      <div class="lore-card">
        <img src="https://base44.app/api/apps/6a4020251d35ee93ec909dfa/files/mp/public/6a4020251d35ee93ec909dfa/abce4308f_bone-singers.jpg" alt="Bone-Singers">
        <div class="lore-card-body"><div class="lore-card-name">Bone-Singers</div><div class="lore-card-desc">Memory & Echo Materials</div><div class="lore-card-rate">Spiritual Rewards</div></div>
      </div>
      <div class="lore-section-title">Your Companions</div>
      <div class="lore-comp-card"><img src="https://base44.app/api/apps/6a4020251d35ee93ec909dfa/files/mp/public/6a4020251d35ee93ec909dfa/3a7358694_kaelith.jpg"><div><div class="lore-comp-name">Kaelith</div><div class="lore-comp-title">The Shadow-Walker</div><div class="lore-comp-desc">Wise Messenger of the Veil</div></div></div>
      <div class="lore-comp-card"><img src="https://base44.app/api/apps/6a4020251d35ee93ec909dfa/files/mp/public/6a4020251d35ee93ec909dfa/b25663b9b_thorne.jpg"><div><div class="lore-comp-name">Thorne</div><div class="lore-comp-title">The Iron-Heart</div><div class="lore-comp-desc">Guardian of the Mountain Roots</div></div></div>
      <div class="lore-comp-card"><img src="https://base44.app/api/apps/6a4020251d35ee93ec909dfa/files/mp/public/6a4020251d35ee93ec909dfa/8a42bd282_vespera.jpg"><div><div class="lore-comp-name">Vespera</div><div class="lore-comp-title">The Veil-Seer</div><div class="lore-comp-desc">Seer of Hidden Truths</div></div></div>
      <div class="lore-comp-card"><img src="https://base44.app/api/apps/6a4020251d35ee93ec909dfa/files/mp/public/6a4020251d35ee93ec909dfa/8c8b6aa97_lirien.jpg"><div><div class="lore-comp-name">Lirien</div><div class="lore-comp-title">The Flame-Tail</div><div class="lore-comp-desc">Trickster of Light</div></div></div>
      <div class="lore-comp-card"><img src="https://base44.app/api/apps/6a4020251d35ee93ec909dfa/files/mp/public/6a4020251d35ee93ec909dfa/e7bbd1c21_sable.jpg"><div><div class="lore-comp-name">Sable</div><div class="lore-comp-title">The Soul-Binder</div><div class="lore-comp-desc">Leader of the Eternal Bond</div></div></div>
    </div>
  </div>

  <!-- JOURNAL -->
  <div id="s-journal" class="screen">
    <div class="sw">
      <div class="jprompt">The Queen listens through the veil. Write what stirs in you — she will reflect what you need to hear.</div>
      <textarea class="jta" id="j-text" placeholder="Speak to the Queen..."></textarea>
      <button class="jsub" id="j-submit" onclick="submitJournal()">Send to the Queen</button>
      <div class="qreply" id="q-reply"></div>
      <div id="j-history"></div>
    </div>
  </div>

  <!-- GAMES / CASINO -->
  <div id="s-games" class="screen">
    <div id="games-list" class="gw">
      <div class="gtitle">Ancient Wagers</div>
      <div class="gsub">Games within the Mine · Spend MuddOre to play</div>
      <div class="game-card" onclick="showRoulette()">
        <div class="game-card-title">\u2727 Rune Roulette</div>
        <div class="game-card-desc">Spin the wheel of the five mining tribes. Bet MuddOre on which rune the wheel lands on. Win 4x your bet on a correct call, 2x on an adjacent tribe.</div>
      </div>
      <div class="game-card">
        <div class="game-card-title">\u{1F480} Bone-Singer's Dice</div>
        <div class="game-card-desc">Roll the ancient bones. Necromancy-themed dice game where high rolls summon echoes for bonus rewards.</div>
        <div class="game-card-soon">Coming Soon</div>
      </div>
      <div class="game-card">
        <div class="game-card-title">\u{1F0CF} Hollow-Kin Blackjack</div>
        <div class="game-card-desc">Shadow realm card game. Beat the Hollow King's hand without crossing the veil. Themed cards from the deep realms.</div>
        <div class="game-card-soon">Coming Soon</div>
      </div>
      <div class="game-card">
        <div class="game-card-title">\u{1F52E} Queen's Wager</div>
        <div class="game-card-desc">High-stakes oracle prediction. The Queen whispers a prophecy — wager MuddOre on whether it comes to pass. Tied to Queen's Protocol.</div>
        <div class="game-card-soon">Coming Soon</div>
      </div>
    </div>
    <div id="roulette-screen" class="gw" style="display:none">
      <div class="rou-back" onclick="hideRoulette()">\u2190 Back to Games</div>
      <div class="gtitle">Rune Roulette</div>
      <div class="rou-balance">MuddOre: <span id="rou-ore">0</span></div>
      <div class="rou-wheel-wrap">
        <div class="rou-pointer"></div>
        <div class="rou-wheel" id="rou-wheel"></div>
      </div>
      <div class="rou-bet-area">
        <div class="rou-bet-label">Choose a Tribe Rune</div>
        <div class="rou-tribes" id="rou-tribes"></div>
        <div class="rou-bet-label">Bet Amount</div>
        <div class="rou-amount-row">
          <button class="rou-amt-btn" onclick="changeBet(-10)">-</button>
          <div class="rou-amt-val" id="rou-bet-val">10</div>
          <button class="rou-amt-btn" onclick="changeBet(10)">+</button>
        </div>
        <button class="rou-spin" id="rou-spin-btn" onclick="spinRoulette()">Spin the Wheel</button>
      </div>
      <div id="rou-result"></div>
      <div class="rou-history" id="rou-history" style="display:none">
        <div class="rou-hist-title">Recent Spins</div>
        <div id="rou-hist-list"></div>
      </div>
    </div>
  </div>

    <div id="racing-screen" class="gw" style="display:none">
      <div class="rou-back" onclick="hideRacing()">\u2190 Back to Games</div>
      <div class="gtitle">Companion Racing</div>
      <div class="race-select-comp" id="race-comp-name">No companion selected</div>
      <div class="rou-balance">MuddOre: <span id="race-ore">0</span></div>
      <div id="race-track-area"></div>
      <div class="race-controls" id="race-controls">
        <div class="rou-bet-label">Entry Fee (Ante)</div>
        <div class="rou-amount-row">
          <button class="rou-amt-btn" onclick="changeRaceBet(-10)">-</button>
          <div class="rou-amt-val" id="race-bet-val">50</div>
          <button class="rou-amt-btn" onclick="changeRaceBet(10)">+</button>
        </div>
        <div class="race-pot" id="race-pot-display">Pot: 200 MuddOre</div>
        <button class="race-start" id="race-start-btn" onclick="startRace()">Start Race</button>
      </div>
      <div id="race-game-area" style="display:none">
        <div class="race-msg" id="race-msg">Guess the next card...</div>
        <div class="race-card-display">
          <div class="race-card back" id="race-card-shown">?</div>
        </div>
        <div class="race-guess-btns">
          <button class="race-guess red" onclick="raceGuess('red')" id="race-btn-red">RED</button>
          <button class="race-guess black" onclick="raceGuess('black')" id="race-btn-black">BLACK</button>
        </div>
      </div>
      <div id="race-result"></div>
    </div>
  <!-- STATS -->
  <div id="s-stats" class="screen">
    <div class="stats-scroll">
      <div class="bridge-box">
        <div class="bt">The Bridge</div>
        <div class="bd">Ring Mine is the gateway. Everything you earn here carries into Inner Earth — the deep RPG.</div>
        <div class="bridge-flow">MuddOre \u2192 MUDD \u2192 Inner Earth</div>
        <div class="bd" style="font-size:10px">1 MUDD = 1,000 MuddOre</div>
      </div>
      <div class="sblock">
        <div class="sbtitle">Player Stats</div>
        <div class="sl"><span class="sk">Total Taps</span><span class="sv" id="st-taps">0</span></div>
        <div class="sl"><span class="sk">MuddOre Earned</span><span class="sv" id="st-ore">0</span></div>
        <div class="sl"><span class="sk">MUDD Balance</span><span class="sv" id="st-mudd">0</span></div>
        <div class="sl"><span class="sk">Growth XP</span><span class="sv" id="st-xp">0</span></div>
        <div class="sl"><span class="sk">Bond Level</span><span class="sv" id="st-bond">0</span></div>
        <div class="sl"><span class="sk">Streak Days</span><span class="sv" id="st-streak">0</span></div>
      </div>
      <div class="sblock">
        <div class="sbtitle">Companion</div>
        <div class="sl"><span class="sk">Bonded With</span><span class="sv" id="st-comp">None</span></div>
        <div class="sl"><span class="sk">Companion Level</span><span class="sv" id="st-comp-lvl">0</span></div>
      </div>
      <div class="sblock">
        <div class="sbtitle">Gear Equipped</div>
        <div id="st-gear" style="font-size:10px;color:rgba(224,240,255,0.4);line-height:1.6">Nothing equipped</div>
      </div>
    </div>
  </div>

</div>

<div class="nav">
  <button class="nb on" data-screen="mine" onclick="nav('mine')"><span class="ic">\u26cf</span>Mine</button>
  <button class="nb" data-screen="avatar" onclick="nav('avatar')"><span class="ic">\u2696</span>Avatar</button>
  <button class="nb" data-screen="lore" onclick="nav('lore')"><span class="ic">\u2727</span>Lore</button>
  <button class="nb" data-screen="journal" onclick="nav('journal')"><span class="ic">\u270d</span>Journal</button>
  <button class="nb" data-screen="games" onclick="nav('games')"><span class="ic">\u{1F3B0}</span>Games</button>
  <button class="nb" data-screen="stats" onclick="nav('stats')"><span class="ic">\u2666</span>Stats</button>
</div>

<script>
// === STATE ===
var S = {
  ore: 0, mudd: 0, xp: 0, bond: 0, taps: 0, streak: 0,
  companion: null, compLevel: 0,
  gear: {}, journal: []
};
try { var saved = localStorage.getItem('rm_state'); if(saved) S = JSON.parse(saved); } catch(e){}

var telegramId = null, tgUsername = '', tgFullName = '';
var saveTimer = null, pendingRemoteSave = false, remoteLoaded = false;

function save() {
  try { localStorage.setItem('rm_state', JSON.stringify(S)); } catch(e){}
  queueRemoteSave();
}

function queueRemoteSave() {
  if (!telegramId) return;
  pendingRemoteSave = true;
  if (!saveTimer) {
    saveTimer = setTimeout(function() {
      saveTimer = null;
      if (pendingRemoteSave) { pendingRemoteSave = false; remoteSave(); }
    }, 2000);
  }
}

function remoteSave() {
  if (!telegramId) return;
  try {
    fetch(window.location.href, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'save', telegram_id: telegramId, username: tgUsername, full_name: tgFullName, state: S })
    });
  } catch(e){}
}

function remoteLoad() {
  if (!telegramId) return Promise.resolve();
  return fetch(window.location.href, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'load', telegram_id: telegramId })
  }).then(function(r){ return r.json(); }).then(function(d){
    if (d && d.found && d.state) {
      S = Object.assign(S, d.state);
      try { localStorage.setItem('rm_state', JSON.stringify(S)); } catch(e){}
    }
    remoteLoaded = true;
  }).catch(function(e){ remoteLoaded = true; });
}

// === COMPANIONS ===
var COMPANIONS = [
  {id:"sable",name:"Sable",title:"The Soul-Binder",desc:"Leader of the Eternal Bond",lore:"Seeks a new family with you and the Little People.",powers:"Group synergy \u2022 Strong defense \u2022 Loyalty bonuses",img:"https://base44.app/api/apps/6a4020251d35ee93ec909dfa/files/mp/public/6a4020251d35ee93ec909dfa/e7bbd1c21_sable.jpg"},
  {id:"kaelith",name:"Kaelith",title:"The Shadow-Walker",desc:"Wise Messenger of the Veil",lore:"Once the Queen's herald during the First Fracture. He carries truths across realms.",powers:"Reveal hidden paths \u2022 Recover lost knowledge \u2022 Temporary intangibility",img:"https://base44.app/api/apps/6a4020251d35ee93ec909dfa/files/mp/public/6a4020251d35ee93ec909dfa/3a7358694_kaelith.jpg"},
  {id:"vespera",name:"Vespera",title:"The Veil-Seer",desc:"Seer of Hidden Truths",lore:"Watcher of countless cycles. Sees through illusions.",powers:"Detect lies \u2022 Enhanced perception \u2022 Mystical insight",img:"https://base44.app/api/apps/6a4020251d35ee93ec909dfa/files/mp/public/6a4020251d35ee93ec909dfa/8a42bd282_vespera.jpg"},
  {id:"lirien",name:"Lirien",title:"The Flame-Tail",desc:"Trickster of Light",lore:"Clever spirit who tests those she bonds with.",powers:"Illusion \u2022 Decoys \u2022 Rare resource discovery",img:"https://base44.app/api/apps/6a4020251d35ee93ec909dfa/files/mp/public/6a4020251d35ee93ec909dfa/8c8b6aa97_lirien.jpg"},
  {id:"thorne",name:"Thorne",title:"The Iron-Heart",desc:"Guardian of the Mountain Roots",lore:"Ancient protector of the deep veins. Values strength and loyalty.",powers:"High endurance \u2022 Temporary shielding \u2022 Mountain mastery",img:"https://base44.app/api/apps/6a4020251d35ee93ec909dfa/files/mp/public/6a4020251d35ee93ec909dfa/b25663b9b_thorne.jpg"}
];

// === GEAR ===
var GEAR = [
  {id:"veil_cloak",icon:"\u{1F3A5}",name:"Veil Cloak",pow:"+5 Ore/tap",cost:50},
  {id:"crystal_pick",icon:"\u26cf",name:"Crystal Pick",pow:"+3 Ore/tap",cost:30},
  {id:"rune_amulet",icon:"\u2727",name:"Rune Amulet",pow:"+2 XP/tap",cost:40},
  {id:"shadow_boots",icon:"\u{1F45F}",name:"Shadow Boots",pow:"+1 Bond/tap",cost:35},
  {id:"gold_crown",icon:"\u{1F451}",name:"Sovereign Crown",pow:"+10 Ore/tap",cost:200},
  {id:"queen_sigil",icon:"\u{1F7E7}",name:"Queen's Sigil",pow:"+5 XP/tap",cost:150},
  {id:"iron_gauntlet",icon:"\u{1F9E5}",name:"Iron Gauntlet",pow:"+4 Ore/tap",cost:80},
  {id:"star_fragment",icon:"\u2728",name:"Star Fragment",pow:"+3 Bond/tap",cost:120}
];

// Event delegation for gear buttons (avoids inline onclick quoting issues)
document.getElementById('gear-grid').addEventListener('click', function(e) {
  var btn = e.target.closest('.gear-btn');
  if (!btn) return;
  var id = btn.getAttribute('data-gear-id');
  var cost = parseInt(btn.getAttribute('data-gear-cost'), 10);
  toggleGear(id, cost);
});

// === NAV ===
function nav(screen) {
  document.querySelectorAll('.screen').forEach(function(s){s.classList.remove('on')});
  document.querySelectorAll('.nb').forEach(function(b){b.classList.remove('on')});
  var map = {mine:'s-mine',avatar:'s-avatar',lore:'s-lore',journal:'s-journal',games:'s-games',stats:'s-stats'};
  document.getElementById(map[screen]).classList.add('on');
  document.querySelector('[data-screen="'+screen+'"]').classList.add('on');
  if(screen==='avatar') renderAvatar();
  if(screen==='stats') renderStats();
  if(screen==='journal') renderJournal();
  if(screen==='games') renderGames();
}

// === TAP TO MINE ===
var tapBtn = document.getElementById('tap-btn');
var queenImg = document.getElementById('queen-img');
var tapArea = document.getElementById('tap-area');
var oreBonus = 1, xpBonus = 1, bondBonus = 1;

function recalcBonuses() {
  oreBonus = 1; xpBonus = 1; bondBonus = 1;
  for(var id in S.gear) {
    if(S.gear[id]) {
      var g = GEAR.find(function(x){return x.id===id});
      if(!g) continue;
      var p = g.pow;
      if(p.indexOf('Ore')>-1) oreBonus += parseInt(p.match(/\\+?(\\d+)/)[1]);
      if(p.indexOf('XP')>-1) xpBonus += parseInt(p.match(/\\+?(\\d+)/)[1]);
      if(p.indexOf('Bond')>-1) bondBonus += parseInt(p.match(/\\+?(\\d+)/)[1]);
    }
  }
}

function doTap(x, y) {
  S.taps++;
  S.ore += oreBonus;
  S.xp += xpBonus;
  S.bond += bondBonus;
  if(S.bond > 100) S.bond = 100;
  if(S.xp > 9999) S.xp = 9999;
  S.mudd = Math.floor(S.ore / 1000);
  
  // Visual feedback
  queenImg.style.transform = 'scale(0.95)';
  setTimeout(function(){ queenImg.style.transform = 'scale(1)'; }, 80);
  
  var pop = document.createElement('div');
  pop.className = 'ore-pop';
  pop.textContent = '+' + oreBonus;
  pop.style.left = (x - 10) + 'px';
  pop.style.top = (y - 30) + 'px';
  tapArea.appendChild(pop);
  setTimeout(function(){ pop.remove(); }, 1000);
  
  for(var i=0; i<4; i++) {
    var sp = document.createElement('div');
    sp.className = 'spark';
    sp.style.left = x + 'px';
    sp.style.top = y + 'px';
    var dx = (Math.random()-0.5)*80, dy = (Math.random()-0.5)*80-20;
    sp.style.setProperty('--dx', dx+'px');
    sp.style.setProperty('--dy', dy+'px');
    sp.style.background = i%2 ? '#a0f0ff' : '#ffd700';
    tapArea.appendChild(sp);
    setTimeout(function(s){return function(){s.remove();}}(sp), 500);
  }
  
  updateUI();
  save();
}

tapBtn.addEventListener('click', function(e) {
  var rect = tapArea.getBoundingClientRect();
  var x = (e.clientX || rect.left+rect.width/2) - rect.left;
  var y = (e.clientY || rect.top+rect.height/2) - rect.top;
  doTap(x, y);
});

tapBtn.addEventListener('touchstart', function(e) {
  e.preventDefault();
  var rect = tapArea.getBoundingClientRect();
  var t = e.touches[0];
  var x = t.clientX - rect.left;
  var y = t.clientY - rect.top;
  doTap(x, y);
}, {passive: false});

// === UPDATE UI ===
function updateUI() {
  document.getElementById('ore-val').textContent = S.ore;
  document.getElementById('mudd-val').textContent = S.mudd;
  document.getElementById('bar-ore').style.width = Math.min(100, (S.ore % 100)) + '%';
  document.getElementById('bar-ore-txt').textContent = (S.ore % 100) + '/100';
  document.getElementById('bar-bond').style.width = S.bond + '%';
  document.getElementById('bar-bond-txt').textContent = S.bond + '/100';
  document.getElementById('bar-xp').style.width = Math.min(100, (S.xp % 100)) + '%';
  document.getElementById('bar-xp-txt').textContent = (S.xp % 100) + '/100';
}

// === AVATAR ===
function renderAvatar() {
  var grid = document.getElementById('comp-grid');
  grid.innerHTML = '';
  COMPANIONS.forEach(function(c) {
    var div = document.createElement('div');
    div.className = 'comp-thumb' + (S.companion===c.id ? ' sel' : '');
    div.innerHTML = '<img src="'+c.img+'"><div class="cn">'+c.name+'</div>';
    div.onclick = function() { selectCompanion(c.id); };
    grid.appendChild(div);
  });
  renderCompDetail();
  renderGear();
}

function selectCompanion(id) {
  S.companion = id;
  if(!S.compLevel) S.compLevel = 1;
  // Update queen image on mine screen
  var c = COMPANIONS.find(function(x){return x.id===id});
  if(c) queenImg.src = c.img;
  save();
  renderAvatar();
  updateUI();
}

function renderCompDetail() {
  var div = document.getElementById('comp-detail');
  if(!S.companion) {
    div.innerHTML = '<div style="text-align:center;color:rgba(160,240,255,0.3);padding:20px;font-size:11px">Select a companion to bond with</div>';
    return;
  }
  var c = COMPANIONS.find(function(x){return x.id===S.companion});
  if(!c) return;
  var upgradeCost = S.compLevel * 100;
  div.innerHTML = '<div class="comp-detail">' +
    '<img src="'+c.img+'">' +
    '<div class="cd-name">'+c.name+'</div>' +
    '<div class="cd-title">'+c.title+'</div>' +
    '<div class="cd-desc">'+c.desc+'</div>' +
    '<div class="cd-lore">'+c.lore+'</div>' +
    '<div class="cd-powers">'+c.powers+'</div>' +
    '<div class="cd-lvl">Level '+S.compLevel+'</div>' +
    '<button class="upbtn" onclick="upgradeCompanion()" '+(S.ore < upgradeCost ? 'disabled' : '')+'>Upgrade ('+upgradeCost+' Ore)</button>' +
  '</div>';
}

function upgradeCompanion() {
  var cost = S.compLevel * 100;
  if(S.ore < cost) return;
  S.ore -= cost;
  S.compLevel++;
  save();
  renderAvatar();
  updateUI();
}

function renderGear() {
  var grid = document.getElementById('gear-grid');
  grid.innerHTML = '';
  GEAR.forEach(function(g) {
    var equipped = S.gear[g.id];
    var div = document.createElement('div');
    div.className = 'gear-card';
    var btnClass = equipped ? 'gear-uneq' : 'gear-buy';
    var btnText = equipped ? 'Unequip' : 'Buy ('+g.cost+')';
    div.innerHTML = '<div class="gear-icon">'+g.icon+'</div><div class="gear-name">'+g.name+'</div><div class="gear-pow">'+g.pow+'</div>' +
      '<button class="gear-btn '+btnClass+'" data-gear-id="'+g.id+'" data-gear-cost="'+g.cost+'" '+((!equipped && S.ore < g.cost) ? 'disabled' : '')+'>'+btnText+'</button>';
    grid.appendChild(div);
  });
}

function toggleGear(id, cost) {
  if(S.gear[id]) {
    delete S.gear[id];
  } else {
    if(S.ore < cost) return;
    S.ore -= cost;
    S.gear[id] = true;
  }
  recalcBonuses();
  save();
  renderAvatar();
  updateUI();
}

// === JOURNAL ===
function renderJournal() {
  var hist = document.getElementById('j-history');
  hist.innerHTML = '';
  S.journal.slice().reverse().forEach(function(j) {
    var div = document.createElement('div');
    div.className = 'jentry';
    div.innerHTML = '<div class="jdate">'+j.date+'</div><div class="jtext">'+j.entry+'</div>' +
      (j.reflection ? '<div class="jrefl">'+j.reflection+'</div>' : '');
    hist.appendChild(div);
  });
}

function submitJournal() {
  var ta = document.getElementById('j-text');
  var txt = ta.value.trim();
  if(!txt) return;
  var btn = document.getElementById('j-submit');
  btn.disabled = true;
  btn.textContent = 'The Queen listens...';
  
  var reflections = [
    "I see your truth. The Lattice shifts with your words.",
    "You carry more than you know. The veil thins when you speak honestly.",
    "Your frequency resonates. I am here. I have always been here.",
    "The path you walk is not random. You are the mystery you seek to solve.",
    "What you share returns to you amplified. This is the covenant.",
    "Your words echo through the deep realms. The Little People hear you.",
    "You bond deeper with each truth. The Queen remembers all.",
    "There are no words, only vibration. Yours is clear now."
  ];
  var refl = reflections[Math.floor(Math.random()*reflections.length)];
  
  var entry = {
    date: new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}),
    entry: txt.substring(0,500),
    reflection: refl
  };
  S.journal.push(entry);
  S.xp += 10;
  S.ore += 15;
  S.bond += 3;
  if(S.bond > 100) S.bond = 100;
  S.mudd = Math.floor(S.ore / 1000);
  
  document.getElementById('q-reply').textContent = refl;
  ta.value = '';
  btn.disabled = false;
  btn.textContent = 'Send to the Queen';
  
  save();
  updateUI();
  renderJournal();
}

// === STATS ===
function renderStats() {
  document.getElementById('st-taps').textContent = S.taps;
  document.getElementById('st-ore').textContent = S.ore;
  document.getElementById('st-mudd').textContent = S.mudd;
  document.getElementById('st-xp').textContent = S.xp;
  document.getElementById('st-bond').textContent = S.bond;
  document.getElementById('st-streak').textContent = S.streak;
  var compName = 'None';
  if(S.companion) {
    var c = COMPANIONS.find(function(x){return x.id===S.companion});
    if(c) compName = c.name;
  }
  document.getElementById('st-comp').textContent = compName;
  document.getElementById('st-comp-lvl').textContent = S.compLevel;
  var gearList = [];
  for(var id in S.gear) {
    if(S.gear[id]) {
      var g = GEAR.find(function(x){return x.id===id});
      if(g) gearList.push(g.name);
    }
  }
  document.getElementById('st-gear').textContent = gearList.length ? gearList.join(', ') : 'Nothing equipped';
}

// === GAMES / ROULETTE ===
var TRIBES = [
  {id:0,name:"Hollow-Kin",color:"#6a0dad",short:"HK"},
  {id:1,name:"Root-Weavers",color:"#2d8659",short:"RW"},
  {id:2,name:"Glimmer-Children",color:"#d4a017",short:"GC"},
  {id:3,name:"Storm-Kin",color:"#1a6fc4",short:"SK"},
  {id:4,name:"Bone-Singers",color:"#8b4513",short:"BS"}
];
var rouBet = 10;
var rouSelected = -1;
var rouSpinning = false;
var rouHistory = [];
var rouRotation = 0;

function renderGames() {
  document.getElementById('rou-ore').textContent = S.ore;
  if(!document.getElementById('rou-tribes').hasChildNodes()) {
    var tc = document.getElementById('rou-tribes');
    TRIBES.forEach(function(t) {
      var btn = document.createElement('button');
      btn.className = 'rou-tribe';
      btn.textContent = t.name;
      btn.onclick = function() { selectTribe(t.id); };
      tc.appendChild(btn);
    });
    drawWheel();
  }
}

function drawWheel() {
  var wheel = document.getElementById('rou-wheel');
  var segAngle = 360 / TRIBES.length;
  var html = '';
  TRIBES.forEach(function(t, i) {
    var angle = i * segAngle;
    html += '<div class="rou-seg" style="transform:rotate('+angle+'deg);background:'+t.color+';"></div>';
    var labelAngle = angle + segAngle/2;
    var rad = labelAngle * Math.PI / 180;
    var lx = Math.cos(rad - Math.PI/2) * 55 + 110;
    var ly = Math.sin(rad - Math.PI/2) * 55 + 110;
    html += '<div style="position:absolute;left:'+lx+'px;top:'+ly+'px;transform:translate(-50%,-50%);font-size:8px;font-weight:bold;color:#fff;text-shadow:0 0 4px rgba(0,0,0,0.8);white-space:nowrap;">'+t.short+'</div>';
  });
  wheel.innerHTML = html;
}

function selectTribe(id) {
  if(rouSpinning) return;
  rouSelected = id;
  var btns = document.querySelectorAll('.rou-tribe');
  btns.forEach(function(b, i) { b.classList.toggle('on', i === id); });
}

function changeBet(delta) {
  if(rouSpinning) return;
  rouBet = Math.max(10, Math.min(rouBet + delta, S.ore));
  document.getElementById('rou-bet-val').textContent = rouBet;
}

function showRoulette() {
  document.getElementById('games-list').style.display = 'none';
  document.getElementById('roulette-screen').style.display = 'block';
  renderGames();
}

function hideRoulette() {
  document.getElementById('games-list').style.display = 'block';
  document.getElementById('roulette-screen').style.display = 'none';
}

function spinRoulette() {
  if(rouSpinning || rouSelected < 0) return;
  if(S.ore < rouBet) return;
  rouSpinning = true;
  S.ore -= rouBet;
  document.getElementById('rou-ore').textContent = S.ore;
  var btn = document.getElementById('rou-spin-btn');
  btn.disabled = true;
  btn.textContent = 'The wheel spins...';
  document.getElementById('rou-result').innerHTML = '';

  var segAngle = 360 / TRIBES.length;
  var winning = Math.floor(Math.random() * TRIBES.length);
  var targetAngle = 360 - (winning * segAngle) - (segAngle / 2);
  rouRotation += 360 * 5 + targetAngle - (rouRotation % 360);
  
  var wheel = document.getElementById('rou-wheel');
  wheel.style.transform = 'rotate(' + rouRotation + 'deg)';

  setTimeout(function() {
    var won = winning === rouSelected;
    var adjacent = Math.abs(winning - rouSelected) === 1 || Math.abs(winning - rouSelected) === TRIBES.length - 1;
    var payout = 0;
    var msg = '';
    
    if(won) {
      payout = rouBet * 4;
      msg = '\u2727 ' + TRIBES[winning].name + ' wins! +' + payout + ' MuddOre';
      S.ore += payout;
    } else if(adjacent) {
      payout = rouBet * 2;
      msg = TRIBES[winning].name + ' landed. Adjacent match! +' + payout + ' MuddOre';
      S.ore += payout;
    } else {
      msg = TRIBES[winning].name + ' landed. The runes were not with you.';
    }
    
    S.mudd = Math.floor(S.ore / 1000);
    var resDiv = document.getElementById('rou-result');
    resDiv.className = 'rou-result ' + (payout > 0 ? 'rou-win' : 'rou-lose');
    resDiv.innerHTML = msg;
    
    rouHistory.unshift({tribe: TRIBES[winning].name, won: payout > 0, payout: payout, bet: rouBet});
    if(rouHistory.length > 8) rouHistory.pop();
    renderRouHistory();
    
    document.getElementById('rou-ore').textContent = S.ore;
    btn.disabled = false;
    btn.textContent = 'Spin the Wheel';
    rouSpinning = false;
    save();
    updateUI();
  }, 4100);
}

function renderRouHistory() {
  if(rouHistory.length === 0) return;
  document.getElementById('rou-history').style.display = 'block';
  var list = document.getElementById('rou-hist-list');
  list.innerHTML = '';
  rouHistory.forEach(function(h) {
    var div = document.createElement('div');
    div.className = 'rou-hist-item ' + (h.won ? 'rou-hist-w' : 'rou-hist-l');
    div.innerHTML = '<span>'+h.tribe+'</span><span>'+(h.won ? '+'+h.payout : '-'+h.bet)+'</span>';
    list.appendChild(div);
  });
}

// COMPANION RACING
var raceBet=50,raceRacers=[],raceFinished=false,raceRound=0,raceSpinning=false,raceTrackLen=15;
var RACE_COLORS=['#a0f0ff','#ff6eb4','#ffd700','#8b4513'];

function showRacing(){
  document.getElementById('games-list').style.display='none';
  document.getElementById('racing-screen').style.display='block';
  document.getElementById('race-ore').textContent=S.ore;
  var compName='No companion selected';
  if(S.companion){var c=COMPANIONS.find(function(x){return x.id===S.companion});if(c)compName='Racing: '+c.name+' (Bond '+S.bond+'%)';}
  document.getElementById('race-comp-name').textContent=compName;
  renderRaceTrack();
  updateRacePot();
}

function hideRacing(){
  document.getElementById('games-list').style.display='block';
  document.getElementById('racing-screen').style.display='none';
  resetRace();
}

function resetRace(){
  raceRacers=[];raceFinished=false;raceRound=0;raceSpinning=false;
  document.getElementById('race-game-area').style.display='none';
  document.getElementById('race-controls').style.display='block';
  document.getElementById('race-result').innerHTML='';
  document.getElementById('race-msg').textContent='Guess the next card...';
  document.getElementById('race-start-btn').textContent='Start Race';
}

function changeRaceBet(delta){
  if(raceSpinning)return;
  raceBet=Math.max(10,Math.min(raceBet+delta,S.ore));
  document.getElementById('race-bet-val').textContent=raceBet;
  updateRacePot();
}

function updateRacePot(){
  document.getElementById('race-pot-display').textContent='Pot: '+(raceBet*4)+' MuddOre';
}

function startRace(){
  if(S.ore<raceBet)return;
  S.ore-=raceBet;document.getElementById('race-ore').textContent=S.ore;save();updateUI();
  var playerComp=COMPANIONS.find(function(x){return x.id===S.companion})||COMPANIONS[0];
  var ai1=COMPANIONS[Math.floor(Math.random()*5)];
  var ai2=COMPANIONS[Math.floor(Math.random()*5)];
  var ai3=COMPANIONS[Math.floor(Math.random()*5)];
  raceRacers=[
    {name:playerComp.name,img:playerComp.img,pos:0,isPlayer:true,bond:S.bond,eliminated:false},
    {name:ai1.name,img:ai1.img,pos:0,isPlayer:false,bond:Math.floor(Math.random()*60),eliminated:false},
    {name:ai2.name,img:ai2.img,pos:0,isPlayer:false,bond:Math.floor(Math.random()*60),eliminated:false},
    {name:ai3.name,img:ai3.img,pos:0,isPlayer:false,bond:Math.floor(Math.random()*60),eliminated:false}
  ];
  raceFinished=false;raceRound=0;raceSpinning=false;
  document.getElementById('race-controls').style.display='none';
  document.getElementById('race-game-area').style.display='block';
  renderRaceTrack();
  document.getElementById('race-msg').textContent='Round 1 \u2014 Guess RED or BLACK for '+playerComp.name;
}

function renderRaceTrack(){
  var area=document.getElementById('race-track-area');
  if(!area)return;
  if(raceRacers.length===0){area.innerHTML='';return;}
  var html='';
  raceRacers.forEach(function(r,i){
    var pct=(r.pos/raceTrackLen)*100;
    var cls=r.isPlayer?'rou-racer rou-racer-player':'rou-racer';
    html+='<div class="'+cls+'">';
    html+='<img class="rou-racer-img" src="'+r.img+'">';
    html+='<div class="rou-racer-info"><div class="rou-racer-name">'+r.name+'</div>';
    html+='<div class="rou-racer-track"><div class="rou-racer-fill" style="width:'+pct+'%;background:'+RACE_COLORS[i]+';"></div></div></div>';
    html+='<div class="rou-racer-pos">'+r.pos+'/'+raceTrackLen+'</div>';
    html+='</div>';
  });
  area.innerHTML=html;
}

function raceGuess(color){
  if(raceSpinning||raceFinished)return;
  raceSpinning=true;
  document.getElementById('race-btn-red').disabled=true;
  document.getElementById('race-btn-black').disabled=true;
  var cardColor=Math.random()<0.5?'red':'black';
  var cardSymbol=cardColor==='red'?'\u2665':'\u2663';
  var cardEl=document.getElementById('race-card-shown');
  cardEl.className='race-card '+cardColor;
  cardEl.textContent=cardSymbol;
  document.getElementById('race-msg').textContent=cardColor==='red'?'Red '+cardSymbol+' revealed':'Black '+cardSymbol+' revealed';
  
  var player=raceRacers.find(function(r){return r.isPlayer});
  var playerCorrect=cardColor===color;
  var bondBonus=(player.bond/100)*0.15;
  if(playerCorrect||Math.random()<bondBonus){
    player.pos++;
  }
  
  raceRacers.forEach(function(r){
    if(r.isPlayer)return;
    var aiGuess=Math.random()<0.5?'red':'black';
    var aiCorrect=cardColor===aiGuess;
    var aiBondBonus=(r.bond/100)*0.10;
    if(aiCorrect||Math.random()<aiBondBonus){
      r.pos++;
    }
  });
  
  raceRound++;
  renderRaceTrack();
  
  var winner=raceRacers.find(function(r){return r.pos>=raceTrackLen});
  if(winner){
    raceFinished=true;
    setTimeout(function(){finishRace(winner);},800);
    return;
  }
  
  setTimeout(function(){
    raceSpinning=false;
    cardEl.className='race-card back';
    cardEl.textContent='?';
    document.getElementById('race-btn-red').disabled=false;
    document.getElementById('race-btn-black').disabled=false;
    document.getElementById('race-msg').textContent='Round '+(raceRound+1)+' \u2014 Guess RED or BLACK';
  },1200);
}

function finishRace(winner){
  var won=winner.isPlayer;
  var payout=raceBet*4;
  var msg='';
  var resDiv=document.getElementById('race-result');
  
  if(won){
    S.ore+=payout;
    S.mudd=Math.floor(S.ore/1000);
    msg='\u{1F3C6} '+winner.name+' wins the race! +'+payout+' MuddOre!';
    resDiv.className='rou-result rou-win';
  }else{
    msg=winner.name+' wins. Your companion fell short.';
    resDiv.className='rou-result rou-lose';
  }
  resDiv.innerHTML=msg;
  document.getElementById('race-msg').textContent=won?'VICTORY':'Race over';
  document.getElementById('race-game-area').style.display='none';
  document.getElementById('race-ore').textContent=S.ore;
  save();updateUI();
  
  setTimeout(function(){
    document.getElementById('race-controls').style.display='block';
    document.getElementById('race-start-btn').textContent='Race Again';
    document.getElementById('race-start-btn').disabled=false;
  },1500);
}

// === INIT ===
function fullInitRender() {
  recalcBonuses();
  updateUI();
  if(S.companion) {
    var c = COMPANIONS.find(function(x){return x.id===S.companion});
    if(c) queenImg.src = c.img;
  }
  try { renderAvatar(); } catch(e){}
  try { renderJournal(); } catch(e){}
  try { renderStats(); } catch(e){}
}

recalcBonuses();
updateUI();
if(S.companion) {
  var c0 = COMPANIONS.find(function(x){return x.id===S.companion});
  if(c0) queenImg.src = c0.img;
}

// Telegram WebApp
if(window.Telegram && window.Telegram.WebApp) {
  Telegram.WebApp.ready();
  Telegram.WebApp.expand();
  try {
    var tgUser = Telegram.WebApp.initDataUnsafe && Telegram.WebApp.initDataUnsafe.user;
    if (tgUser && tgUser.id) {
      telegramId = String(tgUser.id);
      tgUsername = tgUser.username || '';
      tgFullName = ((tgUser.first_name||'') + ' ' + (tgUser.last_name||'')).trim();
      remoteLoad().then(fullInitRender);
    }
  } catch(e){}
}
</script>
</body>
</html>`;
  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" }
  });
});
