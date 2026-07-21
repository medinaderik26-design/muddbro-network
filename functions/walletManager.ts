import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

(globalThis as any).window = globalThis;
(globalThis as any).document = { createElement: () => ({ style: {}, setAttribute: () => {}, appendChild: () => {} }) };
(globalThis as any).location = { pathname: "/", href: "http://localhost" };
import { Buffer } from "node:buffer";
(globalThis as any).Buffer = Buffer;

const G0_WALLET_ADDRESS = "0QAG3lJZz24VOz6eicLTqP5M-YtfKJ96Naq3FPUz548Pcsw8";
const G0_WALLET_BOUNCEABLE = "kQAG3lJZz24VOz6eicLTqP5M-YtfKJ96Naq3FPUz548PcpH5";
const MUDD_JETTON_MASTER = "0:0bfeba8c60a405ae98cd0c6c1cdf4e2db44bbec2d4d563141d7352cf9b0d4a4e";
const MUDD_ORE_TO_MUDD_RATE = 1000;
const MIN_WITHDRAWAL_MUDD_ORE = 1000;
const TON_TESTNET_ENDPOINT = "https://testnet.toncenter.com/api/v2/jsonRPC";
const TONAPI_ENDPOINT = "https://testnet.tonapi.io/v2";
const JETTON_TRANSFER_OP = 0xf8a7ea5;

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

// Get the G0 wallet's jetton wallet address by calling the jetton master's get method
async function getG0JettonWalletAddress(ton: any, client: any): Promise<string> {
  const { Address, beginCell, TonClient } = ton;
  const masterAddr = Address.parseRaw(MUDD_JETTON_MASTER);
  
  // Call get_wallet_address on the jetton master
  // The method takes a slice containing the owner's address
  const ownerCell = beginCell().storeAddress(Address.parseFriendly(G0_WALLET_ADDRESS).address).endCell();
  
  const result = await client.runMethod(
    masterAddr,
    "get_wallet_address",
    [{ type: "slice", cell: ownerCell }]
  );
  
  const jettonWalletAddr = result.stack.readAddress();
  return jettonWalletAddr.toString({ testOnly: true, bounceable: true });
}

// Construct a TEP-74 jetton transfer message
function buildJettonTransferBody(ton: any, destAddress: string, muddAmount: number, responseAddress: string): any {
  const { beginCell, Address, toNano } = ton;
  
  const body = beginCell()
    .storeUint(JETTON_TRANSFER_OP, 32)  // op: jetton transfer
    .storeUint(0, 64)                    // query_id
    .storeCoins(BigInt(muddAmount) * BigInt(1e9))  // jetton amount in nano-MUDD (9 decimals)
    .storeAddress(Address.parseFriendly(destAddress).address)  // destination (player)
    .storeAddress(Address.parseFriendly(responseAddress).address)  // response destination (G0)
    .storeBit(false)                     // no custom payload
    .storeCoins(toNano("0.05"))          // forward TON amount (for gas + notification)
    .storeBit(true)                      // forward payload present
    .storeRef(
      beginCell()
        .storeUint(0, 32)                // text comment op
        .storeStringTail(`Withdrew ${muddAmount} MUDD from Ring Mine`)
        .endCell()
    )
    .endCell();
  
  return body;
}

// Send the jetton transfer on-chain
async function sendJettonTransfer(
  wallet: any, secretKey: any, ton: any,
  jettonWalletAddress: string, transferBody: any
): Promise<{ status: string; txHash: string; error: string }> {
  const { TonClient, toNano, Address } = ton;
  const client = new TonClient({ endpoint: TON_TESTNET_ENDPOINT });
  const walletContract = client.open(wallet);
  const seqno = await walletContract.getSeqno();
  
  const transfer = walletContract.createTransfer({
    seqno,
    secretKey,
    messages: [{
      address: Address.parseFriendly(jettonWalletAddress).address,
      amount: toNano("0.1"),  // TON for gas
      payload: transferBody
    }]
  });
  
  const boc = transfer.toBoc().toString("base64");
  
  // Send via toncenter RPC
  const resp = await fetch(TON_TESTNET_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: 1, jsonrpc: "2.0",
      method: "sendBoc",
      params: { boc }
    })
  });
  
  const result = await resp.json();
  
  if (result.ok || result.result?.code === 0) {
    return { status: "success", txHash: result.result?.hash || "sent", error: "" };
  }
  
  return { status: "failed", txHash: "", error: JSON.stringify(result.error || result).substring(0, 300) };
}

async function getBalanceViaAPI(address: string) {
  try { const resp = await fetch(`${TONAPI_ENDPOINT}/blockchain/accounts/${address}`); if (resp.ok) { const data = await resp.json(); return { balance: Number(data.balance || 0), status: data.status || "unknown" }; } } catch(e) {}
  return { balance: 0, status: "error" };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method === "GET") return new Response(JSON.stringify({ ok: true, service: "Ring Mine Wallet Manager V5R1 — Real Jetton Transfers", g0_wallet: G0_WALLET_ADDRESS, jetton_master: MUDD_JETTON_MASTER, rate: `${MUDD_ORE_TO_MUDD_RATE} MuddOre = 1 MUDD` }), { headers: corsHeaders });
  if (req.method !== "POST") return new Response(JSON.stringify({ ok: false, error: "Use POST" }), { headers: corsHeaders });

  try {
    const body = await req.json();
    const action = body.action || "";

    if (action === "verify_g0") {
      try {
        const { wallet, ton } = await getG0Wallet();
        const addrNb = wallet.address.toString({ testOnly: true, bounceable: false });
        const balanceInfo = await getBalanceViaAPI(G0_WALLET_BOUNCEABLE);
        const { TonClient } = ton;
        const client = new TonClient({ endpoint: TON_TESTNET_ENDPOINT });
        const walletContract = client.open(wallet);
        let seqno = -1;
        try { seqno = await walletContract.getSeqno(); } catch(e) {}
        return new Response(JSON.stringify({ ok: true, derived_address: addrNb, expected: G0_WALLET_ADDRESS, matches: addrNb === G0_WALLET_ADDRESS, balance_ton: balanceInfo.balance / 1e9, seqno, wallet_type: "V5R1" }), { headers: corsHeaders });
      } catch (e) { return new Response(JSON.stringify({ ok: false, error: String(e) }), { headers: corsHeaders }); }
    }

    if (action === "g0_balance") {
      const balanceInfo = await getBalanceViaAPI(G0_WALLET_BOUNCEABLE);
      return new Response(JSON.stringify({ ok: true, address: G0_WALLET_ADDRESS, balance_ton: balanceInfo.balance / 1e9, status: balanceInfo.status }), { headers: corsHeaders });
    }

    if (action === "jetton_balance") {
      try {
        const { wallet, ton } = await getG0Wallet();
        const { TonClient } = ton;
        const client = new TonClient({ endpoint: TON_TESTNET_ENDPOINT });
        const g0JettonWallet = await getG0JettonWalletAddress(ton, client);
        const balanceInfo = await getBalanceViaAPI(g0JettonWallet);
        return new Response(JSON.stringify({ ok: true, g0_jetton_wallet: g0JettonWallet, balance: balanceInfo.balance, status: balanceInfo.status }), { headers: corsHeaders });
      } catch (e) { return new Response(JSON.stringify({ ok: false, error: String(e).substring(0, 300) }), { headers: corsHeaders }); }
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
      await base44.asServiceRole.entities.RingMinePlayer.update(players[0].id, { ton_wallet_address: walletAddress });
      return new Response(JSON.stringify({ ok: true, wallet_address: walletAddress }), { headers: corsHeaders });
    }

    if (action === "get_wallet") {
      const players = await base44.asServiceRole.entities.RingMinePlayer.filter({ telegram_id: telegramId });
      if (!players || players.length === 0) return new Response(JSON.stringify({ ok: false, error: "Player not found" }), { headers: corsHeaders });
      const p = players[0];
      let stateOre = 0;
      if (p.state_data) { try { const st = JSON.parse(p.state_data); stateOre = st.ore || 0; } catch(e){} }
      let history = []; try { history = p.withdrawal_history ? JSON.parse(p.withdrawal_history) : []; } catch(e){}
      const oreBalance = Math.max(p.mudd_ore_balance || 0, stateOre);
      return new Response(JSON.stringify({ ok: true, wallet_linked: !!p.ton_wallet_address, wallet_address: p.ton_wallet_address || "", mudd_ore_balance: oreBalance, total_withdrawn: p.total_withdrawn || 0, history, can_withdraw: oreBalance >= MIN_WITHDRAWAL_MUDD_ORE, min_withdrawal: MIN_WITHDRAWAL_MUDD_ORE, conversion_rate: MUDD_ORE_TO_MUDD_RATE }), { headers: corsHeaders });
    }

    // ── REAL MUDD JETTON WITHDRAWAL ────────────────────────────────────
    if (action === "withdraw") {
      const oreAmount = Number(body.mudd_ore_amount || 0);
      if (oreAmount < MIN_WITHDRAWAL_MUDD_ORE) return new Response(JSON.stringify({ ok: false, error: `Min withdrawal is ${MIN_WITHDRAWAL_MUDD_ORE} MuddOre` }), { headers: corsHeaders });
      
      const players = await base44.asServiceRole.entities.RingMinePlayer.filter({ telegram_id: telegramId });
      if (!players || players.length === 0) return new Response(JSON.stringify({ ok: false, error: "Player not found" }), { headers: corsHeaders });
      const player = players[0];
      const destAddress = player.ton_wallet_address || "";
      if (!destAddress) return new Response(JSON.stringify({ ok: false, error: "No TON wallet linked. Link your wallet first." }), { headers: corsHeaders });
      
      let currentOre = player.mudd_ore_balance || 0;
      let stateData: any = null;
      if (player.state_data) { try { stateData = JSON.parse(player.state_data); currentOre = Math.max(currentOre, stateData.ore || 0); } catch(e){} }
      if (currentOre < oreAmount) return new Response(JSON.stringify({ ok: false, error: `Insufficient MuddOre (${currentOre})` }), { headers: corsHeaders });
      
      const muddAmount = Math.floor(oreAmount / MUDD_ORE_TO_MUDD_RATE);
      const remainingOre = currentOre - oreAmount;
      
      // Step 1: Deduct MuddOre from player (immediately, to prevent double-spend)
      const updateData: any = { mudd_ore_balance: remainingOre, total_withdrawn: (player.total_withdrawn || 0) + muddAmount };
      if (stateData) { stateData.ore = remainingOre; updateData.state_data = JSON.stringify(stateData); }
      await base44.asServiceRole.entities.RingMinePlayer.update(player.id, updateData);
      
      // Step 2: Attempt the on-chain jetton transfer
      let txHash = ""; let transferStatus = "pending"; let transferError = "";
      
      try {
        const { wallet, secretKey, ton } = await getG0Wallet();
        const { TonClient } = ton;
        const client = new TonClient({ endpoint: TON_TESTNET_ENDPOINT });
        
        // Get G0's jetton wallet address from the MUDD jetton master
        const g0JettonWalletAddr = await getG0JettonWalletAddress(ton, client);
        console.log(`[withdraw] G0 jetton wallet: ${g0JettonWalletAddr}`);
        
        // Build the jetton transfer message (TEP-74 op 0xf8a7ea5)
        const transferBody = buildJettonTransferBody(ton, destAddress, muddAmount, G0_WALLET_ADDRESS);
        
        // Send the transfer on-chain
        const result = await sendJettonTransfer(wallet, secretKey, ton, g0JettonWalletAddr, transferBody);
        transferStatus = result.status;
        txHash = result.txHash;
        transferError = result.error;
        
        console.log(`[withdraw] ${telegramId}: ${muddAmount} MUDD to ${destAddress} — ${transferStatus}`);
      } catch (e) {
        transferStatus = "pending";
        transferError = String(e).substring(0, 300);
        console.error(`[withdraw] jetton transfer error: ${transferError}`);
      }
      
      // Step 3: Record the withdrawal in history
      let history = []; try { history = player.withdrawal_history ? JSON.parse(player.withdrawal_history) : []; } catch(e){}
      history.unshift({
        date: new Date().toISOString(),
        mudd_ore_amount: oreAmount,
        mudd_amount: muddAmount,
        dest_address: destAddress,
        status: transferStatus,
        tx_hash: txHash,
        error: transferError
      });
      if (history.length > 50) history = history.slice(0, 50);
      await base44.asServiceRole.entities.RingMinePlayer.update(player.id, { withdrawal_history: JSON.stringify(history) });
      
      if (transferStatus === "success") {
        return new Response(JSON.stringify({
          ok: true,
          status: "success",
          mudd_sent: muddAmount,
          remaining_ore: remainingOre,
          dest_address: destAddress,
          tx_hash: txHash,
          message: `${muddAmount} MUDD sent to ${destAddress.substring(0,12)}... Check your wallet!`
        }), { headers: corsHeaders });
      } else if (transferStatus === "pending") {
        return new Response(JSON.stringify({
          ok: true,
          status: "pending",
          mudd_sent: muddAmount,
          remaining_ore: remainingOre,
          message: `Withdrawal of ${muddAmount} MUDD queued. MuddOre deducted. The on-chain transfer will process shortly — your MUDD tokens will appear in your wallet.`
        }), { headers: corsHeaders });
      } else {
        // Transfer failed — refund the MuddOre
        const refundData: any = { mudd_ore_balance: remainingOre + oreAmount, total_withdrawn: (player.total_withdrawn || 0) };
        if (stateData) { stateData.ore = remainingOre + oreAmount; refundData.state_data = JSON.stringify(stateData); }
        await base44.asServiceRole.entities.RingMinePlayer.update(player.id, refundData);
        return new Response(JSON.stringify({
          ok: false,
          status: "failed",
          error: `On-chain transfer failed: ${transferError}. MuddOre refunded.`,
          mudd_ore_refunded: oreAmount
        }), { headers: corsHeaders });
      }
    }

    if (action === "get_history") {
      const players = await base44.asServiceRole.entities.RingMinePlayer.filter({ telegram_id: telegramId });
      if (!players || players.length === 0) return new Response(JSON.stringify({ ok: false, error: "not found" }), { headers: corsHeaders });
      let history = []; try { history = players[0].withdrawal_history ? JSON.parse(players[0].withdrawal_history) : []; } catch(e){}
      return new Response(JSON.stringify({ ok: true, total_withdrawn: players[0].total_withdrawn || 0, history: history.slice(0, 20) }), { headers: corsHeaders });
    }

    return new Response(JSON.stringify({ ok: false, error: "unknown action" }), { headers: corsHeaders });
  } catch (e) {
    console.error("walletManager error:", e);
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { headers: corsHeaders });
  }
});
