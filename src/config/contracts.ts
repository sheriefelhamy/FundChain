export type Network = "testnet" | "mainnet";

export interface ContractsConfig {
  network: Network;
  microInvestingPool: string; // EVM address
  hederaTokenService: string; // precompile often at 0x167 (HTS)
}

// NOTE: Update these addresses to your deployed contract addresses
export const CONTRACTS: ContractsConfig = {
  network: "testnet",
  microInvestingPool: "0x0000000000000000000000000000000000000000",
  hederaTokenService: "0x0000000000000000000000000000000000000167",
};

// Minimal ABI fragments required by the UI. Replace with full ABIs from your repo for production.
export const MicroInvestingPoolABI = [
  // Reads
  {
    "type": "function",
    "name": "getAllAsks",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [
      {
        "type": "tuple[]",
        "components": [
          { "name": "id", "type": "uint256" },
          { "name": "business", "type": "string" },
          { "name": "amount", "type": "uint256" },
          { "name": "funded", "type": "uint256" },
          { "name": "status", "type": "uint8" }
        ]
      }
    ]
  },
  // Writes
  {
    "type": "function",
    "name": "createInvestmentAsk",
    "stateMutability": "nonpayable",
    "inputs": [
      { "name": "business", "type": "string" },
      { "name": "amount", "type": "uint256" },
      { "name": "description", "type": "string" }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "name": "invest",
    "stateMutability": "payable",
    "inputs": [
      { "name": "askId", "type": "uint256" }
    ],
    "outputs": []
  },
  // Event used in My Investments page (adjust to your actual contract)
  {
    "type": "event",
    "name": "Invested",
    "inputs": [
      { "name": "investor", "type": "address", "indexed": true },
      { "name": "askId", "type": "uint256", "indexed": false },
      { "name": "amount", "type": "uint256", "indexed": false }
    ],
    "anonymous": false
  }
] as const;

export const HederaTokenServiceABI = [
  // Minimal fragments for mint and transfer (precompile wrappers)
  {
    "type": "function",
    "name": "mintToken",
    "stateMutability": "nonpayable",
    "inputs": [
      { "name": "token", "type": "address" },
      { "name": "amount", "type": "int64" }
    ],
    "outputs": [{ "name": "newTotalSupply", "type": "int64" }]
  },
  {
    "type": "function",
    "name": "transferToken",
    "stateMutability": "nonpayable",
    "inputs": [
      { "name": "token", "type": "address" },
      { "name": "sender", "type": "address" },
      { "name": "recipient", "type": "address" },
      { "name": "amount", "type": "int64" }
    ],
    "outputs": []
  }
] as const;
