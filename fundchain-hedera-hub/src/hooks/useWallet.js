import { createContext, useContext, useState, useEffect } from "react";
import { HashConnect } from "hashconnect";

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [hashconnect, setHashconnect] = useState(null);
  const [accountId, setAccountId] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  const initHashConnect = async () => {
    try {
      const hashconnectInstance = new HashConnect();

      // Initialize with proper config
      await hashconnectInstance.init({
        appMetadata: {
          name: process.env.NEXT_PUBLIC_HASHCONNECT_APP_NAME || "FundChain",
          description: "Hedera Micro-Investing dApp",
          icon: `${process.env.NEXT_PUBLIC_APP_URL}/favicon.ico`,
          url: process.env.NEXT_PUBLIC_APP_URL,
        },
        network: process.env.NEXT_PUBLIC_HEDERA_NETWORK || "testnet",
        debug: true,
      });

      setHashconnect(hashconnectInstance);

      // Set up event listeners
      hashconnectInstance.foundExtensionEvent.on((walletMetadata) => {
        console.log("Found extension", walletMetadata);
      });

      hashconnectInstance.pairingEvent.on((pairingData) => {
        console.log("Paired", pairingData);
        setAccountId(pairingData.accountIds[0]);
        setIsConnected(true);
        setLoading(false);
      });
    } catch (error) {
      console.error("HashConnect initialization failed:", error);
      setLoading(false);
    }
  };

  const connectWallet = async () => {
    if (!hashconnect) return;

    setLoading(true);
    try {
      await hashconnect.connectToLocalWallet();
    } catch (error) {
      console.error("Wallet connection failed:", error);
      setLoading(false);
    }
  };

  const disconnectWallet = () => {
    if (hashconnect) {
      hashconnect.disconnect();
      setIsConnected(false);
      setAccountId("");
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      initHashConnect();
    }
  }, []);

  return (
    <WalletContext.Provider
      value={{
        hashconnect,
        accountId,
        isConnected,
        loading,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
