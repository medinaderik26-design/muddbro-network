# Muddbro Network — Security Guidelines

## Secrets Management

### NEVER commit secrets to git
- All API keys, bot tokens, and seed phrases must be stored in environment variables
- The `.env` file is gitignored — never stage or commit it
- Use `.env.example` as a template for required variables

### Required Secrets
| Variable | Description | Where to Get |
|---|---|---|
| `TELEGRAM_BOT_TOKEN_2_2` | Ring Mine bot token | @BotFather |
| `TELEGRAM_BOT_TOKEN_4` | Inner Earth bot token | @BotFather |
| `TON_SEED_PHRASE` | 24-word G0 wallet seed | Tonkeeper recovery phrase |
| `GROQ_API_KEY` | Groq API key for Queen's Protocol | console.groq.com |

### Secret Storage Options (Production)
1. **Base44 Secrets** — Built-in encrypted secret storage (recommended for deployed functions)
2. **GitHub Repo Secrets** — For CI/CD workflows (Settings → Secrets and variables → Actions)
3. **Environment Variables** — Set directly in the deployment environment

## Input Validation

All public endpoints (backend functions, bot webhooks) must validate incoming data:

- **Telegram IDs**: Must match `/^\d{5,20}$/`
- **TON addresses**: Must match `/^[UE0k]Q[A-Za-z0-9_\-]{46,48}$/`
- **Numeric inputs**: Must be positive, finite numbers
- **String inputs**: Must be length-bounded and sanitized

Use the validation helpers in `config.ts`:
```ts
import { isValidTelegramId, isValidTonAddress, isPositiveNumber, checkRateLimit } from "../config.ts";
```

## Rate Limiting

A simple in-memory rate limiter is provided in `config.ts`:
```ts
import { checkRateLimit } from "../config.ts";

// 30 requests per minute per IP/ID
if (!checkRateLimit(telegramId, 30, 60_000)) {
  return new Response(JSON.stringify({ ok: false, error: "Rate limited" }), { status: 429 });
}
```

For production, consider upgrading to a persistent rate limiter (Redis or similar).

## Wallet Security

- The G0 Architect wallet (V5R1, networkGlobalId: -3) holds 10M MUDD on testnet
- The seed phrase is stored as a Base44 Secret (`TON_SEED_PHRASE`)
- Wallet operations use `@ton/ton@15.0.0` + `@ton/crypto@3.2.0`
- All withdrawal operations deduct MuddOre BEFORE sending on-chain (prevents double-spend)
- Withdrawal history is persisted to the `RingMinePlayer` entity

## CORS Policy

All backend functions set `Access-Control-Allow-Origin: *` for Telegram Web App compatibility.
For production with a custom domain, consider restricting to your specific domain.

## Reporting Issues

If you discover a security vulnerability, please report it privately to Derik Medina.
Do not open a public GitHub issue for security vulnerabilities.
