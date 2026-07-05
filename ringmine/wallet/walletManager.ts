import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Ring Mine Wallet Manager
// Handles TON wallet linking and MUDD withdrawal for Ring Mine players
// Economy: 1000 MuddOre (free in-game) = 1 MUDD (TON testnet jetton)
// Min withdrawal: 1000 MuddOre to prevent gas drain from micro-transactions

const G0_ARCHITECT_WALLET = "UQAYOzRSA7UkfOpdfsvU0MRZdgJU95lnCrwQWQehW60E-Rrk";
const MUDD_JETTON_MASTER = "0QAG3lJZz24VOz6eicLTqP5M-YtfKJ96Naq3FPUz548Pcsw8";
const MUDD_ORE_TO_MUDD_RATE = 1000;
const MIN_WITHDRAWAL_MUDD_ORE = 1000;

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({
      ok: true,
      service: "Ring Mine Wallet Manager",
      actions: ["link_wallet", "get_wallet", "withdraw", "get_rate", "get_history"],
      economy: {
        rate: `${MUDD_ORE_TO_MUDD_RATE} MuddOre = 1 MUDD`,
        min_withdrawal: MIN_WITHDRAWAL_MUDD_ORE,
        jetton_master: MUDD_JETTON_MASTER,
        g0_wallet: G0_ARCHITECT_WALLET,
        network: "TON Testnet"
      }
    }), { headers: { "Content-Type": "application/json" } });
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

    // ── LINK WALLET ──────────────────────────────────────────────────────
    if (body.action === "link_wallet") {
      const walletAddress = String(body.wallet_address || "").trim();

      if (!walletAddress) {
        return new Response(JSON.stringify({ ok: false, error: "Missing wallet_address" }), {
          headers: { "Content-Type": "application/json" }
        });
      }

      // Validate TON address format (UQ, EQ, or 0Q prefix + 46-48 base64 chars)
      const validAddress = /^[UE0]Q[A-Za-z0-9_\-]{46,48}$/.test(walletAddress);
      if (!validAddress) {
        return new Response(JSON.stringify({
          ok: false,
          error: "Invalid TON address format. Should start with UQ, EQ, or 0Q followed by 46-48 characters."
        }), { headers: { "Content-Type": "application/json" } });
      }

      // Find player record
      const players = await base44.asServiceRole.entities.RingMinePlayer.filter({ telegram_id: telegramId });
      if (!players || players.length === 0) {
        return new Response(JSON.stringify({ ok: false, error: "Player not found. Open Ring Mine first." }), {
          headers: { "Content-Type": "application/json" }
        });
      }

      const player = players[0];

      // Save wallet address to player entity
      await base44.asServiceRole.entities.RingMinePlayer.update(player.id, {
        ton_wallet_address: walletAddress
      });

      // Also update state_data JSON blob if it exists
      if (player.state_data) {
        try {
          const state = JSON.parse(player.state_data);
          state.tonWallet = walletAddress;
          await base44.asServiceRole.entities.RingMinePlayer.update(player.id, {
            state_data: JSON.stringify(state)
          });
        } catch (e) { /* state_data parse failed, skip */ }
      }

      return new Response(JSON.stringify({
        ok: true,
        message: "Wallet linked successfully",
        wallet_address: walletAddress,
        player_name: player.full_name || "Miner"
      }), { headers: { "Content-Type": "application/json" } });
    }

    // ── GET WALLET (check if linked) ─────────────────────────────────────
    if (body.action === "get_wallet") {
      const players = await base44.asServiceRole.entities.RingMinePlayer.filter({ telegram_id: telegramId });
      if (!players || players.length === 0) {
        return new Response(JSON.stringify({ ok: false, error: "Player not found" }), {
          headers: { "Content-Type": "application/json" }
        });
      }

      const player = players[0];
      const walletAddress = player.ton_wallet_address || "";
      const oreBalance = player.mudd_ore_balance || 0;
      const muddBalance = player.mudd_balance || 0;

      // Also check state_data for ore (primary source in current game)
      let stateOre = 0;
      if (player.state_data) {
        try {
          const state = JSON.parse(player.state_data);
          stateOre = state.ore || 0;
        } catch (e) { /* ignore */ }
      }

      return new Response(JSON.stringify({
        ok: true,
        wallet_linked: !!walletAddress,
        wallet_address: walletAddress,
        mudd_ore_balance: Math.max(oreBalance, stateOre),
        mudd_balance: muddBalance,
        total_withdrawn: player.total_withdrawn || 0,
        can_withdraw: Math.max(oreBalance, stateOre) >= MIN_WITHDRAWAL_MUDD_ORE,
        min_withdrawal: MIN_WITHDRAWAL_MUDD_ORE
      }), { headers: { "Content-Type": "application/json" } });
    }

    // ── WITHDRAW (convert MuddOre to MUDD) ───────────────────────────────
    if (body.action === "withdraw") {
      const oreAmount = Number(body.mudd_ore_amount || 0);

      if (oreAmount < MIN_WITHDRAWAL_MUDD_ORE) {
        return new Response(JSON.stringify({
          ok: false,
          error: `Minimum withdrawal is ${MIN_WITHDRAWAL_MUDD_ORE} MuddOre (= 1 MUDD)`
        }), { headers: { "Content-Type": "application/json" } });
      }

      // Find player
      const players = await base44.asServiceRole.entities.RingMinePlayer.filter({ telegram_id: telegramId });
      if (!players || players.length === 0) {
        return new Response(JSON.stringify({ ok: false, error: "Player not found" }), {
          headers: { "Content-Type": "application/json" }
        });
      }

      const player = players[0];

      // Check wallet is linked
      const walletAddress = player.ton_wallet_address || "";
      if (!walletAddress) {
        return new Response(JSON.stringify({
          ok: false,
          error: "No TON wallet linked. Use link_wallet first."
        }), { headers: { "Content-Type": "application/json" } });
      }

      // Get current ore balance from state_data (primary) or entity field
      let currentOre = player.mudd_ore_balance || 0;
      let stateData: any = null;
      if (player.state_data) {
        try {
          stateData = JSON.parse(player.state_data);
          currentOre = Math.max(currentOre, stateData.ore || 0);
        } catch (e) { /* ignore */ }
      }

      // Check sufficient balance
      if (currentOre < oreAmount) {
        return new Response(JSON.stringify({
          ok: false,
          error: `Insufficient MuddOre. You have ${currentOre}, tried to withdraw ${oreAmount}.`
        }), { headers: { "Content-Type": "application/json" } });
      }

      // Calculate MUDD amount
      const muddAmount = Math.floor(oreAmount / MUDD_ORE_TO_MUDD_RATE);
      const remainingOre = currentOre - oreAmount;
      const leftoverOre = oreAmount % MUDD_ORE_TO_MUDD_RATE; // dust stays as ore

      // Build withdrawal record
      const withdrawalRecord = {
        date: new Date().toISOString(),
        mudd_ore_amount: oreAmount,
        mudd_sent: muddAmount,
        wallet: walletAddress,
        tx_hash: "", // will be filled when on-chain tx is confirmed
        status: "pending"
      };

      // Update withdrawal history
      let history: any[] = [];
      if (player.withdrawal_history) {
        try { history = JSON.parse(player.withdrawal_history); } catch (e) { history = []; }
      }
      history.push(withdrawalRecord);
      // Keep last 50 withdrawals
      if (history.length > 50) history = history.slice(-50);

      // Update player entity: deduct ore, add to total withdrawn, save history
      const updateData: any = {
        mudd_ore_balance: remainingOre + leftoverOre,
        total_withdrawn: (player.total_withdrawn || 0) + muddAmount,
        withdrawal_history: JSON.stringify(history)
      };

      // Also update state_data ore if it exists
      if (stateData) {
        stateData.ore = remainingOre + leftoverOre;
        updateData.state_data = JSON.stringify(stateData);
      }

      await base44.asServiceRole.entities.RingMinePlayer.update(player.id, updateData);

      // ── ON-CHAIN TRANSFER ──────────────────────────────────────────────
      // In simulation mode, we record the withdrawal as "pending"
      // When G0_Architect wallet private key is configured as a secret,
      // this section will construct and submit the actual jetton transfer
      // transaction on the TON testnet.
      //
      // The transfer will use:
      //   - G0_ARCHITECT_WALLET as sender
      //   - walletAddress as recipient
      //   - MUDD_JETTON_MASTER for jetton identification
      //   - muddAmount as the jetton amount (in nano-MUDD, so * 10^9)
      //
      // For now, the withdrawal is recorded as an IOU in the database.
      // The G0_Architect can batch-process pending withdrawals manually
      // or via an automation that triggers when the private key is set up.

      return new Response(JSON.stringify({
        ok: true,
        message: "Withdrawal processed",
        mudd_ore_spent: oreAmount,
        mudd_sent: muddAmount,
        remaining_ore: remainingOre + leftoverOre,
        wallet: walletAddress,
        rate: `${MUDD_ORE_TO_MUDD_RATE} MuddOre = 1 MUDD`,
        status: "pending",
        note: "MUDD tokens will be sent to your TON wallet. Transaction recorded as IOU pending on-chain transfer.",
        tx_explorer: `https://testnet.tonscan.org/address/${walletAddress}`
      }), { headers: { "Content-Type": "application/json" } });
    }

    // ── GET HISTORY ──────────────────────────────────────────────────────
    if (body.action === "get_history") {
      const players = await base44.asServiceRole.entities.RingMinePlayer.filter({ telegram_id: telegramId });
      if (!players || players.length === 0) {
        return new Response(JSON.stringify({ ok: false, error: "Player not found" }), {
          headers: { "Content-Type": "application/json" }
        });
      }

      const player = players[0];
      let history: any[] = [];
      if (player.withdrawal_history) {
        try { history = JSON.parse(player.withdrawal_history); } catch (e) { history = []; }
      }

      return new Response(JSON.stringify({
        ok: true,
        total_withdrawn: player.total_withdrawn || 0,
        withdrawal_count: history.length,
        history: history.slice(-20) // last 20 withdrawals
      }), { headers: { "Content-Type": "application/json" } });
    }

    // ── GET RATE (public info) ───────────────────────────────────────────
    if (body.action === "get_rate") {
      return new Response(JSON.stringify({
        ok: true,
        rate: `${MUDD_ORE_TO_MUDD_RATE} MuddOre = 1 MUDD`,
        min_withdrawal: MIN_WITHDRAWAL_MUDD_ORE,
        jetton_master: MUDD_JETTON_MASTER,
        g0_wallet: G0_ARCHITECT_WALLET,
        network: "TON Testnet"
      }), { headers: { "Content-Type": "application/json" } });
    }

    // ── UNKNOWN ACTION ───────────────────────────────────────────────────
    return new Response(JSON.stringify({
      ok: false,
      error: "Unknown action. Use: link_wallet, get_wallet, withdraw, get_history, get_rate"
    }), { headers: { "Content-Type": "application/json" } });

  } catch (e) {
    console.error("walletManager error:", e);
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      headers: { "Content-Type": "application/json" }
    });
  }
});
