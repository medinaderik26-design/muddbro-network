// NFT Minter — Direct deploy from G0 wallet (bypasses collection contract)
// Mints TEP-62 NFT items using the MudForge item code

(globalThis as any).window = globalThis;
(globalThis as any).document = { createElement: () => ({ style: {}, setAttribute: () => {}, appendChild: () => {} }) };
(globalThis as any).location = { pathname: "/", href: "http://localhost" };
import { Buffer } from "node:buffer";
(globalThis as any).Buffer = Buffer;

const TON_TESTNET_ENDPOINT = "https://testnet.toncenter.com/api/v2/jsonRPC";
const G0_WALLET_BOUNCEABLE = "kQAG3lJZz24VOz6eicLTqP5M-YtfKJ96Naq3FPUz548PcpH5";

// NFT item code (compiled FunC → BOC, base64)
const NFT_ITEM_CODE_BOC = "te6ccgECCAEAAWwAART/APSkE/S88sgLAQIBYgIDA+rQMiHHAJFb4NDTAwFxsJFb4PpAMAHTH9M/2zyCEF/MPR5ScLrjAjIzghAvyyaiUlC6jjQxM4IJMS0AcPsCghCLdxc1cCCAEMjLBVAHzxYh+gIWywAVywAUyx/LPxLL/wHPFsmAQPsA4DKCEFn8wLcUuuMCXwQHBAUBEaEfn7Z44IKIBwcB/DZQYscFjvMB+kD6QNMAAZLUMd76ADAgwgCOK4IQi3cXNXAggBDIywUmzxZQBPoCE8sAEssAyx9SQMs/UjDL/yXPFslw+wCRMOJQNEVQ2zyCCTEtAHD7AoIQ1TJ223AggBDIywVQBM8WIfoCE8sAEssAyx/LP8mAQPsAkl8F4gYAZhPHBY4rggkxLQBw+wKCENUydttwIIAQyMsFUATPFiH6AhPLABLLAMsfyz/JgED7AJFb4gAeyFAEzxYSzMs/Ac8Wye1UABbtRND6QNTTP/pAMA==";

// Collection address (raw format for cell storage)
const COLLECTION_RAW = "0:b46e7d56cc9963a9955b0ad706e2f4087f06dfa38d886f62";

const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, GET, OPTIONS", "Access-Control-Allow-Headers": "Content-Type", "Content-Type": "application/json" };

async function getG0Wallet() {
  let seed = Deno.env.get("TON_SEED_PHRASE") || "";
  if (!seed) throw new Error("TON_SEED_PHRASE not configured");
  seed = seed.replace(/objectsimple/g, "object simple");
  const mnemonicArray = seed.trim().split(/\s+/).filter((w: string) => w.length > 0).slice(0, 24);
  if (mnemonicArray.length !== 24) throw new Error(`Expected 24 words, got ${mnemonicArray.length}`);
  const { mnemonicToPrivateKey } = await import("npm:@ton/crypto@3.2.0");
  const kp = await mnemonicToPrivateKey(mnemonicArray);
  const pubKey = Buffer.from(kp.publicKey);
  const secretKey = Buffer.from(kp.secretKey);
  const ton = await import("npm:@ton/ton@15.0.0");
  const walletId = { networkGlobalId: -3, context: { workchain: 0, walletVersion: "v5r1", subwalletNumber: 0 } };
  const wallet = ton.WalletContractV5R1.create({ workchain: 0, publicKey: pubKey, walletId });
  return { wallet, pubKey, secretKey, ton };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method === "GET") return new Response(JSON.stringify({ ok: true, service: "MudForge NFT Minter", wallet: G0_WALLET_BOUNCEABLE }), { headers: corsHeaders });
  if (req.method !== "POST") return new Response(JSON.stringify({ ok: false, error: "Use POST" }), { headers: corsHeaders });

  try {
    const body = await req.json();
    const action = body.action || "";

    // ── Status check ──
    if (action === "status") {
      const { wallet, ton } = await getG0Wallet();
      const { TonClient } = ton;
      const client = new TonClient({ endpoint: TON_TESTNET_ENDPOINT });
      const contract = client.open(wallet);
      const seqno = await contract.getSeqno();
      const balanceResp = await fetch(`https://testnet.tonapi.io/v2/blockchain/accounts/${G0_WALLET_BOUNCEABLE}`);
      const balanceData = await balanceResp.json();
      return new Response(JSON.stringify({
        ok: true,
        seqno,
        balance_ton: Number(balanceData.balance || 0) / 1e9,
        can_mint: Number(balanceData.balance || 0) > 50_000_000,
        item_code_loaded: true
      }), { headers: corsHeaders });
    }

    // ── Mint single NFT ──
    if (action === "mint") {
      const { wallet, secretKey, ton } = await getG0Wallet();
      const { TonClient, toNano, beginCell, Cell, Address, storeStateInit, storeMessage } = ton;

      // Parse item code from BOC
      const itemCodeCell = Cell.fromBase64(NFT_ITEM_CODE_BOC);

      // Get wallet seqno
      const client = new TonClient({ endpoint: TON_TESTNET_ENDPOINT });
      const walletContract = client.open(wallet);
      const seqno = await walletContract.getSeqno();

      // Check balance
      const balanceResp = await fetch(`https://testnet.tonapi.io/v2/blockchain/accounts/${G0_WALLET_BOUNCEABLE}`);
      const balanceData = await balanceResp.json();
      const balance = Number(balanceData.balance || 0);
      if (balance < 50_000_000) {
        return new Response(JSON.stringify({ ok: false, error: "Insufficient TON balance", balance_ton: balance / 1e9, needed: 0.05 }), { headers: corsHeaders });
      }

      // Build NFT metadata content cell
      // Format: uint8 version (1) + remaining bits = JSON string
      const metadata = body.metadata || {};
      const metadataJson = JSON.stringify({
        name: metadata.name || `MudForge Gear #${body.item_index || 0}`,
        description: metadata.description || "",
        image: metadata.image || "",
        attributes: metadata.attributes || []
      });

      const contentCell = beginCell()
        .storeUint(1, 8) // content version
        .storeStringTail(metadataJson)
        .endCell();

      // Build collection address cell
      const collectionAddr = Address.parseRaw(COLLECTION_RAW);

      // Build owner address
      const ownerAddr = Address.parseFriendly(G0_WALLET_BOUNCEABLE).address;

      // Build NFT item data cell
      // Layout: owner_addr (MsgAddress) + content (ref) + item_index (uint64) + collection_addr (MsgAddress)
      const dataCell = beginCell()
        .storeAddress(ownerAddr)
        .storeRef(contentCell)
        .storeUint(body.item_index || 0, 64)
        .storeAddress(collectionAddr)
        .endCell();

      // Build state init
      const stateInit = {
        code: itemCodeCell,
        data: dataCell
      };

      // Compute item address
      const stateInitCell = beginCell().storeWritable(storeStateInit(stateInit)).endCell();
      const itemHash = stateInitCell.hash();
      const itemAddress = new Address(0, itemHash);

      // Build transfer_ownership body
      // op: 0x59fcc0b7, query_id: 0, new_owner: ownerAddr
      const transferBody = beginCell()
        .storeUint(0x59fcc0b7, 32) // op::transfer_ownership
        .storeUint(0, 64) // query_id
        .storeAddress(ownerAddr) // new_owner
        .endCell();

      // Build the transfer from wallet
      const transfer = walletContract.createTransfer({
        seqno,
        secretKey,
        messages: [{
          address: itemAddress.toString({ testOnly: true, bounceable: true }),
          amount: toNano("0.05"),
          body: transferBody,
          init: stateInit
        }]
      });

      // Build external message and serialize
      const extMsg = {
        info: {
          type: 'external-in' as const,
          dest: wallet.address,
          importFee: 0n
        },
        body: transfer
      };

      const bocCell = beginCell().storeWritable(storeMessage(extMsg as any)).endCell();
      const bocBase64 = bocCell.toBoc().toString("base64");

      // Send via toncenter
      const sendResp = await fetch(TON_TESTNET_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: 1,
          jsonrpc: "2.0",
          method: "sendBoc",
          params: { boc: bocBase64 }
        })
      });
      const sendResult = await sendResp.json();

      const success = sendResult.ok || sendResult.result?.code === 0;
      return new Response(JSON.stringify({
        ok: success,
        item_address: itemAddress.toString({ testOnly: true, bounceable: false }),
        item_address_bounceable: itemAddress.toString({ testOnly: true, bounceable: true }),
        item_index: body.item_index || 0,
        seqno_used: seqno,
        metadata_name: metadata.name || "",
        image_url: metadata.image || "",
        tx_status: success ? "sent" : "failed",
        tx_error: success ? "" : JSON.stringify(sendResult.error || sendResult)
      }), { headers: corsHeaders });
    }

    return new Response(JSON.stringify({ ok: false, error: `Unknown action: ${action}` }), { headers: corsHeaders });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e), stack: (e as any)?.stack?.substring(0, 500) }), { headers: corsHeaders });
  }
});
