import { useWallet } from "../hooks/useWallet";

const WalletConnect = () => {
  const { isConnected, accountId, loading, connectWallet, disconnectWallet } =
    useWallet();

  if (loading) {
    return <button disabled>Connecting...</button>;
  }

  if (isConnected) {
    return (
      <div>
        <span>Connected: {accountId}</span>
        <button onClick={disconnectWallet}>Disconnect</button>
      </div>
    );
  }

  return <button onClick={connectWallet}>Connect Wallet</button>;
};

export default WalletConnect;
