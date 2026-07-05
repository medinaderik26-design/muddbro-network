import { 
  Contract, 
  ContractProvider, 
  Sender, 
  Address, 
  beginCell, 
  Cell 
} from '@ton/core';

export class MuddbroGearCollection implements Contract {
  constructor(readonly address: Address) {}

  static createFromAddress(address: Address) {
    return new MuddbroGearCollection(address);
  }

  // Mint single gear NFT (called by MudForge backend)
  async sendMint(
    provider: ContractProvider, 
    via: Sender, 
    opts: {
      itemIndex: number;
      itemContent: Cell;        // Our TEP-62 metadata JSON as Cell
      ownerAddress: Address;
    }
  ) {
    await provider.internal(via, {
      value: "0.05", // enough for mint + storage
      body: beginCell()
        .storeUint(1, 32)           // op::mint
        .storeUint(opts.itemIndex, 64)
        .storeAddress(opts.ownerAddress)
        .storeRef(opts.itemContent)
        .endCell()
    });
  }

  // Get collection data (TEP-62 get_collection_data)
  async getCollectionData(provider: ContractProvider) {
    const { stack } = await provider.get('get_collection_data', []);
    const nextItemIndex = stack.readNumber();
    const contentRoot = stack.readCell();
    const ownerAddress = stack.readAddress();
    return { nextItemIndex, contentRoot, ownerAddress };
  }

  // Get NFT item address by index (TEP-62 get_nft_address_by_index)
  async getNftAddressByIndex(provider: ContractProvider, index: number) {
    const { stack } = await provider.get('get_nft_address_by_index', [
      { type: 'int', value: BigInt(index) }
    ]);
    return stack.readAddress();
  }

  // Get NFT item content (TEP-62 get_nft_content)
  async getNftContent(provider: ContractProvider, index: number, individualContent: Cell) {
    const { stack } = await provider.get('get_nft_content', [
      { type: 'int', value: BigInt(index) },
      { type: 'cell', cell: individualContent }
    ]);
    return stack.readCell();
  }
}
