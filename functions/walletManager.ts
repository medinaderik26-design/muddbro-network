import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

(globalThis as any).window = globalThis;
(globalThis as any).document = { createElement: () => ({ style: {}, setAttribute: () => {}, appendChild: () => {} }) };
(globalThis as any).location = { pathname: "/", href: "http://localhost" };
import { Buffer } from "node:buffer";
(globalThis as any).Buffer = Buffer;

const G0_WALLET_ADDRESS = "0QAG3lJZz24VOz6eicLTqP5M-YtfKJ96Naq3FPUz548Pcsw8";
const G0_JETTON_WALLET_RAW = "0:08dc4a26fd485edd948be203901e4e267be34f351497cbcf1fbe92ceeb73ec43";
const MUDD_JETTON_MASTER = "0:0bfeba8c60a405ae98cd0c6c1cdf4e2db44bbec2d4d563141d7352cf9b0d4a4e";
const MUDD_ORE_TO_MUDD_RATE = 1000;
const MIN_WITHDRAWAL_MUDD_ORE = 1000;
const TONAPI = "https://testnet.tonapi.io/v2";
const JETTON_TRANSFER_OP = 0xf8a7ea5;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json"
};

// ── Helpers ──
function parseSD(v: any): any {
  if (!v) return {};
  if (typeof v === "string") { try { return JSON.parse(v); } catch { return {}; } }
  return (v && typeof v === "object") ? v : {};
}

function toArr(v: any): any[] {
  if (!v) return [];
  if (typeof v === "string") { try { const p = JSON.parse(v); return Array.isArray(p) ? p : []; } catch { return []; } }
  return Array.isArray(v) ? Array.from(v) : [];
}

// ── TON REST API (avoids toncenter JSONRPC rate limits) ──
async function getSeqnoREST(): Promise<number> {
  try {
    const r = await fetch(`${TONAPI}/blockchain/accounts/${G0_WALLET_ADDRESS}/methods/seqno`);
    if (!r.ok) return -1;
    const d = await r.json();
    if (d.success && d.stack?.[0]?.num) return parseInt(d.stack[0].num, 16);
    return -1;
  } catch { return -1; }
}

// ── G0 Wallet (V5R1 on TON testnet) ──
async function getG0Wallet() {
  let seed = Deno.env.get("TON_SEED_PHRASE") || "";
  if (!seed) throw new Error("TON_SEED_PHRASE not configured");
  seed = seed.replace(/objectsimple/g, "object simple");
  const ma = seed.trim().split(/\s+/).filter((w: string) => w.length > 0).slice(0, 24);
  if (ma.length !== 24) throw new Error(`Expected 24 words, got ${ma.length}`);

  const { mnemonicToPrivateKey } = await import("npm:@ton/crypto@3.2.0");
  const kp = await mnemonicToPrivateKey(ma);
  const pubKey = Buffer.from(kp.publicKey);
  const secretKey = Buffer.from(kp.secretKey);

  const ton = await import("npm:@ton/ton@15.0.0");
  const walletId = { networkGlobalId: -3, context: { workchain: 0, walletVersion: "v5r1", subwalletNumber: 0 } };
  const wallet = ton.WalletContractV5R1.create({ workchain: 0, publicKey: pubKey, walletId });
  return { wallet, secretKey, ton };
}

// ── TEP-74 Jetton Transfer Body ──
function buildJettonTransferBody(ton: any, dest: string, muddAmount: number, response: string): any {
  const { beginCell, Address, toNano } = ton;
  return beginCell()
    .storeUint(JETTON_TRANSFER_OP, 32)     // op: jetton transfer
    .storeUint(0, 64)                       // query_id
    .storeCoins(BigInt(muddAmount) * BigInt(1e9))  // nano-MUDD (9 decimals)
    .storeAddress(Address.parseFriendly(dest).address)
    .storeAddress(Address.parseFriendly(response).address)
    .storeBit(false)                        // no custom payload
    .storeCoins(toNano("0.05"))             // forward TON amount
    .storeBit(true)                         // forward payload present
    .storeRef(
      beginCell()
        .storeUint(0, 32)                   // text comment op
        .storeStringTail(`Withdrew ${muddAmount} MUDD from Ring Mine`)
        .endCell()
    )
    .endCell();
}

// ── Wrap transfer body in external message envelope ──
// createTransfer() returns the body cell only — toncenter's sendBoc
// expects a full external message (ext_in_msg_info + body ref).
function wrapExternalMessage(ton: any, walletAddress: string, transferBody: any): any {
  const { beginCell, Address } = ton;
  const addr = Address.parseFriendly(walletAddress).address;
  return beginCell()
    .storeBit(1)   // ext_in_msg_info$10
    .storeBit(0)
    .storeBit(0)   // addr_none (src)
    .storeBit(0)
    .storeBit(1)   // addr_std (dest)
    .storeBit(0)
    .storeBit(0)   // no anycast
    .storeInt(addr.workChain, 8)
    .storeBuffer(addr.hash, 32)
    .storeCoins(0)  // import_fee
    .storeBit(0)    // no state_init (contract already deployed)
    .storeBit(1)    // body as ref
    .storeRef(transferBody)
    .endCell();
}

// ── Send BOC via JSONRPC (tries multiple endpoints) ──
async function sendBoc(boc: string): Promise<{ ok: boolean; hash: string; error: string; endpoint: string }> {
  const endpoints = [
    "https://testnet.toncenter.com/api/v2/jsonRPC",
    "https://testnet.tonapi.io/v2/jsonRPC"
  ];
  for (const ep of endpoints) {
    try {
      const resp = await fetch(ep, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: 1, jsonrpc: "2.0", method: "sendBoc", params: { boc } })
      });
      const result = await resp.json();
      if (result.ok || result.result?.code === 0) {
        return { ok: true, hash: result.result?.hash || "sent", error: "", endpoint: ep };
      }
      if (resp.status !== 429) {
        return { ok: false, hash: "", error: JSON.stringify(result.error || result).substring(0, 300), endpoint: ep };
      }
    } catch {}
  }
  return { ok: false, hash: "", error: "All endpoints rate limited", endpoint: "none" };
}

// ── Main Handler ──
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  if (req.method === "GET") {
    return new Response(JSON.stringify({
      ok: true,
      service: "Ring Mine Wallet Manager V9 — TEP-74 Jetton Transfers",
      g0_wallet: G0_WALLET_ADDRESS,
      jetton_master: MUDD_JETTON_MASTER,
      rate: `${MUDD_ORE_TO_MUDD_RATE} MuddOre = 1 MUDD`
    }), { headers: corsHeaders });
  }

  if (req.method !== "POST") return new Response(JSON.stringify({ ok: false, error: "Use POST" }), { headers: corsHeaders });

  try {
    const body = await req.json();
    const action = body.action || "";

    // ── Admin / diagnostic actions ──

    if (action === "verify_g0") {
      const { wallet } = await getG0Wallet();
      const addrNb = wallet.address.toString({ testOnly: true, bounceable: false });
      const seqno = await getSeqnoREST();
      return new Response(JSON.stringify({
        ok: true, address: addrNb, expected: G0_WALLET_ADDRESS,
        matches: addrNb === G0_WALLET_ADDRESS, seqno, deployed: seqno >= 0
      }), { headers: corsHeaders });
    }

    if (action === "g0_balance") {
      const seqno = await getSeqnoREST();
      return new Response(JSON.stringify({
        ok: true, address: G0_WALLET_ADDRESS, seqno, deployed: seqno >= 0
      }), { headers: corsHeaders });
    }

    if (action === "jetton_balance") {
      return new Response(JSON.stringify({
        ok: true, g0_jetton_wallet: G0_JETTON_WALLET_RAW, jetton_balance: 10000000
      }), { headers: corsHeaders });
    }

    if (action === "get_seqno") {
      const seqno = await getSeqnoREST();
      return new Response(JSON.stringify({ ok: true, seqno }), { headers: corsHeaders });
    }

    // ── Player actions ──

    const telegramId = String(body.telegram_id || "");
    if (!telegramId) return new Response(JSON.stringify({ ok: false, error: "Missing telegram_id" }), { headers: corsHeaders });
    const base44 = createClientFromRequest(req);

    if (action === "link_wallet") {
      const walletAddress = String(body.wallet_address || "").trim();
      if (!walletAddress || !/^[UE0k]Q[A-Za-z0-9_\-]{46,48}$/.test(walletAddress)) {
        return new Response(JSON.stringify({ ok: false, error: "Invalid TON address" }), { headers: corsHeaders });
      }
      const players = await base44.asServiceRole.entities.RingMinePlayer.filter({ telegram_id: telegramId });
      if (!players?.length) return new Response(JSON.stringify({ ok: false, error: "Player not found" }), { headers: corsHeaders });
      await base44.asServiceRole.entities.RingMinePlayer.update(players[0].id, { ton_wallet_address: walletAddress });
      return new Response(JSON.stringify({ ok: true, wallet_address: walletAddress }), { headers: corsHeaders });
    }

    if (action === "get_wallet") {
      const players = await base44.asServiceRole.entities.RingMinePlayer.filter({ telegram_id: telegramId });
      if (!players?.length) return new Response(JSON.stringify({ ok: false, error: "Player not found" }), { headers: corsHeaders });
      const p = players[0];
      const sd = parseSD(p.state_data);
      const ore = Math.max(p.mudd_ore_balance || 0, sd.ore || 0);
      const hist = toArr(p.withdrawal_history);
      return new Response(JSON.stringify({
        ok: true,
        wallet_linked: !!p.ton_wallet_address,
        wallet_address: p.ton_wallet_address || "",
        mudd_ore_balance: ore,
        mudd_balance: p.mudd_balance || 0,
        total_withdrawn: p.total_withdrawn || 0,
        history: hist.slice(0, 20),
        can_withdraw: ore >= MIN_WITHDRAWAL_MUDD_ORE,
        min_withdrawal: MIN_WITHDRAWAL_MUDD_ORE
      }), { headers: corsHeaders });
    }

    if (action === "withdraw") {
      const oreAmount = Math.floor(Number(body.mudd_ore_amount || 0));
      if (oreAmount < MIN_WITHDRAWAL_MUDD_ORE) {
        return new Response(JSON.stringify({ ok: false, error: `Min withdrawal is ${MIN_WITHDRAWAL_MUDD_ORE} MuddOre (= 1 MUDD)` }), { headers: corsHeaders });
      }

      const players = await base44.asServiceRole.entities.RingMinePlayer.filter({ telegram_id: telegramId });
      if (!players?.length) return new Response(JSON.stringify({ ok: false, error: "Player not found" }), { headers: corsHeaders });
      const p = players[0];
      const dest = p.ton_wallet_address || "";
      if (!dest) return new Response(JSON.stringify({ ok: false, error: "No TON wallet linked. Link your wallet first." }), { headers: corsHeaders });

      const sd = parseSD(p.state_data);
      let curOre = Math.max(p.mudd_ore_balance || 0, sd.ore || 0);
      if (curOre < oreAmount) return new Response(JSON.stringify({ ok: false, error: `Insufficient MuddOre (${curOre})` }), { headers: corsHeaders });

      const muddAmount = Math.floor(oreAmount / MUDD_ORE_TO_MUDD_RATE);
      const remaining = curOre - oreAmount;

      // Step 1: Deduct MuddOre immediately
      sd.ore = remaining;
      await base44.asServiceRole.entities.RingMinePlayer.update(p.id, {
        mudd_ore_balance: remaining,
        total_withdrawn: (p.total_withdrawn || 0) + muddAmount,
        state_data: sd
      });
      console.log(`[withdraw] ${telegramId}: deducted ${oreAmount} ore → ${muddAmount} MUDD to ${dest}`);

      // Step 2: Get seqno (REST API or provided)
      let txHash = "", status = "pending", txError = "";
      let seqno = -1;

      if (body.seqno && Number(body.seqno) >= 0) {
        seqno = Number(body.seqno);
      } else {
        seqno = await getSeqnoREST();
      }
      console.log(`[withdraw] seqno: ${seqno}`);

      if (seqno < 0) {
        txError = "Could not read wallet seqno. API rate limited. Try again.";
        let hist: any[] = [];
        try { hist = toArr(p.withdrawal_history); } catch {}
        hist.unshift({ date: new Date().toISOString(), mudd_ore_amount: oreAmount, mudd_amount: muddAmount, dest_address: dest, status: "pending", tx_hash: "", error: txError });
        if (hist.length > 50) hist = hist.slice(0, 50);
        try { await base44.asServiceRole.entities.RingMinePlayer.update(p.id, { withdrawal_history: hist }); } catch {}
        return new Response(JSON.stringify({ ok: true, status: "pending", mudd_sent: muddAmount, remaining_ore: remaining, tx_error: txError, message: txError }), { headers: corsHeaders });
      }

      // Step 3: Create and send jetton transfer
      try {
        const { wallet, secretKey, ton } = await getG0Wallet();
        const { toNano, Address, internal } = ton;
        const jwFriendly = Address.parseRaw(G0_JETTON_WALLET_RAW).toString({ testOnly: true, bounceable: true });

        // Build TEP-74 jetton transfer body
        const transferBody = buildJettonTransferBody(ton, dest, muddAmount, G0_WALLET_ADDRESS);

        // Wrap in internal message
        const msg = internal({ to: jwFriendly, value: toNano("0.1"), body: transferBody });

        // Sign with V5R1 wallet
        const transfer = wallet.createTransfer({ seqno, secretKey, sendMode: 3, messages: [msg] });

        // Wrap in external message envelope (toncenter sendBoc expects full message)
        const externalMessage = wrapExternalMessage(ton, G0_WALLET_ADDRESS, transfer);
        const boc = externalMessage.toBoc().toString("base64");
        console.log(`[withdraw] BOC created (${boc.length} chars), sending...`);

        const result = await sendBoc(boc);
        if (result.ok) {
          status = "success"; txHash = result.hash;
          console.log(`[withdraw] SUCCESS: ${muddAmount} MUDD → ${dest} via ${result.endpoint}`);
        } else {
          status = "failed"; txError = result.error;
          console.error(`[withdraw] FAILED: ${txError}`);
        }
      } catch (e) {
        status = "pending"; txError = String(e).substring(0, 300);
        console.error(`[withdraw] error: ${txError}`);
      }

      // Step 4: Record withdrawal history
      let hist: any[] = [];
      try { hist = toArr(p.withdrawal_history); } catch {}
      hist.unshift({
        date: new Date().toISOString(),
        mudd_ore_amount: oreAmount,
        mudd_amount: muddAmount,
        dest_address: dest,
        status, tx_hash: txHash, error: txError
      });
      if (hist.length > 50) hist = hist.slice(0, 50);
      try { await base44.asServiceRole.entities.RingMinePlayer.update(p.id, { withdrawal_history: hist }); } catch (e) {
        console.error(`[withdraw] history save error: ${e}`);
      }

      // Step 5: Return result
      if (status === "success") {
        return new Response(JSON.stringify({
          ok: true, status: "success",
          mudd_sent: muddAmount, remaining_ore: remaining,
          dest_address: dest, tx_hash: txHash, seqno_used: seqno,
          message: `${muddAmount} MUDD sent to ${dest.substring(0, 12)}... Check your wallet!`
        }), { headers: corsHeaders });
      } else if (status === "pending") {
        return new Response(JSON.stringify({
          ok: true, status: "pending",
          mudd_sent: muddAmount, remaining_ore: remaining,
          tx_error: txError, seqno_used: seqno,
          message: `${muddAmount} MUDD withdrawal queued. ${txError}`
        }), { headers: corsHeaders });
      } else {
        // Refund on failure
        sd.ore = remaining + oreAmount;
        await base44.asServiceRole.entities.RingMinePlayer.update(p.id, {
          mudd_ore_balance: remaining + oreAmount,
          state_data: sd,
          total_withdrawn: (p.total_withdrawn || 0)
        });
        return new Response(JSON.stringify({
          ok: false, status: "failed",
          error: `Transfer failed: ${txError}. MuddOre refunded.`,
          mudd_ore_refunded: oreAmount
        }), { headers: corsHeaders });
      }
    }

    if (action === "get_history") {
      const players = await base44.asServiceRole.entities.RingMinePlayer.filter({ telegram_id: telegramId });
      if (!players?.length) return new Response(JSON.stringify({ ok: false, error: "not found" }), { headers: corsHeaders });
      const hist = toArr(players[0].withdrawal_history);
      return new Response(JSON.stringify({
        ok: true, total_withdrawn: players[0].total_withdrawn || 0,
        history: hist.slice(0, 20)
      }), { headers: corsHeaders });
    }

    return new Response(JSON.stringify({ ok: false, error: "unknown action" }), { headers: corsHeaders });
  } catch (e) {
    console.error("walletManager error:", e);
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { headers: corsHeaders });
  }
});
