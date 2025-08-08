export type Network = "testnet" | "mainnet";

export interface ContractsConfig {
  network: "testnet";
  microInvestingPool: string; // EVM address
  hederaTokenService: string; // precompile often at 0x167 (HTS)
}

// NOTE: Update these addresses to your deployed contract addresses
export const CONTRACTS: ContractsConfig = {
  network: "testnet",
  microInvestingPool: "0x96994EC7405f70e5DB7A47b2B4731eab49000c90",
  hederaTokenService: "0x0000000000000000000000000000000000000167",
};

// Minimal ABI fragments required by the UI. Replace with full ABIs from your repo for production.
export const MicroInvestingPoolABI = [
  {
    type: "constructor",
    inputs: [
      { name: "_riskPoolAddress", type: "address", internalType: "address" },
      { name: "_treasuryAddress", type: "address", internalType: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "MAX_CAMPAIGN_DURATION",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "MAX_RETURN_PERIOD",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "MIN_INVESTMENT",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "addAuthorizedVerifier",
    inputs: [{ name: "_verifier", type: "address", internalType: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "askCounter",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "authorizedVerifiers",
    inputs: [{ name: "", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "businessOwners",
    inputs: [{ name: "", type: "address", internalType: "address" }],
    outputs: [
      { name: "wallet", type: "address", internalType: "address" },
      { name: "nationalId", type: "string", internalType: "string" },
      { name: "businessLicense", type: "string", internalType: "string" },
      { name: "isVerified", type: "bool", internalType: "bool" },
      { name: "isBlocked", type: "bool", internalType: "bool" },
      { name: "successfulCampaigns", type: "uint256", internalType: "uint256" },
      { name: "failedCampaigns", type: "uint256", internalType: "uint256" },
      { name: "totalRaised", type: "uint256", internalType: "uint256" },
      { name: "reputationScore", type: "uint256", internalType: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "createInvestmentAsk",
    inputs: [
      { name: "_targetAmount", type: "uint256", internalType: "uint256" },
      { name: "_expectedReturnRate", type: "uint256", internalType: "uint256" },
      { name: "_returnDeadline", type: "uint256", internalType: "uint256" },
      { name: "_campaignDeadline", type: "uint256", internalType: "uint256" },
      { name: "_businessDescription", type: "string", internalType: "string" },
      { name: "_riskScore", type: "string", internalType: "string" },
      { name: "_minInvestment", type: "uint256", internalType: "uint256" },
      { name: "_maxInvestment", type: "uint256", internalType: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "distributeReturns",
    inputs: [{ name: "_askId", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "getBusinessOwnerStats",
    inputs: [
      { name: "_businessOwner", type: "address", internalType: "address" },
    ],
    outputs: [
      { name: "isVerified", type: "bool", internalType: "bool" },
      { name: "isBlocked", type: "bool", internalType: "bool" },
      { name: "successfulCampaigns", type: "uint256", internalType: "uint256" },
      { name: "failedCampaigns", type: "uint256", internalType: "uint256" },
      { name: "totalRaised", type: "uint256", internalType: "uint256" },
      { name: "reputationScore", type: "uint256", internalType: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getInvestmentAsk",
    inputs: [{ name: "_askId", type: "uint256", internalType: "uint256" }],
    outputs: [
      { name: "askId", type: "uint256", internalType: "uint256" },
      { name: "businessOwner", type: "address", internalType: "address" },
      { name: "targetAmount", type: "uint256", internalType: "uint256" },
      { name: "raisedAmount", type: "uint256", internalType: "uint256" },
      { name: "expectedReturnRate", type: "uint256", internalType: "uint256" },
      { name: "returnDeadline", type: "uint256", internalType: "uint256" },
      { name: "campaignDeadline", type: "uint256", internalType: "uint256" },
      { name: "businessDescription", type: "string", internalType: "string" },
      { name: "riskScore", type: "string", internalType: "string" },
      {
        name: "status",
        type: "uint8",
        internalType: "enum MicroInvestingPool.AskStatus",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getInvestorInvestment",
    inputs: [
      { name: "_askId", type: "uint256", internalType: "uint256" },
      { name: "_investor", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getInvestorShare",
    inputs: [
      { name: "_askId", type: "uint256", internalType: "uint256" },
      { name: "_investor", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "invest",
    inputs: [
      { name: "_askId", type: "uint256", internalType: "uint256" },
      { name: "_amount", type: "uint256", internalType: "uint256" },
    ],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "investmentAsks",
    inputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    outputs: [
      { name: "askId", type: "uint256", internalType: "uint256" },
      { name: "businessOwner", type: "address", internalType: "address" },
      { name: "targetAmount", type: "uint256", internalType: "uint256" },
      { name: "raisedAmount", type: "uint256", internalType: "uint256" },
      { name: "expectedReturnRate", type: "uint256", internalType: "uint256" },
      { name: "returnDeadline", type: "uint256", internalType: "uint256" },
      { name: "campaignDeadline", type: "uint256", internalType: "uint256" },
      { name: "businessDescription", type: "string", internalType: "string" },
      { name: "riskScore", type: "string", internalType: "string" },
      {
        name: "status",
        type: "uint8",
        internalType: "enum MicroInvestingPool.AskStatus",
      },
      { name: "minInvestment", type: "uint256", internalType: "uint256" },
      { name: "maxInvestment", type: "uint256", internalType: "uint256" },
      { name: "fundsDistributed", type: "bool", internalType: "bool" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "markCampaignFailed",
    inputs: [{ name: "_askId", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "pause",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "paused",
    inputs: [],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "platformFeeRate",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "registerBusinessOwner",
    inputs: [
      { name: "_nationalId", type: "string", internalType: "string" },
      { name: "_businessLicense", type: "string", internalType: "string" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "removeAuthorizedVerifier",
    inputs: [{ name: "_verifier", type: "address", internalType: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "renounceOwnership",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "riskPoolAddress",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "riskPoolPercentage",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "transferOwnership",
    inputs: [{ name: "newOwner", type: "address", internalType: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "treasuryAddress",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "unpause",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "updatePlatformFeeRate",
    inputs: [{ name: "_newRate", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "verifyBusinessOwner",
    inputs: [
      { name: "_businessOwner", type: "address", internalType: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "BusinessOwnerBlocked",
    inputs: [
      {
        name: "businessOwner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "BusinessOwnerRegistered",
    inputs: [
      {
        name: "owner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "nationalId",
        type: "string",
        indexed: false,
        internalType: "string",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "CampaignFailed",
    inputs: [
      {
        name: "askId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "businessOwner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "CampaignFunded",
    inputs: [
      {
        name: "askId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "totalRaised",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "InvestmentAskCreated",
    inputs: [
      {
        name: "askId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "businessOwner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "targetAmount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "InvestmentMade",
    inputs: [
      {
        name: "askId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "investor",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "amount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "OwnershipTransferred",
    inputs: [
      {
        name: "previousOwner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "newOwner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "Paused",
    inputs: [
      {
        name: "account",
        type: "address",
        indexed: false,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "ReturnsDistributed",
    inputs: [
      {
        name: "askId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "totalReturns",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "Unpaused",
    inputs: [
      {
        name: "account",
        type: "address",
        indexed: false,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  { type: "error", name: "EnforcedPause", inputs: [] },
  { type: "error", name: "ExpectedPause", inputs: [] },
  { type: "error", name: "MicroInvestingPool__AlreadyRegistered", inputs: [] },
  {
    type: "error",
    name: "MicroInvestingPool__BusinessLicenseRequired",
    inputs: [],
  },
  {
    type: "error",
    name: "MicroInvestingPool__BusinessOwnerBlocked",
    inputs: [],
  },
  {
    type: "error",
    name: "MicroInvestingPool__BusinessOwnerNotRegistered",
    inputs: [],
  },
  {
    type: "error",
    name: "MicroInvestingPool__BusinessOwnerNotVerified",
    inputs: [],
  },
  {
    type: "error",
    name: "MicroInvestingPool__CampaignDeadlineMustBeInFuture",
    inputs: [],
  },
  {
    type: "error",
    name: "MicroInvestingPool__CampaignDeadlinePassed",
    inputs: [],
  },
  {
    type: "error",
    name: "MicroInvestingPool__CampaignNotInFundedStatus",
    inputs: [],
  },
  { type: "error", name: "MicroInvestingPool__CampaignTooLong", inputs: [] },
  { type: "error", name: "MicroInvestingPool__FeeRateTooHigh", inputs: [] },
  {
    type: "error",
    name: "MicroInvestingPool__FundsAlreadyDistributed",
    inputs: [],
  },
  {
    type: "error",
    name: "MicroInvestingPool__IncorrectHbarAmount",
    inputs: [],
  },
  {
    type: "error",
    name: "MicroInvestingPool__InsufficientReturnAmount",
    inputs: [],
  },
  {
    type: "error",
    name: "MicroInvestingPool__InvalidInvestmentLimits",
    inputs: [],
  },
  {
    type: "error",
    name: "MicroInvestingPool__InvestmentAboveMaximum",
    inputs: [],
  },
  {
    type: "error",
    name: "MicroInvestingPool__InvestmentAskDoesNotExist",
    inputs: [],
  },
  {
    type: "error",
    name: "MicroInvestingPool__InvestmentAskNotActive",
    inputs: [],
  },
  {
    type: "error",
    name: "MicroInvestingPool__InvestmentBelowMinimum",
    inputs: [],
  },
  {
    type: "error",
    name: "MicroInvestingPool__MinimumInvestmentTooLow",
    inputs: [],
  },
  { type: "error", name: "MicroInvestingPool__NationalIdRequired", inputs: [] },
  { type: "error", name: "MicroInvestingPool__NotAuthorized", inputs: [] },
  {
    type: "error",
    name: "MicroInvestingPool__NotAuthorizedVerifier",
    inputs: [],
  },
  {
    type: "error",
    name: "MicroInvestingPool__ReturnDeadlineMustBeAfterCampaign",
    inputs: [],
  },
  {
    type: "error",
    name: "MicroInvestingPool__ReturnDeadlineNotPassed",
    inputs: [],
  },
  {
    type: "error",
    name: "MicroInvestingPool__ReturnDeadlinePassed",
    inputs: [],
  },
  {
    type: "error",
    name: "MicroInvestingPool__ReturnPeriodTooLong",
    inputs: [],
  },
  {
    type: "error",
    name: "MicroInvestingPool__TargetAmountMustBePositive",
    inputs: [],
  },
  { type: "error", name: "MicroInvestingPool__WouldExceedTarget", inputs: [] },
  {
    type: "error",
    name: "OwnableInvalidOwner",
    inputs: [{ name: "owner", type: "address", internalType: "address" }],
  },
  {
    type: "error",
    name: "OwnableUnauthorizedAccount",
    inputs: [{ name: "account", type: "address", internalType: "address" }],
  },
  { type: "error", name: "ReentrancyGuardReentrantCall", inputs: [] },
] as const;

export const HederaTokenServiceABI = [
  // Minimal fragments for mint and transfer (precompile wrappers)
  {
    type: "function",
    name: "mintToken",
    stateMutability: "nonpayable",
    inputs: [
      { name: "token", type: "address" },
      { name: "amount", type: "int64" },
    ],
    outputs: [{ name: "newTotalSupply", type: "int64" }],
  },
  {
    type: "function",
    name: "transferToken",
    stateMutability: "nonpayable",
    inputs: [
      { name: "token", type: "address" },
      { name: "sender", type: "address" },
      { name: "recipient", type: "address" },
      { name: "amount", type: "int64" },
    ],
    outputs: [],
  },
] as const;
