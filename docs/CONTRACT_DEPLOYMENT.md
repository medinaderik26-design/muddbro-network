# Muddbro Network — Contract Deployment Guide

## Prerequisites

### TON Toolchain
Install the TON development tools:

```bash
# Install FUNC compiler (FunC)
# Option 1: Download pre-built binary
wget https://github.com/ton-blockchain/ton/releases/latest/download/func-linux-x86_64
chmod +x func-linux-x86_64
sudo mv func-linux-x86_64 /usr/local/bin/func

# Option 2: Build from source (requires Rust)
git clone https://github.com/ton-blockchain/ton
cd ton
cargo build --release

# Install lite-client (for deployment)
wget https://github.com/ton-blockchain/ton/releases/latest/download/lite-client-linux-x86_64
chmod +x lite-client-linux-x86_64
sudo mv lite-client-linux-x86_64 /usr/local/bin/lite-client

# Or use toncli (recommended for Python users)
pip install toncli
```

### Verify Installation
```bash
func --version
# Expected: FunC v0.4.0 or similar
```

## Contract Compilation

### MudForge NFT Collection (TEP-62)
```bash
# Compile the NFT collection contract
func -PA -o mudforge_collection.fif \
  mudforge/contracts/op-codes.fc \
  mudforge/contracts/nft-collection.fc

# Compile individual NFT item contract
func -PA -o mudforge_item.fif \
  mudforge/contracts/op-codes.fc \
  mudforge/contracts/nft-item.fc
```

### Muddcoin Jetton (TEP-74)
```bash
# Compile the jetton minter contract
func -PA -o muddcoin_minter.fif \
  muddcoin_jetton/contracts/jetton_minter.fc
```

## Deployment to TON Testnet

### Using toncli
```bash
# Initialize a new toncli project
toncli init muddforge-deploy
cd muddforge-deploy

# Add compiled contracts and deployment config
# Configure testnet network in toncli.yaml

# Deploy
toncli deploy -n testnet
```

### Using TypeScript (ton.js)
```bash
# Install dependencies
npm install @ton/ton @ton/crypto @ton/core

# Run deployment script
npx tsx scripts/deploy-nft-collection.ts
```

### Key Deployment Parameters
- **Network**: TON Testnet (chain ID: -3 for Tonkeeper testnet wallets)
- **Deployer**: G0 Architect wallet (`0QAG3lJZz24VOz6eicLTqP5M-YtfKJ96Naq3FPUz548Pcsw8`)
- **Workchain**: 0 (basechain)
- **Royalty**: 5% on secondary sales (TEP-66)
- **NFT Standard**: TEP-62 (NFT collection)
- **Metadata**: IPFS or on-chain (see `docs/NFT_METADATA.md`)

## Post-Deployment

1. **Verify contracts** on https://testnet.tonscan.org
2. **Mint initial gear NFTs** using the collection admin key
3. **Update `config.ts`** with deployed contract addresses
4. **Test minting** via the MudForge UI in Ring Mine
5. **Update Telegram bot** to reference new contract addresses

## Contract Addresses (Testnet)

| Contract | Address | Status |
|---|---|---|
| G0 Architect Wallet | `0QAG3lJZz24VOz6eicLTqP5M-YtfKJ96Naq3FPUz548Pcsw8` | Active, 1.93 TON |
| MUDD Jetton Master | TBD | Not yet deployed |
| MudForge NFT Collection | TBD | Not yet deployed |

## Troubleshooting

### "func: command not found"
Ensure func is in your PATH. On macOS, use `func-macos-x86_64` or `func-macos-arm64`.

### Deployment fails with "insufficient funds"
Ensure the deployer wallet has enough TON for deployment fees (~0.05 TON per contract).

### Address mismatch
The G0 wallet uses V5R1 with `networkGlobalId: -3` (not the standard -239). Make sure your deployment script uses the correct wallet config.
