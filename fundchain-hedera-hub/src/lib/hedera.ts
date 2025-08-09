import { Contract, BrowserProvider, JsonRpcProvider } from "ethers";
import { CONTRACTS, MicroInvestingPoolABI } from "@/config/contracts";

export const getRpc = () =>
  new JsonRpcProvider(
    CONTRACTS.network === "mainnet"
      ? "https://mainnet.hashio.io/api"
      : "https://testnet.hashio.io/api"
  );

export const getReadPool = () => new Contract(CONTRACTS.microInvestingPool, MicroInvestingPoolABI as any, getRpc());
export const getWritePool = async (provider: BrowserProvider) => new Contract(CONTRACTS.microInvestingPool, MicroInvestingPoolABI as any, await provider.getSigner());
