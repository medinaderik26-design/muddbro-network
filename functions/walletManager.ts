import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

(globalThis as any).window = globalThis;
(globalThis as any).document = { createElement: () => ({ style: {}, setAttribute: () => {}, appendChild: () => {} }) };
(globalThis as any).location = { pathname: "/", href: "http://localhost" };
import { Buffer } from "node:buffer";
(globalThis as any).Buffer = Buffer;

const G0_WALLET_ADDRESS = "0QAG3lJZz24VOz6eicLTqP5M-YtfKJ96Naq3FPUz548Pcsw8";
const G0_WALLET_BOUNCEABLE = "kQAG3lJZz24VOz6eicLTqP5M-YtfKJ96Naq3FPUz548PcpH5";
const MUDD_ORE_TO_MUDD_RATE = 1000;
const MIN_WITHDRAWAL_MUDD_ORE = 1000;
const TON_TESTNET_ENDPOINT = "https://testnet.toncenter.com/api/v2/jsonRPC";
const TONAPI_ENDPOINT = "https://testnet.tonapi.io/v2";

const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, GET, OPTIONS", "Access-Control-Allow-Headers": "Content-Type", "Content-Type": "application/json" };

async function getG0Wallet() {
  let seed = Deno.env.get("TON_SEED_PHRASE") || "";
  if (!seed) throw new Error("TON_SEED_PHRASE not configured");
  seed = seed.replace(/objectsimple/g, "object simple");
  const mnemonicArray = seed.trim().split(/\s+/).filter((w: string) => w.length > 0).slice(0, 24);
  if (mnemonicArray.length !== 24) throw new Error(`Expected 24 words, got ${mnemonicArray.length}`);
  const { mnemonicToPrivateKey } = await import("npm:@ton/crypto@3.2.0");
  const kp = await mnemonicToPrivateKey(mnemonicArray);
  const pubKey = Buffer.from(kp.publicKey);
  const secretKey = Buffer.from(kp.secretKey);
  const ton = await import("npm:@ton/ton@15.0.0");
  const walletId = { networkGlobalId: -3, context: { workchain: 0, walletVersion: "v5r1", subwalletNumber: 0 } };
  const wallet = ton.WalletContractV5R1.create({ workchain: 0, publicKey: pubKey, walletId });
  return { wallet, pubKey, secretKey, ton };
}

async function getBalanceViaAPI(address: string) {
  try { const resp = await fetch(`${TONAPI_ENDPOINT}/blockchain/accounts/${address}`); if (resp.ok) { const data = await resp.json(); return { balance: Number(data.balance || 0), status: data.status || "unknown" }; } } catch(e) {}
  return { balance: 0, status: "error" };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method === "GET") return new Response(JSON.stringify({ ok: true, service: "Ring Mine Wallet Manager V5R1", g0_wallet: G0_WALLET_ADDRESS, rate: `${MUDD_ORE_TO_MUDD_RATE} MuddOre = 1 MUDD` }), { headers: corsHeaders });
  if (req.method !== "POST") return new Response(JSON.stringify({ ok: false, error: "Use POST" }), { headers: corsHeaders });

  try {
    const body = await req.json();
    const action = body.action || "";

    if (action === "verify_g0") {
      try {
        const { wallet, ton } = await getG0Wallet();
        const addrNb = wallet.address.toString({ testOnly: true, bounceable: false });
        const addrB = wallet.address.toString({ testOnly: true, bounceable: true });
        const balanceInfo = await getBalanceViaAPI(addrB);
        const { TonClient } = ton;
        const client = new TonClient({ endpoint: TON_TESTNET_ENDPOINT });
        const walletContract = client.open(wallet);
        let seqno = -1;
        try { seqno = await walletContract.getSeqno(); } catch(e) {}
        return new Response(JSON.stringify({ ok: true, derived_address: addrNb, bounceable: addrB, expected: G0_WALLET_ADDRESS, matches: addrNb === G0_WALLET_ADDRESS, balance_ton: balanceInfo.balance / 1e9, status: balanceInfo.status, seqno, wallet_type: "V5R1", network_global_id: -3 }), { headers: corsHeaders });
      } catch (e) { return new Response(JSON.stringify({ ok: false, error: String(e), stack: (e as any)?.stack?.substring(0, 500) }), { headers: corsHeaders }); }
    }

    if (action === "g0_balance") {
      const balanceInfo = await getBalanceViaAPI(G0_WALLET_BOUNCEABLE);
      return new Response(JSON.stringify({ ok: true, address: G0_WALLET_ADDRESS, balance_ton: balanceInfo.balance / 1e9, status: balanceInfo.status }), { headers: corsHeaders });
    }

    const telegramId = String(body.telegram_id || "");
    if (!telegramId) return new Response(JSON.stringify({ ok: false, error: "Missing telegram_id" }), { headers: corsHeaders });
    const base44 = createClientFromRequest(req);

    if (action === "link_wallet") {
      const walletAddress = String(body.wallet_address || "").trim();
      if (!walletAddress) return new Response(JSON.stringify({ ok: false, error: "Missing wallet_address" }), { headers: corsHeaders });
      if (!/^[UE0k]Q[A-Za-z0-9_\-]{46,48}$/.test(walletAddress)) return new Response(JSON.stringify({ ok: false, error: "Invalid TON address" }), { headers: corsHeaders });
      const players = await base44.asServiceRole.entities.RingMinePlayer.filter({ telegram_id: telegramId });
      if (!players || players.length === 0) return new Response(JSON.stringify({ ok: false, error: "Player not found" }), { headers: corsHeaders });
      const player = players[0];
      await base44.asServiceRole.entities.RingMinePlayer.update(player.id, { ton_wallet_address: walletAddress });
      if (player.state_data) { try { const st = JSON.parse(player.state_data); st.tonWallet = walletAddress; await base44.asServiceRole.entities.RingMinePlayer.update(player.id, { state_data: JSON.stringify(st) }); } catch(e){} }
      return new Response(JSON.stringify({ ok: true, wallet_address: walletAddress }), { headers: corsHeaders });
    }

    if (action === "get_wallet") {
      const players = await base44.asServiceRole.entities.RingMinePlayer.filter({ telegram_id: telegramId });
      if (!players || players.length === 0) return new Response(JSON.stringify({ ok: false, error: "Player not found" }), { headers: corsHeaders });
      const player = players[0];
      let stateOre = 0;
      if (player.state_data) { try { const st = JSON.parse(player.state_data); stateOre = st.ore || 0; } catch(e){} }
      let history = []; try { history = player.withdrawal_history ? JSON.parse(player.withdrawal_history) : []; } catch(e){}
      const oreBalance = Math.max(player.mudd_ore_balance || 0, stateOre);
      return new Response(JSON.stringify({ ok: true, wallet_linked: !!player.ton_wallet_address, wallet_address: player.ton_wallet_address || "", mudd_ore_balance: oreBalance, total_withdrawn: player.total_withdrawn || 0, history, can_withdraw: oreBalance >= MIN_WITHDRAWAL_MUDD_ORE, min_withdrawal: MIN_WITHDRAWAL_MUDD_ORE, conversion_rate: MUDD_ORE_TO_MUDD_RATE }), { headers: corsHeaders });
    }

    if (action === "withdraw") {
      const oreAmount = Number(body.mudd_ore_amount || 0);
      if (oreAmount < MIN_WITHDRAWAL_MUDD_ORE) return new Response(JSON.stringify({ ok: false, error: `Min withdrawal is ${MIN_WITHDRAWAL_MUDD_ORE} MuddOre` }), { headers: corsHeaders });
      const players = await base44.asServiceRole.entities.RingMinePlayer.filter({ telegram_id: telegramId });
      if (!players || players.length === 0) return new Response(JSON.stringify({ ok: false, error: "Player not found" }), { headers: corsHeaders });
      const player = players[0];
      const destAddress = player.ton_wallet_address || "";
      if (!destAddress) return new Response(JSON.stringify({ ok: false, error: "No TON wallet linked" }), { headers: corsHeaders });
      let currentOre = player.mudd_ore_balance || 0;
      let stateData: any = null;
      if (player.state_data) { try { stateData = JSON.parse(player.state_data); currentOre = Math.max(currentOre, stateData.ore || 0); } catch(e){} }
      if (currentOre < oreAmount) return new Response(JSON.stringify({ ok: false, error: `Insufficient MuddOre (${currentOre})` }), { headers: corsHeaders });
      const muddAmount = Math.floor(oreAmount / MUDD_ORE_TO_MUDD_RATE);
      const remainingOre = currentOre - oreAmount;
      const updateData: any = { mudd_ore_balance: remainingOre, total_withdrawn: (player.total_withdrawn || 0) + muddAmount };
      if (stateData) { stateData.ore = remainingOre; updateData.state_data = JSON.stringify(stateData); }
      await base44.asServiceRole.entities.RingMinePlayer.update(player.id, updateData);

      let txHash = ""; let transferStatus = "pending"; let transferError = "";
      try {
        const { wallet, secretKey, ton } = await getG0Wallet();
        const { TonClient, toNano, beginCell } = ton;
        const client = new TonClient({ endpoint: TON_TESTNET_ENDPOINT });
        const walletContract = client.open(wallet);
        const transfer = walletContract.createTransfer({ seqno: await walletContract.getSeqno(), secretKey, messages: [{ address: destAddress, amount: toNano("0.01"), payload: beginCell().storeUint(0, 32).storeBuffer(Buffer.from(`MUDD: ${muddAmount}`)).endCell() }] });
        const resp = await fetch("https://testnet.toncenter.com/api/v2/jsonRPC", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: 1, jsonrpc: "2.0", method: "sendBoc", params: { boc: transfer.toBoc().toString("base64") } }) });
        const result = await resp.json();
        if (result.ok || result.result?.code === 0) { transferStatus = "success"; txHash = result.result?.hash || "sent"; } else { transferStatus = "failed"; transferError = JSON.stringify(result.error || result); }
      } catch(e) { transferStatus = "failed"; transferError = String(e).substring(0, 300); }

      let history = []; try { history = player.withdrawal_history ? JSON.parse(player.withdrawal_history) : []; } catch(e){}
      history.unshift({ date: new Date().toISOString(), mudd_ore_amount: oreAmount, mudd_amount: muddAmount, dest_address: destAddress, status: transferStatus, tx_hash: txHash, error: transferError });
      await base44.asServiceRole.entities.RingMinePlayer.update(player.id, { withdrawal_history: JSON.stringify(history) });
      return new Response(JSON.stringify({ ok: transferStatus === "success", status: transferStatus, mudd_amount: muddAmount, mudd_ore_remaining: remainingOre, tx_hash: txHash, error: transferError || undefined }), { headers: corsHeaders });
    }

    return new Response(JSON.stringify({ ok: false, error: "Unknown action" }), { headers: corsHeaders });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e), stack: (e as any)?.stack?.substring(0, 500) }), { headers: corsHeaders });
  }
});
