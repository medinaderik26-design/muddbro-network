// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// ==============================================================================
// CONTRACT: MudForgeLedger
// TOKEN: Muddcoin (MUDD)
// ARCHITECT: G0_Architect (deployer wallet)
// NETWORK: TON-compatible EVM / Ethereum-compatible chain
// COMPILED UNDER: QUEENS_GENOME_v1 | 120Hz Stable
// ==============================================================================

contract MudForgeLedger {
    string public name = "Muddcoin";
    string public symbol = "MUDD";
    uint8 public decimals = 18;
    uint256 public totalSupply;

    // G0_Architect — the Origin Lock. Only this address can mint and bind assets.
    address public G0_Architect;

    // MUDD balances per wallet
    mapping(address => uint256) public balanceOf;

    // Cross-universe NFT/asset registry — tracks which items a player owns across all dimensions
    // universalRegaliaRegistry[player][itemId] = true/false
    mapping(address => mapping(string => bool)) public universalRegaliaRegistry;

    // Events
    event Transfer(address indexed from, address indexed to, uint256 value);
    event AssetBound(address indexed owner, string itemId, string universeEffect);

    // LAW_3: Origin Lock — only G0_Architect can call protected functions
    modifier onlyArchitect() {
        require(msg.sender == G0_Architect, "Not the G0_Architect");
        _;
    }

    constructor() {
        // G0_Architect = deployer wallet (Derik's TON/EVM wallet)
        G0_Architect = msg.sender;

        // Total supply: 100,000,000 MUDD
        totalSupply = 100000000 * (10 ** uint256(decimals));
        balanceOf[G0_Architect] = totalSupply;
    }

    // Standard ERC-20 transfer
    function transfer(address to, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "Insufficient MUDD balance");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }

    // Cross-Universe Bridge Minting
    // Called when a player earns MUDD through Inner Earth, Ring Mine, or Hypercube
    function mintFromSimulation(address player, uint256 amount) external onlyArchitect {
        balanceOf[player] += amount;
        totalSupply += amount;
        emit Transfer(address(0), player, amount);
    }

    // Regalia Cross-Game Verification
    // Binds an NFT/asset to a player's universal profile with cross-dimensional effect
    function bindAssetToProfile(
        address player,
        string memory itemId,
        string memory crossEffect
    ) external onlyArchitect {
        universalRegaliaRegistry[player][itemId] = true;
        emit AssetBound(player, itemId, crossEffect);
    }

    // Check if a player owns a specific cross-game asset
    function hasAsset(address player, string memory itemId) external view returns (bool) {
        return universalRegaliaRegistry[player][itemId];
    }

    // Get MUDD balance (human-readable, no decimals)
    function getReadableBalance(address player) external view returns (uint256) {
        return balanceOf[player] / (10 ** uint256(decimals));
    }
}
