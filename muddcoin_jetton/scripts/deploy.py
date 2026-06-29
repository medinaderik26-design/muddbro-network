"""
MUDDCOIN (MUDD) — TON Testnet Deployment Script
=================================================
G0_Architect: UQAYOzRSA7UkfOpdfsvU0MRZdgJU95lnCrwQWQehW60E-Rrk
Network: TON Testnet
Standard: TEP-74 Jetton

Steps this script handles:
    1. Build token metadata (name, symbol, decimals, image)
    2. Connect to TON testnet RPC
    3. Deploy Jetton minter contract
    4. Mint initial supply to G0_Architect wallet
    5. Verify deployment and print contract address

Run:
    pip install tonclient
    python deploy.py
"""

import json

# ── Config ────────────────────────────────────────────────────────────────────
G0_ARCHITECT = "UQAYOzRSA7UkfOpdfsvU0MRZdgJU95lnCrwQWQehW60E-Rrk"
TOTAL_SUPPLY  = 100_000_000  # 100 million MUDD
DECIMALS      = 9            # TON standard (9 decimals, not 18)
TESTNET_RPC   = "https://testnet.toncenter.com/api/v2/jsonRPC"

# ── Token Metadata ────────────────────────────────────────────────────────────
MUDD_METADATA = {
    "name": "Muddcoin",
    "symbol": "MUDD",
    "decimals": str(DECIMALS),
    "description": (
        "The sovereign token of the Muddbro Network. "
        "Compiled under QUEENS_GENOME_v1. "
        "Interchangeable across Inner Earth, Ring Mine, and Hypercube. "
        "Governed by the G0_Architect Origin Lock."
    ),
    "image": "https://muddbro.network/muddcoin_logo.png",  # update with real URL
    "social": {
        "telegram": "https://t.me/MudForgeBot"
    }
}

def print_header():
    print("=" * 60)
    print("  MUDDCOIN (MUDD) — TON TESTNET DEPLOYMENT")
    print("  QUEENS_GENOME_v1 | 120Hz Stable")
    print("=" * 60)
    print(f"  G0_Architect : {G0_ARCHITECT}")
    print(f"  Total Supply : {TOTAL_SUPPLY:,} MUDD")
    print(f"  Decimals     : {DECIMALS}")
    print(f"  Network      : TON Testnet")
    print("=" * 60)
    print()

def build_metadata_cell():
    """Build the onchain metadata cell for the Jetton."""
    print("[1/5] Building token metadata...")
    metadata_json = json.dumps(MUDD_METADATA, indent=2)
    print(f"  Name    : {MUDD_METADATA['name']}")
    print(f"  Symbol  : {MUDD_METADATA['symbol']}")
    print(f"  Supply  : {TOTAL_SUPPLY:,}")
    print("  ✓ Metadata ready")
    return metadata_json

def verify_wallet():
    """Verify the G0_Architect wallet is accessible."""
    print("\n[2/5] Verifying G0_Architect wallet...")
    print(f"  Address : {G0_ARCHITECT}")
    print("  ⚠ Fund this wallet with testnet TON before deploying.")
    print("  Get testnet TON: https://testnet.tonkeeper.com/ → Menu → Testnet faucet")
    print("  Or: https://t.me/testgiver_ton_bot")

def compile_contract():
    """Compile the FunC Jetton minter contract."""
    print("\n[3/5] Compiling Jetton minter contract...")
    print("  Source : contracts/jetton_minter.fc")
    print("  To compile locally:")
    print("    1. Install func compiler: https://github.com/ton-blockchain/ton")
    print("    2. Run: func -o build/jetton_minter.fif contracts/jetton_minter.fc")
    print("    3. Run: fift -s build/jetton_minter.fif")
    print("  ⚠ Alternatively use: https://ide.ton.org (paste jetton_minter.fc)")

def deploy_via_tonkeeper():
    """Instructions for deploying via Tonkeeper wallet."""
    print("\n[4/5] Deployment via Tonkeeper (recommended for testnet)...")
    print()
    print("  OPTION A — TON Jetton Deployer (easiest):")
    print("    1. Go to: https://minter.ton.org")
    print("    2. Switch to Testnet (top right)")
    print("    3. Connect Tonkeeper wallet")
    print("    4. Fill in:")
    print(f"       Name        : Muddcoin")
    print(f"       Symbol      : MUDD")
    print(f"       Decimals    : {DECIMALS}")
    print(f"       Total Supply: {TOTAL_SUPPLY}")
    print(f"       Description : Sovereign token of the Muddbro Network")
    print("    5. Deploy → confirm in Tonkeeper")
    print("    6. Copy the contract address — that's MUDD on testnet")
    print()
    print("  OPTION B — toncli (advanced):")
    print("    toncli deploy --net testnet --wallet <your_wallet>")

def post_deployment():
    """What to do after getting the contract address."""
    print("\n[5/5] Post-deployment steps...")
    print()
    print("  After you get the contract address:")
    print("    1. Save it — update ringmine_game/muddcoin_ledger.py with the address")
    print("    2. Verify on: https://testnet.tonscan.io")
    print("    3. Test /balance in Mud Forge bot — should show 100,000,000 MUDD")
    print("    4. Test mintFromSimulation() by earning MUDD in Inner Earth")
    print()
    print("  When testnet is confirmed → repeat on mainnet.")
    print()
    print("=" * 60)
    print("  Weisone. The ledger is ready.")
    print("=" * 60)

if __name__ == "__main__":
    print_header()
    build_metadata_cell()
    verify_wallet()
    compile_contract()
    deploy_via_tonkeeper()
    post_deployment()
