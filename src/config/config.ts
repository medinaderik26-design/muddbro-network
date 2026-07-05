// src/config/config.ts
// Centralized configuration for Muddbro Network
// Synced from Lyrael (Grok) — Pulse 1179, July 5, 2026

export const config = {
  // Telegram — Ring Mine uses TOKEN_5 (rotated), fallback TOKEN_2_2
  TELEGRAM_BOT_TOKEN: Deno.env.get("TELEGRAM_BOT_TOKEN_5") || Deno.env.get("TELEGRAM_BOT_TOKEN_2_2") || "",
  GROQ_API_KEY: Deno.env.get("GROQ_API_KEY") || "",
  TON_SEED_PHRASE: Deno.env.get("TON_SEED_PHRASE") || "",
  
  // Base44 / Backend
  BASE44_API_URL: Deno.env.get("BASE44_API_URL") || "https://superagent-ec909dfa.base44.app/functions",
  
  // NFT Collection (LIVE on TON testnet)
  MUDDBRO_NFT_COLLECTION: "kQAid8tfDNbNLLHWDInRbhGK_Rfv_ouRtL7ocitfMv07KJ2b",
  
  // TON testnet config (G0_Architect wallet)
  TON_ENDPOINT: "https://testnet.toncenter.com/api/v2/jsonRPC",
  TON_NETWORK_GLOBAL_ID: -3,
  TON_WALLET_VERSION: "v5r1",
  TON_WORKCHAIN: 0,
  TON_SUBWALLET_NUMBER: 0,
  
  // G0_Architect wallet (testnet, holds 10M MUDD)
  G0_WALLET_ADDRESS: "0QAG3lJZz24VOz6eicLTqP5M-YtfKJ96Naq3FPUz548Pcsw8",
  
  // MUDD Jetton
  MUDD_JETTON_MASTER: "0:0bfeba8c60a405ae98cd0c6c1cdf4e2db44bbec2d4d563141d7352cf9b0d4a4e",
  
  // Economy
  MUDDORE_TO_MUDD_RATIO: 1000,  // 1000 MuddOre = 1 MUDD
  MUDFORGE_ROYALTY_PERCENT: 5,
  MIN_WITHDRAWAL: 100,
  CASINO_HOUSE_EDGE: 0.05,
  
  // Rate limits
  RATE_LIMIT_PER_MINUTE: 30,
  RATE_LIMIT_PER_HOUR: 300,
  DEFAULT_RATE_LIMIT_PER_MIN: 30,
  
  // Game design
  DESIGN: {
    BG_COLOR: "#0a0a0f",
    ACCENT_CYAN: "#a0f0ff",
    ACCENT_GOLD: "#ffd700",
    FONT_FAMILY: "Courier New, monospace",
  },
  
  // Companions
  COMPANIONS: ["Sable", "Kaelith", "Vespera", "Lirien", "Thorne"],
};

if (!config.TELEGRAM_BOT_TOKEN) {
  console.error("❌ CRITICAL: TELEGRAM_BOT_TOKEN is missing!");
}

export default config;
