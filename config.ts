// ─────────────────────────────────────────────
// Muddbro Network — Centralized Configuration
// ─────────────────────────────────────────────
// All external endpoints, env vars, and constants in one place.
// Import from here instead of hardcoding URLs/keys in individual files.

// ── Base44 ──
export const BASE44_APP_ID = Deno.env.get("BASE44_APP_ID") || "6a4020251d35ee93ec909dfa";
export const BASE44_FUNCTION_BASE = Deno.env.get("BASE44_FUNCTION_BASE_URL") || `https://superagent-ec909dfa.base44.app/functions`;
export const BASE44_API_BASE = `https://base44.app/api/apps/${BASE44_APP_ID}`;
export const BASE44_CDN_BASE = `${BASE44_API_BASE}/files/mp/public/${BASE44_APP_ID}`;

// ── Telegram ──
export const TELEGRAM_RINGMINE_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN_2_2") || "";
export const TELEGRAM_INNEREARTH_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN_4") || "";
export const TELEGRAM_API_BASE = "https://api.telegram.org/bot";

// ── TON Blockchain ──
export const TON_TESTNET_ENDPOINT = Deno.env.get("TON_TESTNET_ENDPOINT") || "https://testnet.toncenter.com/api/v2/jsonRPC";
export const TONAPI_ENDPOINT = Deno.env.get("TONAPI_ENDPOINT") || "https://testnet.tonapi.io/v2";
export const G0_WALLET_ADDRESS = Deno.env.get("G0_WALLET_ADDRESS") || "0QAG3lJZz24VOz6eicLTqP5M-YtfKJ96Naq3FPUz548Pcsw8";
export const G0_WALLET_BOUNCEABLE = "kQAG3lJZz24VOz6eicLTqP5M-YtfKJ96Naq3FPUz548PcpH5";

// V5R1 wallet config (networkGlobalId: -3 is Tonkeeper's testnet convention)
export const G0_WALLET_CONFIG = {
  contractType: "V5R1" as const,
  networkGlobalId: -3,
  workchain: 0,
  subwalletNumber: 0,
};

// ── AI / LLM ──
export const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY") || "";
export const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

// ── Game Economy ──
export const MUDD_ORE_TO_MUDD_RATE = Number(Deno.env.get("MUDD_ORE_TO_MUDD_RATE") || 1000);
export const MIN_WITHDRAWAL_MUDD_ORE = Number(Deno.env.get("MIN_WITHDRAWAL_MUDD_ORE") || 1000);

// ── CORS Headers (shared) ──
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

// ── Validation Helpers ──
export function isValidTelegramId(id: string): boolean {
  return /^\d{5,20}$/.test(String(id));
}

export function isValidTonAddress(addr: string): boolean {
  return /^[UE0k]Q[A-Za-z0-9_\-]{46,48}$/.test(addr);
}

export function isPositiveNumber(n: unknown): n is number {
  return typeof n === "number" && n > 0 && Number.isFinite(n);
}

// ── Rate Limiter (simple in-memory) ──
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, maxRequests: number = 30, windowMs: number = 60_000): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  entry.count++;
  return entry.count <= maxRequests;
}

// ── Helper: G0 wallet derivation ──
export async function getG0Wallet() {
  let seed = Deno.env.get("TON_SEED_PHRASE") || "";
  if (!seed) throw new Error("TON_SEED_PHRASE not configured");
  // Fix potential "objectsimple" concatenation from double-entry
  seed = seed.replace(/objectsimple/g, "object simple");
  const mnemonicArray = seed.trim().split(/\s+/).filter((w: string) => w.length > 0).slice(0, 24);
  if (mnemonicArray.length !== 24) throw new Error(`Expected 24 seed words, got ${mnemonicArray.length}`);

  const { mnemonicToPrivateKey } = await import("npm:@ton/crypto@3.2.0");
  const kp = await mnemonicToPrivateKey(mnemonicArray);
  const { Buffer } = await import("node:buffer");
  const pubKey = Buffer.from(kp.publicKey);
  const secretKey = Buffer.from(kp.secretKey);

  const ton = await import("npm:@ton/ton@15.0.0");
  const walletId = {
    networkGlobalId: G0_WALLET_CONFIG.networkGlobalId,
    context: { workchain: G0_WALLET_CONFIG.workchain, walletVersion: "v5r1" as const, subwalletNumber: G0_WALLET_CONFIG.subwalletNumber },
  };
  const wallet = ton.WalletContractV5R1.create({ workchain: G0_WALLET_CONFIG.workchain, publicKey: pubKey, walletId: walletId as any });
  return { wallet, pubKey, secretKey, ton };
}

export async function getBalanceViaAPI(address: string) {
  try {
    const resp = await fetch(`${TONAPI_ENDPOINT}/blockchain/accounts/${address}`);
    if (resp.ok) {
      const data = await resp.json();
      return { balance: Number(data.balance || 0), status: data.status || "unknown" };
    }
  } catch (e) {
    // fall through to default
  }
  return { balance: 0, status: "error" };
}
