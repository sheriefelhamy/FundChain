import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { BrowserProvider, JsonRpcProvider, formatEther } from "ethers";
import type { ReactNode } from "react";
import * as HashConnectLib from "hashconnect";

export type HederaNetwork = "testnet" | "mainnet";

interface WalletState {
  accountId: string | null;
  evmAddress: string | null;
  balanceHBAR: string | null;
  network: HederaNetwork;
  connecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  getEthersProvider: () => BrowserProvider | null;
}

const WalletCtx = createContext<WalletState | null>(null);

export const useWallet = () => {
  const ctx = useContext(WalletCtx);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
};

const NETWORK_RPC: Record<HederaNetwork, string> = {
  testnet: "https://testnet.hashio.io/api",
  mainnet: "https://mainnet.hashio.io/api",
};

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [accountId, setAccountId] = useState<string | null>(null);
  const [evmAddress, setEvmAddress] = useState<string | null>(null);
  const [balanceHBAR, setBalanceHBAR] = useState<string | null>(null);
  const [network] = useState<HederaNetwork>("testnet");
  const [connecting, setConnecting] = useState(false);
  const [hashconnect, setHashconnect] = useState<any>(null);
  const [topic, setTopic] = useState<string | null>(null);

  const rpc = useMemo(() => new JsonRpcProvider(NETWORK_RPC[network]), [network]);

  useEffect(() => {
    // Initialize HashConnect lazily
    const hc = new (HashConnectLib as any).HashConnect();
    setHashconnect(hc);
  }, []);

  const getEthersProvider = () => {
    try {
      if (!(hashconnect && topic && accountId)) return null;
      const ProviderClass = (HashConnectLib as any).HashConnectProvider || (HashConnectLib as any).Provider || (hashconnect?.HashConnectProvider);
      if (!ProviderClass) return null;
      const eip1193Provider = new ProviderClass(hashconnect, network, topic, accountId);
      return new BrowserProvider(eip1193Provider as any);
    } catch (e) {
      return null;
    }
  };

  const refreshBalance = async (addr?: string) => {
    try {
      const target = addr || evmAddress;
      if (!target) return;
      const wei = await rpc.getBalance(target);
      setBalanceHBAR(parseFloat(formatEther(wei)).toFixed(4));
    } catch {}
  };

  const connect = async () => {
    if (!hashconnect) return;
    try {
      setConnecting(true);
      const appMetadata = {
        name: "FundChain",
        description: "FundChain Hedera dApp",
        icon: window.location.origin + "/favicon.ico",
      };
      const initRes = await (hashconnect as any).init(appMetadata, network, false);
      const state = await (hashconnect as any).connect();
      setTopic(state?.topic);
      await (hashconnect as any).connectToLocalWallet();
      (hashconnect as any).pairingEvent.on((data: any) => {
        const acct = data?.accountIds?.[0] || data?.accounts?.[0]?.accountId;
        const evm = data?.accounts?.[0]?.evmAddress || data?.evmAddress;
        if (acct) setAccountId(acct);
        if (evm) {
          setEvmAddress(evm);
          refreshBalance(evm);
        }
        toast({ title: "Wallet connected", description: acct || evm });
      });
    } catch (e: any) {
      toast({ title: "Wallet connect failed", description: e?.message || String(e) });
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = () => {
    setAccountId(null);
    setEvmAddress(null);
    setBalanceHBAR(null);
    setTopic(null);
    toast({ title: "Disconnected" });
  };

  useEffect(() => {
    if (evmAddress) refreshBalance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [evmAddress]);

  const value: WalletState = {
    accountId,
    evmAddress,
    balanceHBAR,
    network,
    connecting,
    connect,
    disconnect,
    getEthersProvider,
  };

  return <WalletCtx.Provider value={value}>{children}</WalletCtx.Provider>;
};
