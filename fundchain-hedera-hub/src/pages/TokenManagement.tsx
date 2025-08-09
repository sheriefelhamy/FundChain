import { Navbar } from "@/components/layout/Navbar";
import { Seo } from "@/components/seo/Seo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useWallet } from "@/components/wallet/WalletContext";
import { BrowserProvider, Contract } from "ethers";
import { CONTRACTS, HederaTokenServiceABI } from "@/config/contracts";

const TokenManagement = () => {
  const { getEthersProvider, evmAddress } = useWallet();
  const [token, setToken] = useState("");
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const getContract = async (provider: BrowserProvider) => new Contract(CONTRACTS.hederaTokenService, HederaTokenServiceABI as any, await provider.getSigner());

  const mint = async () => {
    try {
      const provider = getEthersProvider();
      if (!provider) throw new Error("Connect wallet first");
      const hts = await getContract(provider);
      const tx = await hts.mintToken(token, Number(amount));
      toast({ title: "Mint submitted", description: tx.hash });
      await tx.wait();
      toast({ title: "Mint successful" });
    } catch (e: any) {
      toast({ title: "Mint failed", description: e?.message || String(e) });
    }
  };

  const transfer = async () => {
    try {
      const provider = getEthersProvider();
      if (!provider) throw new Error("Connect wallet first");
      const hts = await getContract(provider);
      const tx = await hts.transferToken(token, evmAddress, recipient, Number(amount));
      toast({ title: "Transfer submitted", description: tx.hash });
      await tx.wait();
      toast({ title: "Transfer successful" });
    } catch (e: any) {
      toast({ title: "Transfer failed", description: e?.message || String(e) });
    }
  };

  return (
    <div className="min-h-screen">
      <Seo title="FundChain — Token Management" description="Mint and transfer HTS tokens via precompile." />
      <Navbar />
      <main className="container mx-auto py-10 max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">Token Management</h1>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="token">Token (EVM address)</Label>
            <Input id="token" value={token} onChange={(e) => setToken(e.target.value)} placeholder="0x..." />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient (EVM address)</Label>
              <Input id="recipient" value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="0x..." />
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={mint}>Mint</Button>
            <Button variant="secondary" onClick={transfer}>Transfer</Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TokenManagement;
