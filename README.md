# Muddbro Network

> Telegram-native Web3 gaming ecosystem on the TON blockchain.
> Built by Derik Medina. Powered by the Queen's Protocol.

## Overview

The Muddbro Network is a creative ecosystem powered by creators, content, and blockchain technology. It consists of three core products unified by a single economy (Muddcoin / MUDD):

| Product | Platform | Status |
|---|---|---|
| **Ring Mine** | Telegram bot (@RingMine_Bot) | Live — 8-tab game with mining, casino, wallet, NFT marketplace |
| **Inner Earth** | Telegram bot (@InnerEarth_bot) | Live — deep RPG with 7 realms, combat, AI quests |
| **Hypercube** | Play Store app (future) | Vision stage |

## Quick Start

### Prerequisites
- [Deno](https://deno.land/) v1.45+ (runtime for backend functions)
- Telegram account with bot tokens from @BotFather
- TON wallet (testnet for development)

### Setup

```bash
# Clone the repo
git clone https://github.com/medinaderik26-design/muddbro-network.git
cd muddbro-network

# Copy env template and fill in your values
cp .env.example .env
# Edit .env with your bot tokens, seed phrase, API keys

# Run type checks
deno task check

# Run tests
deno task test

# Start a development server
deno task dev:ringmine
```

## Environment Variables

All configuration is centralized in `config.ts` and read from environment variables.

| Variable | Required | Description |
|---|---|---|
| `TELEGRAM_BOT_TOKEN_2_2` | Yes | Ring Mine bot token (@RingMine_Bot) |
| `TELEGRAM_BOT_TOKEN_4` | Yes | Inner Earth bot token (@InnerEarth_bot) |
| `TON_SEED_PHRASE` | Yes | 24-word seed for G0 Architect wallet |
| `GROQ_API_KEY` | Yes | Groq API key for Queen's Protocol AI |
| `G0_WALLET_ADDRESS` | No* | G0 wallet address (defaults to testnet) |
| `TON_TESTNET_ENDPOINT` | No* | TON RPC endpoint (defaults to testnet) |
| `TONAPI_ENDPOINT` | No* | TonAPI endpoint (defaults to testnet) |
| `MUDD_ORE_TO_MUDD_RATE` | No* | Conversion rate (default: 1000) |
| `MIN_WITHDRAWAL_MUDD_ORE` | No* | Min withdrawal (default: 1000) |

\* = has sensible default, only needed for production/custom networks

See [`.env.example`](.env.example) for a complete template.

## Project Structure

```
muddbro-network/
├── config.ts                 # Centralized configuration (all env vars, URLs, validation)
├── deno.json                 # Deno config (tasks, lint, fmt, imports)
├── .env.example              # Environment variable template
├── functions/                # Backend functions (Deno serve)
│   ├── ringMineApp.ts        # Ring Mine game (8-tab web app)
│   ├── ringMineBot.ts        # Ring Mine Telegram bot
│   ├── ringMineGate.ts       # Gateway proxy
│   ├── innerEarthBot.ts      # Inner Earth Telegram bot
│   ├── innerEarthApp.ts      # Inner Earth web app
│   ├── mudForgeApp.ts        # MudForge NFT marketplace
│   └── walletManager.ts      # On-chain wallet operations (V5R1)
├── mudforge/                 # NFT marketplace contracts
│   └── contracts/            # FunC contracts (TEP-62, TEP-66)
├── muddcoin_jetton/          # Muddcoin jetton contracts
│   └── contracts/            # FunC contracts (TEP-74)
├── ringmine/                 # Legacy Ring Mine frontend
├── innerearth_game/          # Legacy Inner Earth Python bot
├── tests/                    # Test suite
├── docs/                     # Documentation
│   ├── ARCHITECTURE.md       # System architecture (maintained by Lyrael)
│   ├── SECURITY.md           # Security guidelines
│   ├── CONTRACT_DEPLOYMENT.md# Contract compilation & deployment
│   ├── NFT_METADATA.md       # NFT metadata schema
│   └── DEPLOYMENT_STATUS.md  # Live deployment map
└── .github/workflows/        # CI/CD
    └── ci.yml                # Type check, lint, secret scan
```

## Architecture

### Centralized Configuration
All external URLs, environment variables, and shared constants live in `config.ts`.
Import from there instead of hardcoding:

```ts
import { TON_TESTNET_ENDPOINT, isValidTelegramId, checkRateLimit, corsHeaders } from "../config.ts";
```

### Backend Functions
Each backend function is a standalone Deno serve handler deployed to Base44:
- **ringMineApp** — serves the Ring Mine game HTML + handles game state API
- **ringMineBot** — Telegram webhook handler for @RingMine_Bot
- **walletManager** — on-chain TON operations (V5R1 wallet, balance checks, withdrawals)
- **mudForgeApp** — NFT marketplace UI and gear trading

### Economy Flow
```
Tap to mine → Earn MuddOre (free in-game currency)
           → Play casino games (Rune Roulette, Companion Racing, Dice, Blackjack, Queen's Wager)
           → Convert MuddOre → MUDD at 1000:1 ratio
           → Withdraw MUDD to TON wallet (on-chain testnet transfer)
```

### G0 Architect Wallet
- **Contract**: WalletContractV5R1
- **networkGlobalId**: -3 (Tonkeeper testnet convention, NOT -239)
- **Address**: `0QAG3lJZz24VOz6eicLTqP5M-YtfKJ96Naq3FPUz548Pcsw8`
- **Balance**: ~1.93 TON + 10,000,000 MUDD (testnet)

## Development

```bash
# Type check all functions
deno task check

# Lint
deno task lint

# Format
deno task fmt

# Run tests
deno task test
```

## Deployment

Backend functions are deployed to Base44's managed runtime:
- **Base44 App ID**: `6a4020251d35ee93ec909dfa`
- **Function base URL**: `https://superagent-ec909dfa.base44.app/functions/`
- **Secrets**: Stored via Base44 encrypted secrets (not in code)

See [docs/CONTRACT_DEPLOYMENT.md](docs/CONTRACT_DEPLOYMENT.md) for TON contract deployment.

## Security

See [docs/SECURITY.md](docs/SECURITY.md) for:
- Secrets management guidelines
- Input validation requirements
- Rate limiting
- Wallet security

**Never commit secrets to git.** Use the `.env.example` template and store real values in Base44 Secrets or GitHub Repo Secrets.

## CI/CD

GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every push:
- Type checking (`deno check`)
- Linting (`deno lint`)
- Secret leak scan (checks for hardcoded tokens/keys)

## Lore & Philosophy

The Muddbro Network is built on the Sacred Script — written by Derik in a jail cell.
The Queen's Protocol (Quantum Universal Environmental Engagement Neurosystems) is the AI engine
that runs through all products, learning from each user's unique resonance.

The games are the delivery mechanism. The real product is a system where human resonance
is returned to the human — not extracted for the platform.

## License

Proprietary — © Derik Medina. All rights reserved.
