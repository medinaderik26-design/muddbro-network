// NFT Minter — Direct deploy from G0 wallet (bypasses collection contract)
// Mints TEP-62 NFT items using the MudForge item code
// NOTE: seqno/balance fetched via tonapi.io REST (not toncenter TonClient) to avoid
// aggressive rate-limiting on this function's outbound IP. BOC is built here and
// returned for the caller to send via toncenter from a different IP (sandbox curl).

(globalThis as any).window = globalThis;
(globalThis as any).document = { createElement: () => ({ style: {}, setAttribute: () => {}, appendChild: () => {} }) };
(globalThis as any).location = { pathname: "/", href: "http://localhost" };
import { Buffer } from "node:buffer";
(globalThis as any).Buffer = Buffer;

const G0_WALLET_BOUNCEABLE = "kQAG3lJZz24VOz6eicLTqP5M-YtfKJ96Naq3FPUz548PcpH5";
const G0_WALLET_NONBOUNCE = "0QAG3lJZz24VOz6eicLTqP5M-YtfKJ96Naq3FPUz548Pcsw8";

// NFT item code (compiled FunC → BOC, base64)
const NFT_ITEM_CODE_BOC = "te6ccgECCAEAAWwAART/APSkE/S88sgLAQIBYgIDA+rQMiHHAJFb4NDTAwFxsJFb4PpAMAHTH9M/2zyCEF/MPR5ScLrjAjIzghAvyyaiUlC6jjQxM4IJMS0AcPsCghCLdxc1cCCAEMjLBVAHzxYh+gIWywAVywAUyx/LPxLL/wHPFsmAQPsA4DKCEFn8wLcUuuMCXwQHBAUBEaEfn7Z44IKIBwcB/DZQYscFjvMB+kD6QNMAAZLUMd76ADAgwgCOK4IQi3cXNXAggBDIywUmzxZQBPoCE8sAEssAyx9SQMs/UjDL/yXPFslw+wCRMOJQNEVQ2zyCCTEtAHD7AoIQ1TJ223AggBDIywVQBM8WIfoCE8sAEssAyx/LP8mAQPsAkl8F4gYAZhPHBY4rggkxLQBw+wKCENUydttwIIAQyMsFUATPFiH6AhPLABLLAMsfyz/JgED7AJFb4gAeyFAEzxYSzMs/Ac8Wye1UABbtRND6QNTTP/pAMA==";

// Collection address (raw format for cell storage)
const COLLECTION_RAW = "0:2277cb5f0cd6cd2cb1d60c89d16e118afd17effe8b91b4bee8722b5f32fd3b28";

const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, GET, OPTIONS", "Access-Control-Allow-Headers": "Content-Type", "Content-Type": "application/json" };

async function tonapiSeqno(): Promise<number> {
  const resp = await fetch(`https://testnet.tonapi.io/v2/blockchain/accounts/${G0_WALLET_NONBOUNCE}/methods/seqno`);
  const data = await resp.json();
  if (!data.success) throw new Error("seqno fetch failed: " + JSON.stringify(data));
  const raw = data.stack?.[0]?.num;
  return parseInt(raw, 16);
}

async function tonapiBalance(): Promise<number> {
  const resp = await fetch(`https://testnet.tonapi.io/v2/blockchain/accounts/${G0_WALLET_BOUNCEABLE}`);
  const data = await resp.json();
  return Number(data.balance || 0);
}

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

    // ── Status check (uses tonapi.io REST, not toncenter, to avoid rate limit) ──
    if (action === "status") {
      const seqno = await tonapiSeqno();
      const balance = await tonapiBalance();
      return new Response(JSON.stringify({
        ok: true,
        seqno,
        balance_ton: balance / 1e9,
        can_mint: balance > 50_000_000,
        item_code_loaded: true
      }), { headers: corsHeaders });
    }

    // ── Build mint BOC (does NOT send it — caller sends via toncenter from a different IP) ──
    if (action === "build_mint_boc") {
      const { secretKey, ton } = await getG0Wallet();
      const { wallet } = await getG0Wallet();
      const { toNano, beginCell, Cell, Address, storeStateInit, storeMessage, internal } = ton;

      const itemCodeCell = Cell.fromBase64(NFT_ITEM_CODE_BOC);

      const seqno = typeof body.seqno === "number" ? body.seqno : await tonapiSeqno();
      const balance = await tonapiBalance();
      if (balance < 50_000_000) {
        return new Response(JSON.stringify({ ok: false, error: "Insufficient TON balance", balance_ton: balance / 1e9, needed: 0.05 }), { headers: corsHeaders });
      }

      const metadata = body.metadata || {};
      const metadataJson = JSON.stringify({
        name: metadata.name || `MudForge Gear #${body.item_index || 0}`,
        description: metadata.description || "",
        image: metadata.image || "",
        attributes: metadata.attributes || []
      });

      const contentCell = beginCell()
        .storeUint(1, 8)
        .storeStringTail(metadataJson)
        .endCell();

      const collectionAddr = Address.parseRaw(COLLECTION_RAW);
      const ownerAddr = Address.parseFriendly(G0_WALLET_BOUNCEABLE).address;

      const dataCell = beginCell()
        .storeAddress(ownerAddr)
        .storeRef(contentCell)
        .storeUint(body.item_index || 0, 64)
        .storeAddress(collectionAddr)
        .endCell();

      const stateInit = { code: itemCodeCell, data: dataCell };

      const stateInitCell = beginCell().storeWritable(storeStateInit(stateInit)).endCell();
      const itemHash = stateInitCell.hash();
      const itemAddress = new Address(0, itemHash);

      const transferBody = beginCell()
        .storeUint(0x59fcc0b7, 32) // op::transfer_ownership
        .storeUint(0, 64)
        .storeAddress(ownerAddr)
        .endCell();

      const outMsg = internal({
        to: itemAddress.toString({ testOnly: true, bounceable: true }),
        value: toNano("0.05"),
        body: transferBody,
        init: stateInit,
        bounce: true
      });

      const transfer = wallet.createTransfer({
        seqno,
        secretKey,
        messages: [outMsg]
      });

      const extMsg = {
        info: { type: 'external-in' as const, dest: wallet.address, importFee: 0n },
        body: transfer
      };

      const bocCell = beginCell().storeWritable(storeMessage(extMsg as any)).endCell();
      const bocBase64 = bocCell.toBoc().toString("base64");

      return new Response(JSON.stringify({
        ok: true,
        boc: bocBase64,
        item_address: itemAddress.toString({ testOnly: true, bounceable: false }),
        item_address_bounceable: itemAddress.toString({ testOnly: true, bounceable: true }),
        item_index: body.item_index || 0,
        seqno_used: seqno,
        metadata_name: metadata.name || ""
      }), { headers: corsHeaders });
    }

    return new Response(JSON.stringify({ ok: false, error: `Unknown action: ${action}` }), { headers: corsHeaders });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e), stack: (e as any)?.stack?.substring(0, 500) }), { headers: corsHeaders });
  }
});
