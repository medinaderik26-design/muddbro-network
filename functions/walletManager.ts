import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Shim: @ton/crypto references `window` — polyfill for Deno
(globalThis as any).window = globalThis;
(globalThis as any).document = { createElement: () => ({ style: {}, setAttribute: () => {}, appendChild: () => {} }) };
import { Buffer } from "node:buffer";
(globalThis as any).Buffer = Buffer;

const G0_ARCHITECT_WALLET = "UQAYOzRSA7UkfOpdfsvU0MRZdgJU95lnCrwQWQehW60E-Rrk";
const MUDD_JETTON_MASTER = "0QAG3lJZz24VOz6eicLTqP5M-YtfKJ96Naq3FPUz548Pcsw8";
const MUDD_ORE_TO_MUDD_RATE = 1000;
const MIN_WITHDRAWAL_MUDD_ORE = 1000;
const TON_TESTNET_ENDPOINT = "https://testnet.toncenter.com/api/v2/jsonRPC";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    });
  }

  if (req.method === "GET") {
    return new Response(JSON.stringify({
      ok: true,
      service: "Ring Mine Wallet Manager — On-Chain",
      network: "TON Testnet",
      g0_wallet: G0_ARCHITECT_WALLET,
      jetton_master: MUDD_JETTON_MASTER,
      rate: `${MUDD_ORE_TO_MUDD_RATE} MuddOre = 1 MUDD`,
      min_withdrawal: MIN_WITHDRAWAL_MUDD_ORE
    }), { headers: { "Content-Type": "application/json" } });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, error: "Use POST" }), {
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const body = await req.json();
    const base44 = createClientFromRequest(req);
    const telegramId = String(body.telegram_id || "");

    if (!telegramId) {
      return new Response(JSON.stringify({ ok: false, error: "Missing telegram_id" }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // ── LINK WALLET ──
    if (body.action === "link_wallet") {
      const walletAddress = String(body.wallet_address || "").trim();
      if (!walletAddress) {
        return new Response(JSON.stringify({ ok: false, error: "Missing wallet_address" }), {
          headers: { "Content-Type": "application/json" }
        });
      }
      const validAddress = /^[UE0]Q[A-Za-z0-9_\-]{46,48}$/.test(walletAddress);
      if (!validAddress) {
        return new Response(JSON.stringify({ ok: false, error: "Invalid TON address format" }), {
          headers: { "Content-Type": "application/json" }
        });
      }
      const players = await base44.asServiceRole.entities.RingMinePlayer.filter({ telegram_id: telegramId });
      if (!players || players.length === 0) {
        return new Response(JSON.stringify({ ok: false, error: "Player not found" }), {
          headers: { "Content-Type": "application/json" }
        });
      }
      const player = players[0];
      await base44.asServiceRole.entities.RingMinePlayer.update(player.id, { ton_wallet_address: walletAddress });
      if (player.state_data) {
        try { const st = JSON.parse(player.state_data); st.tonWallet = walletAddress; await base44.asServiceRole.entities.RingMinePlayer.update(player.id, { state_data: JSON.stringify(st) }); } catch(e){}
      }
      return new Response(JSON.stringify({ ok: true, wallet_address: walletAddress }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // ── GET WALLET ──
    if (body.action === "get_wallet") {
      const players = await base44.asServiceRole.entities.RingMinePlayer.filter({ telegram_id: telegramId });
      if (!players || players.length === 0) {
        return new Response(JSON.stringify({ ok: false, error: "Player not found" }), {
          headers: { "Content-Type": "application/json" }
        });
      }
      const player = players[0];
      let stateOre = 0;
      if (player.state_data) { try { const st = JSON.parse(player.state_data); stateOre = st.ore || 0; } catch(e){} }
      let history = [];
      try { history = player.withdrawal_history ? JSON.parse(player.withdrawal_history) : []; } catch(e){}
      return new Response(JSON.stringify({
        ok: true,
        wallet_linked: !!player.ton_wallet_address,
        wallet_address: player.ton_wallet_address || "",
        mudd_ore_balance: Math.max(player.mudd_ore_balance || 0, stateOre),
        total_withdrawn: player.total_withdrawn || 0,
        history,
        can_withdraw: Math.max(player.mudd_ore_balance || 0, stateOre) >= MIN_WITHDRAWAL_MUDD_ORE,
        min_withdrawal: MIN_WITHDRAWAL_MUDD_ORE
      }), { headers: { "Content-Type": "application/json" } });
    }

    // ── VERIFY G0 WALLET ──
    if (body.action === "verify_g0") {
      try {
        const seedPhrase = Deno.env.get("TON_SEED_PHRASE") || "";
        if (!seedPhrase) {
          return new Response(JSON.stringify({ ok: false, error: "No seed phrase configured" }), {
            headers: { "Content-Type": "application/json" }
          });
        }
        
        // Manual key derivation using Web Crypto API + tweetnacl
        const mnemonicArray = seedPhrase.trim().split(/\s+/);
        const mnemonicStr = mnemonicArray.join(" ");
        
        // Step 1: PBKDF2-SHA512 to derive seed (TON specification)
        const enc = new TextEncoder();
        const keyMaterial = await crypto.subtle.importKey(
          "raw",
          enc.encode(mnemonicStr),
          { name: "PBKDF2" },
          false,
          ["deriveBits"]
        );
        const seedBuffer = await crypto.subtle.deriveBits(
          {
            name: "PBKDF2",
            salt: enc.encode("TON fast seed version"),
            iterations: 100000,
            hash: "SHA-512"
          },
          keyMaterial,
          512 // 64 bytes
        );
        const seed = new Uint8Array(seedBuffer);
        const ed25519Seed = seed.slice(0, 32); // First 32 bytes for Ed25519
        
        // Step 2: Ed25519 keypair from seed
        const nacl = await import("npm:tweetnacl@1.0.3");
        const keyPair = nacl.sign.keyPair.fromSeed(ed25519Seed);
        
        // Step 3: Derive wallet address using @ton/ton
        const { TonClient, WalletContractV4 } = await import("npm:@ton/ton@15.0.0");
        const wallet = WalletContractV4.create({ workchain: 0, publicKey: Buffer.from(keyPair.publicKey) });
        const derivedAddress = wallet.address.toString({ testOnly: true, bounceable: true });
        
        // Step 4: Check balance
        const client = new TonClient({ endpoint: TON_TESTNET_ENDPOINT });
        const walletContract = client.open(wallet);
        const balance = await walletContract.getBalance();

        return new Response(JSON.stringify({
          ok: true,
          derived_address: derivedAddress,
          expected_address: G0_ARCHITECT_WALLET,
          matches: derivedAddress === G0_ARCHITECT_WALLET,
          balance_ton: Number(balance) / 1e9,
          seed_word_count: mnemonicArray.length
        }), { headers: { "Content-Type": "application/json" } });
      } catch (e) {
        return new Response(JSON.stringify({ ok: false, error: String(e), stack: (e as any)?.stack?.substring(0, 500) }), {
          headers: { "Content-Type": "application/json" }
        });
      }
    }

    // ── WITHDRAW ──
    if (body.action === "withdraw") {
      const oreAmount = Number(body.mudd_ore_amount || 0);
      if (oreAmount < MIN_WITHDRAWAL_MUDD_ORE) {
        return new Response(JSON.stringify({ ok: false, error: `Minimum withdrawal is ${MIN_WITHDRAWAL_MUDD_ORE} MuddOre` }), {
          headers: { "Content-Type": "application/json" }
        });
      }
      const players = await base44.asServiceRole.entities.RingMinePlayer.filter({ telegram_id: telegramId });
      if (!players || players.length === 0) {
        return new Response(JSON.stringify({ ok: false, error: "Player not found" }), {
          headers: { "Content-Type": "application/json" }
        });
      }
      const player = players[0];
      const walletAddress = player.ton_wallet_address || "";
      if (!walletAddress) {
        return new Response(JSON.stringify({ ok: false, error: "No TON wallet linked" }), {
          headers: { "Content-Type": "application/json" }
        });
      }
      let currentOre = player.mudd_ore_balance || 0;
      let stateData: any = null;
      if (player.state_data) {
        try { stateData = JSON.parse(player.state_data); currentOre = Math.max(currentOre, stateData.ore || 0); } catch(e){}
      }
      if (currentOre < oreAmount) {
        return new Response(JSON.stringify({ ok: false, error: `Insufficient MuddOre (${currentOre})` }), {
          headers: { "Content-Type": "application/json" }
        });
      }
      const muddAmount = Math.floor(oreAmount / MUDD_ORE_TO_MUDD_RATE);
      const remainingOre = currentOre - oreAmount;
      const updateData: any = {
        mudd_ore_balance: remainingOre,
        total_withdrawn: (player.total_withdrawn || 0) + muddAmount
      };
      if (stateData) { stateData.ore = remainingOre; updateData.state_data = JSON.stringify(stateData); }
      await base44.asServiceRole.entities.RingMinePlayer.update(player.id, updateData);

      let txHash = "";
      let transferStatus = "pending";
      let transferError = "";

      try {
        const seedPhrase = Deno.env.get("TON_SEED_PHRASE") || "";
        if (!seedPhrase) {
          transferError = "G0 wallet not configured";
        } else {
          // Derive keypair manually
          const mnemonicArray = seedPhrase.trim().split(/\s+/);
          const enc = new TextEncoder();
          const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(mnemonicArray.join(" ")), { name: "PBKDF2" }, false, ["deriveBits"]);
          const seedBuffer = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: enc.encode("TON fast seed version"), iterations: 100000, hash: "SHA-512" }, keyMaterial, 512);
          const ed25519Seed = new Uint8Array(seedBuffer).slice(0, 32);
          const nacl = await import("npm:tweetnacl@1.0.3");
          const keyPair = nacl.sign.keyPair.fromSeed(ed25519Seed);
          
          // Open wallet
          const { TonClient, WalletContractV4, beginCell, toNano, Address, internal, SendMode } = await import("npm:@ton/ton@15.0.0");
          const wallet = WalletContractV4.create({ workchain: 0, publicKey: Buffer.from(keyPair.publicKey) });
          const client = new TonClient({ endpoint: TON_TESTNET_ENDPOINT });
          const walletContract = client.open(wallet);
          const balance = await walletContract.getBalance();
          
          if (balance < toNano("0.05")) {
            transferError = `G0 wallet balance too low (${Number(balance) / 1e9} TON). Need TON for gas.`;
            transferStatus = "insufficient_gas";
          } else {
            // Build jetton transfer
            const jettonTransferBody = beginCell()
              .storeUint(0xf8a8ea, 32)
              .storeUint(0, 64)
              .storeCoins(muddAmount * 1000000000)
              .storeAddress(Address.parse(walletAddress))
              .storeAddress(Address.parse(walletAddress))
              .storeUint(0, 1)
              .storeCoins(toNano("0.02"))
              .storeUint(0, 1)
              .endCell();

            // Get sender's jetton wallet address
            let jettonWalletAddr: any;
            try {
              const getWalletAddrBody = beginCell().storeAddress(wallet.address).endCell();
              const result = await client.runMethod(Address.parse(MUDD_JETTON_MASTER), "get_wallet_address", [{ type: "slice", cell: getWalletAddrBody }]);
              jettonWalletAddr = result.stack.readAddress();
            } catch (getterErr) {
              jettonWalletAddr = Address.parse(MUDD_JETTON_MASTER);
            }

            const seqno = await walletContract.getSeqno();
            const transfer = walletContract.createTransfer({
              seqno,
              secretKey: Buffer.from(keyPair.secretKey),
              messages: [internal({ to: jettonWalletAddr, value: toNano("0.1"), body: jettonTransferBody, sendMode: SendMode.PAY_GAS_SEPARATELY })]
            });

            txHash = await walletContract.send(transfer) as string;
            transferStatus = "confirmed";
          }
        }
      } catch (chainErr) {
        transferError = String(chainErr);
        transferStatus = "failed";
      }

      // Record history
      const withdrawalRecord = { date: new Date().toISOString(), mudd_ore_amount: oreAmount, mudd_sent: muddAmount, wallet: walletAddress, tx_hash: txHash, status: transferStatus, error: transferError || undefined };
      let history: any[] = [];
      try { history = player.withdrawal_history ? JSON.parse(player.withdrawal_history) : []; } catch(e){}
      history.push(withdrawalRecord);
      if (history.length > 50) history = history.slice(-50);
      await base44.asServiceRole.entities.RingMinePlayer.update(player.id, { withdrawal_history: JSON.stringify(history) });

      return new Response(JSON.stringify({
        ok: true,
        mudd_ore_spent: oreAmount,
        mudd_sent: muddAmount,
        remaining_ore: remainingOre,
        wallet: walletAddress,
        status: transferStatus,
        tx_hash: txHash || undefined,
        error: transferError || undefined,
        explorer: `https://testnet.tonscan.org/address/${walletAddress}`
      }), { headers: { "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ ok: false, error: "Unknown action" }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500, headers: { "Content-Type": "application/json" }
    });
  }
});
