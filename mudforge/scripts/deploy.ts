// deploy-nft-collection.ts
// Deploys MudForge Gear NFT Collection to TON testnet
// Run: deno run --allow-net --allow-read --allow-env mudforge/scripts/deploy.ts

import { TonClient, WalletContractV5R1, beginCell, toNano, Address, internal, SendMode, Cell } from '@ton/ton';
import { mnemonicToPrivateKey } from '@ton/crypto';
import * as fs from 'fs';

const TESTNET_ENDPOINT = "https://testnet.toncenter.com/api/v2/jsonRPC";
const SEED_PHRASE = Deno.env.get("TON_SEED_PHRASE") || "";

// Load compiled BOCs
const collectionCode = Cell.fromBoc(fs.readFileSync("mudforge/contracts/nft-collection.boc"))[0];
const itemCode = Cell.fromBoc(fs.readFileSync("mudforge/contracts/nft-item.boc"))[0];

async function main() {
  if (!SEED_PHRASE) {
    console.error("TON_SEED_PHRASE not set");
    return;
  }

  // Derive G0 wallet key
  const mnemonicArray = SEED_PHRASE.trim().split(/\s+/);
  
  // Use browser shims for Deno
  if (!(globalThis as any).Buffer) {
    (globalThis as any).Buffer = await import("node:buffer").then(m => m.Buffer);
  }

  const keyPair = await mnemonicToPrivateKey(mnemonicArray);
  const publicKey = keyPair.publicKey;

  // G0 wallet (V5R1, testnet, networkGlobalId -3)
  const client = new TonClient({ endpoint: TESTNET_ENDPOINT });
  
  // Create wallet using V5R1 with networkGlobalId -3
  const wallet = WalletContractV5R1.create({
    publicKey: publicKey,
    workchain: 0,
    subwalletNumber: 0,
    networkGlobalId: -3,
  });

  console.log("G0 Wallet:", wallet.address.toString({ testOnly: true, bounceable: true }));
  
  const walletContract = client.open(wallet);
  const balance = await walletContract.getBalance();
  console.log("Balance:", Number(balance) / 1e9, "TON");

  if (balance < toNano("0.5")) {
    console.error("Insufficient balance for deployment. Need at least 0.5 TON.");
    return;
  }

  // Build collection initial data
  // Storage: admin_addr | balance | content | item_code | royalty_params | next_index
  const adminAddr = wallet.address;  // G0 is the admin
  
  // Content: off-chain metadata URI
  const content = beginCell()
    .storeUint(0x01, 8)  // off-chain marker
    .storeStringTail("https://muddbro.network/nft/mudforge-genesis.json")
    .endCell();

  // Royalty params: 5% to G0
  const royaltyParams = beginCell()
    .storeUint(5, 16)       // numerator (5%)
    .storeUint(100, 16)     // denominator
    .storeAddress(adminAddr) // destination
    .endCell();

  // Collection data cell
  const collectionData = beginCell()
    .storeAddress(adminAddr)
    .storeCoins(0)              // initial balance
    .storeRef(content)          // off-chain metadata
    .storeRef(itemCode)         // NFT item code
    .storeRef(royaltyParams)    // royalty params
    .storeUint(0, 64)           // next item index = 0
    .endCell();

  // State init for collection contract
  const stateInit = beginCell()
    .storeUint(0, 2)    // no ticktock
    .storeUint(1, 1)    // has code
    .storeUint(1, 1)    // has data
    .storeUint(0, 1)    // no library
    .storeRef(collectionCode)
    .storeRef(collectionData)
    .endCell();

  // Compute collection address
  const collectionAddrHash = stateInit.hash();
  const collectionAddress = new Address(0, collectionAddrHash);
  console.log("Collection Address:", collectionAddress.toString({ testOnly: true, bounceable: true }));

  // Build deploy message
  const seqno = await walletContract.getSeqno();
  console.log("Current seqno:", seqno);

  const deployMessage = walletContract.createTransfer({
    seqno,
    secretKey: keyPair.secretKey,
    messages: [
      internal({
        to: collectionAddress,
        value: toNano("0.5"),  // 0.5 TON for storage
        init: { code: collectionCode, data: collectionData },
        body: beginCell().endCell(),  // empty body = just deploy
        sendMode: SendMode.PAY_GAS_SEPARATELY,
      }),
    ],
  });

  console.log("Sending deploy transaction...");
  const txHash = await walletContract.send(deployMessage);
  console.log("Deploy tx hash:", txHash);
  console.log("Collection deployed at:", collectionAddress.toString({ testOnly: true, bounceable: true }));
  console.log("Explorer:", `https://testnet.tonscan.org/address/${collectionAddress.toString({ testOnly: true })}`);
  
  // Save address for reference
  fs.writeFileSync("mudforge/contracts/collection-address.txt", 
    collectionAddress.toString({ testOnly: true, bounceable: true }) + "\n");
  console.log("Address saved to mudforge/contracts/collection-address.txt");
}

main().catch(console.error);
