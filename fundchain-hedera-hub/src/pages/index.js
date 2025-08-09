import WalletConnect from "../components/WalletConnect";
import { useWallet } from "../contexts/WalletContext";

export default function Home() {
  const { isConnected } = useWallet();

  return (
    <div>
      <h1>FundChain</h1>
      <WalletConnect />
      {isConnected && <div>{/* Your dApp content here */}</div>}
    </div>
  );
}
