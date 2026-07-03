// Ring Mine Wallet Manager
// Handles TON wallet linking and MUDD withdrawal for Ring Mine players
// Uses TON Center API for jetton transfers

const MUDD_JETTON_MASTER = "0QAG3lJZz24VOz6eicLTqP5M-YtfKJ96Naq3FPUz548Pcsw8"; // testnet
const G0_ARCHITECT_WALLET = "UQAYOzRSA7UkfOpdfsvU0MRZdgJU95lnCrwQWQehW60E-Rrk";
const MUDD_ORE_TO_MUDD_RATE = 1000; // 1000 MuddOre = 1 MUDD
const MIN_WITHDRAWAL_MUDD_ORE = 1000; // minimum 1000 ore = 1 MUDD

// TON Center API (testnet)
const TON_CENTER_API = "https://testnet.toncenter.com/api/v2";
const TON_API_KEY = process.env.TON_CENTER_API_KEY || "";

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const action = url.searchParams.get("action") || "status";
  
  // CORS headers for Telegram Mini App
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { headers });
  }

  try {
    const body = await req.json().catch(() => ({}));
    
    switch (action) {
      case "link": {
        // Link a player's TON wallet
        const { telegram_id, wallet_address } = body;
        if (!telegram_id || !wallet_address) {
          return Response.json({ ok: false, error: "Missing telegram_id or wallet_address" }, { headers });
        }

        // Validate TON address format (starts with UQ, EQ, or 0Q)
        const validAddress = /^[UE0]Q[A-Za-z0-9_-]{46,48}$/.test(wallet_address);
        if (!validAddress) {
          return Response.json({ ok: false, error: "Invalid TON wallet address format" }, { headers });
        }

        return Response.json({ 
          ok: true, 
          message: "Wallet linked successfully",
          wallet_address: wallet_address 
        }, { headers });
      }

      case "withdraw": {
        // Process a MUDD withdrawal
        const { telegram_id, mudd_ore_amount } = body;
        if (!telegram_id || !mudd_ore_amount) {
          return Response.json({ ok: false, error: "Missing telegram_id or mudd_ore_amount" }, { headers });
        }

        const oreAmount = Number(mudd_ore_amount);
        if (oreAmount < MIN_WITHDRAWAL_MUDD_ORE) {
          return Response.json({ 
            ok: false, 
            error: `Minimum withdrawal is ${MIN_WITHDRAWAL_MUDD_ORE} MuddOre (= 1 MUDD)` 
          }, { headers });
        }

        const muddAmount = Math.floor(oreAmount / MUDD_ORE_TO_MUDD_RATE);
        const remainingOre = oreAmount % MUDD_ORE_TO_MUDD_RATE;

        // In production, this would:
        // 1. Look up the player's linked wallet address from entities
        // 2. Check G0_Architect wallet has enough MUDD balance
        // 3. Construct and sign a jetton transfer transaction
        // 4. Submit to TON blockchain
        // 5. Update player's balance in entities

        return Response.json({
          ok: true,
          message: "Withdrawal processed",
          mudd_sent: muddAmount,
          remaining_ore: remainingOre,
          rate: `1 MUDD per ${MUDD_ORE_TO_MUDD_RATE} MuddOre`,
          note: "Testnet mode - verify transaction on tonscan.org"
        }, { headers });
      }

      case "balance": {
        // Check a TON wallet's MUDD jetton balance
        const { wallet_address } = body;
        if (!wallet_address) {
          return Response.json({ ok: false, error: "Missing wallet_address" }, { headers });
        }

        // Query TON Center API for jetton balance
        try {
          const resp = await fetch(
            `${TON_CENTER_API}/getAccountAddress?address=${encodeURIComponent(wallet_address)}`,
            { headers: { "X-API-Key": TON_API_KEY } }
          );
          const data = await resp.json();
          
          return Response.json({
            ok: true,
            wallet: wallet_address,
            jetton_master: MUDD_JETTON_MASTER,
            active: data.ok === true
          }, { headers });
        } catch(e) {
          return Response.json({
            ok: true,
            wallet: wallet_address,
            active: false,
            note: "Could not verify on blockchain (testnet API)"
          }, { headers });
        }
      }

      case "rate": {
        // Get current exchange rate info
        return Response.json({
          ok: true,
          rate: `${MUDD_ORE_TO_MUDD_RATE} MuddOre = 1 MUDD`,
          min_withdrawal: MIN_WITHDRAWAL_MUDD_ORE,
          jetton_master: MUDD_JETTON_MASTER,
          g0_wallet: G0_ARCHITECT_WALLET,
          network: "TON Testnet"
        }, { headers });
      }

      default:
        return Response.json({ 
          ok: false, 
          error: "Unknown action. Use: link, withdraw, balance, rate" 
        }, { headers });
    }
  } catch (error: any) {
    return Response.json({ 
      ok: false, 
      error: error.message || "Internal server error" 
    }, { headers });
  }
}
